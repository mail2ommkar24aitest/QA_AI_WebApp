const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Serve the generated Extent Reports statically
const REPORTS_DIR = path.resolve(__dirname, '../../reports');
app.use('/reports', express.static(REPORTS_DIR));

// Path to the absolute Maven executable found on the system
const MAVEN_CMD = 'C:\\Users\\omkar.qualitrix\\AI_MCP_Petstore\\.maven\\apache-maven-3.9.5\\bin\\mvn.cmd';
const WORKSPACE_DIR = path.resolve(__dirname, '../../');

// In-memory store for test runs
let currentRun = {
    status: 'IDLE', // IDLE, RUNNING, COMPLETED, FAILED
    logs: [],
    passCount: 0,
    failCount: 0,
    startTime: null,
    endTime: null,
    reportUrl: null
};

// Event stream clients for real-time log pushing
let sseClients = [];

/**
 * Helper to push status updates and logs in real-time to the React client
 */
function pushUpdate(type, data) {
    sseClients.forEach(client => {
        try {
            client.write(`data: ${JSON.stringify({ type, ...data })}\n\n`);
        } catch (err) {
            console.error('SSE Client Write Error:', err.message);
        }
    });
}

/**
 * Dynamic Cucumber Feature Parser
 * Scans resources/features and extracts all scenarios, features, and tags
 */
function parseFeatures() {
    const featuresDir = path.resolve(__dirname, '../../src/test/resources/features');
    const scenarios = [];
    const uniqueTags = new Set(['smoke', 'sanity', 'regression']);

    try {
        if (!fs.existsSync(featuresDir)) {
            return { scenarios, tags: Array.from(uniqueTags) };
        }

        const files = fs.readdirSync(featuresDir).filter(file => file.endsWith('.feature'));

        files.forEach(file => {
            const filePath = path.join(featuresDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            const lines = content.split('\n');

            let currentFeature = 'Unknown';
            let fileTags = [];
            let pendingTags = [];

            lines.forEach(line => {
                const trimmed = line.trim();

                // Match Tags (starts with @)
                if (trimmed.startsWith('@')) {
                    const lineTags = trimmed.split(/\s+/).map(t => t.replace('@', ''));
                    lineTags.forEach(t => {
                        uniqueTags.add(t);
                        pendingTags.push(t);
                    });
                }
                // Match Feature Title
                else if (trimmed.startsWith('Feature:')) {
                    currentFeature = trimmed.replace('Feature:', '').trim();
                    fileTags = [...pendingTags];
                    pendingTags = [];
                }
                // Match Scenario Title
                else if (trimmed.startsWith('Scenario:')) {
                    const scenarioName = trimmed.replace('Scenario:', '').trim();
                    const scenarioTags = [...fileTags, ...pendingTags];
                    pendingTags = [];

                    scenarios.push({
                        id: Math.random().toString(36).substring(2, 9),
                        name: scenarioName,
                        feature: currentFeature,
                        tags: scenarioTags,
                        file: file
                    });
                }
            });
        });
    } catch (e) {
        console.error('Failed parsing BDD feature files:', e);
    }

    return { scenarios, tags: Array.from(uniqueTags) };
}

// REST APIs
app.get('/api/scenarios', (req, res) => {
    const data = parseFeatures();
    res.json(data.scenarios);
});

app.get('/api/suites', (req, res) => {
    const data = parseFeatures();
    res.json(data.tags);
});

app.get('/api/status', (req, res) => {
    res.json(currentRun);
});

// SSE (Server-Sent Events) Endpoint for real-time log streaming
app.get('/api/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    sseClients.push(res);

    // Send current run state immediately upon connection
    res.write(`data: ${JSON.stringify({ type: 'INIT', run: currentRun })}\n\n`);

    req.on('close', () => {
        sseClients = sseClients.filter(c => c !== res);
    });
});

// API Trigger Run
app.post('/api/execute', (req, res) => {
    if (currentRun.status === 'RUNNING') {
        return res.status(400).json({ error: 'Another automation run is already in progress!' });
    }

    const { type, selected } = req.body;
    let filterString = '';

    if (type === 'suite') {
        // Run by tags e.g. @smoke
        filterString = `@${selected}`;
    } else if (type === 'scenarios') {
        // Run specific scenario names e.g. name('Successful Login')
        if (selected && selected.length > 0) {
            const nameFilters = selected.map(name => `name('${name}')`).join(' or ');
            filterString = `(${nameFilters})`;
        }
    }

    console.log(`Executing BDD Test Suite. Mode: [${type}] | Filter: [${filterString}]`);

    // Reset current run
    currentRun = {
        status: 'RUNNING',
        logs: [],
        passCount: 0,
        failCount: 0,
        startTime: new Date().toLocaleTimeString(),
        endTime: null,
        reportUrl: null
    };

    pushUpdate('START', currentRun);

    // Spawn Maven child process
    const args = ['clean', 'test'];
    if (filterString) {
        args.push(`"-Dcucumber.filter.tags=${filterString}"`);
    }

    console.log(`Command: ${MAVEN_CMD} ${args.join(' ')}`);

    const child = spawn(MAVEN_CMD, args, {
        cwd: WORKSPACE_DIR,
        shell: true
    });

    child.on('error', (err) => {
        console.error('Failed to spawn Maven process:', err);
        currentRun.status = 'FAILED';
        currentRun.logs.push(`ERROR: Failed to spawn Maven process: ${err.message}`);
        pushUpdate('FINISH', currentRun);
    });

    child.stdout.on('data', (data) => {
        const line = data.toString();
        // Skip excessively large progress or download bar logs to keep logs readable
        if (line.includes('Progress (') || line.includes('Download')) return;

        currentRun.logs.push(line);
        pushUpdate('LOG', { log: line });
    });

    child.stderr.on('data', (data) => {
        const line = data.toString();
        currentRun.logs.push(line);
        pushUpdate('LOG', { log: line });
    });

    child.on('close', (code) => {
        currentRun.endTime = new Date().toLocaleTimeString();
        currentRun.status = code === 0 ? 'COMPLETED' : 'FAILED';

        // Scan the logs for final surefire reports
        let passed = 0;
        let failed = 0;
        let skipped = 0;

        currentRun.logs.forEach(logLine => {
            // Match typical Cucumber / TestNG output counts
            if (logLine.includes('Tests run:') && logLine.includes('Failures:')) {
                const matches = logLine.match(/Tests run:\s*(\d+),\s*Failures:\s*(\d+),\s*Errors:\s*(\d+),\s*Skipped:\s*(\d+)/);
                if (matches) {
                    passed = parseInt(matches[1]) - parseInt(matches[2]) - parseInt(matches[4]);
                    failed = parseInt(matches[2]) + parseInt(matches[3]);
                    skipped = parseInt(matches[4]);
                }
            }
        });

        // If no matches, estimate from standard log parsing
        if (passed === 0 && failed === 0) {
            currentRun.logs.forEach(l => {
                if (l.includes('TEST PASSED')) passed++;
                if (l.includes('TEST FAILED')) failed++;
            });
        }

        currentRun.passCount = passed;
        currentRun.failCount = failed;
        currentRun.reportUrl = '/reports/ExtentReport.html';

        pushUpdate('FINISH', currentRun);
        console.log(`Execution Finished. Status: ${currentRun.status} | Exit Code: ${code}`);
    });

    res.json({ message: 'Automation suite triggered successfully.', run: currentRun });
});

// Port listener
app.listen(PORT, '127.0.0.1', () => {
    console.log(`==================================================`);
    console.log(`Automation Dashboard Backend started on port ${PORT}`);
    console.log(`REPORTS PATH: ${REPORTS_DIR}`);
    console.log(`WORKSPACE: ${WORKSPACE_DIR}`);
    console.log(`==================================================`);
});
