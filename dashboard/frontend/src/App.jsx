import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [tab, setTab] = useState('suites'); // 'suites' or 'scenarios'
  const [scenarios, setScenarios] = useState([]);
  const [suites, setSuites] = useState([]);
  
  // Selection States
  const [selectedSuite, setSelectedSuite] = useState('smoke');
  const [selectedScenarios, setSelectedScenarios] = useState([]);

  // Execution States (mirrored from backend in real-time)
  const [runStatus, setRunStatus] = useState('IDLE');
  const [logs, setLogs] = useState([]);
  const [passCount, setPassCount] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [reportUrl, setReportUrl] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const consoleEndRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Fetch initial scenarios and suite tags
  useEffect(() => {
    fetch('/api/scenarios')
      .then(res => res.json())
      .then(data => setScenarios(data))
      .catch(err => console.error('Failed to load scenarios:', err));

    fetch('/api/suites')
      .then(res => res.json())
      .then(data => {
        setSuites(data);
        if (data.length > 0 && !data.includes(selectedSuite)) {
          setSelectedSuite(data[0]);
        }
      })
      .catch(err => console.error('Failed to load suites:', err));
  }, []);

  // Connect to SSE log stream for real-time execution updates
  useEffect(() => {
    const sse = new EventSource('/api/stream');

    sse.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'INIT') {
        const r = data.run;
        setRunStatus(r.status);
        setLogs(r.logs);
        setPassCount(r.passCount);
        setFailCount(r.failCount);
        setStartTime(r.startTime);
        setEndTime(r.endTime);
        setReportUrl(r.reportUrl);

        if (r.status === 'RUNNING') {
          startTimer();
        }
      }
      else if (data.type === 'START') {
        setRunStatus(data.status);
        setLogs([]);
        setPassCount(0);
        setFailCount(0);
        setStartTime(data.startTime);
        setEndTime(null);
        setReportUrl(null);
        setTimerSeconds(0);
        startTimer();
      }
      else if (data.type === 'LOG') {
        setLogs(prev => [...prev, data.log]);
      }
      else if (data.type === 'FINISH') {
        setRunStatus(data.status);
        setPassCount(data.passCount);
        setFailCount(data.failCount);
        setEndTime(data.endTime);
        setReportUrl(data.reportUrl);
        stopTimer();
      }
    };

    return () => {
      sse.close();
      stopTimer();
    };
  }, []);

  // Auto-scroll the build logs window
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Dynamic ticking execution timer
  const startTimer = () => {
    stopTimer();
    timerIntervalRef.current = setInterval(() => {
      setTimerSeconds(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  // Click scenario checkbox toggle
  const toggleScenario = (name) => {
    if (selectedScenarios.includes(name)) {
      setSelectedScenarios(prev => prev.filter(item => item !== name));
    } else {
      setSelectedScenarios(prev => [...prev, name]);
    }
  };

  // Submit test run to Express Backend
  const handleTriggerRun = () => {
    const payload = {
      type: tab === 'scenarios' ? 'scenarios' : 'suite',
      selected: tab === 'scenarios' ? selectedScenarios : selectedSuite
    };

    if (tab === 'scenarios' && selectedScenarios.length === 0) {
      alert('Please select at least one BDD Scenario to run.');
      return;
    }

    fetch('/api/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .catch(err => alert('Failed triggering run: ' + err.message));
  };

  // Color log lines dynamically depending on severity
  const getLogClass = (line) => {
    if (line.includes('BUILD SUCCESS') || line.includes('PASSED') || line.includes('Scenario completed') && !line.includes('FAILED')) {
      return 'log-line success';
    }
    if (line.includes('BUILD FAILURE') || line.includes('FAILED') || line.includes('Exception') || line.includes('Error')) {
      return 'log-line error';
    }
    if (line.includes('WARNING') || line.includes('WARN') || line.includes('SKIPPED')) {
      return 'log-line warn';
    }
    if (line.includes('[INFO]') || line.includes('>>>') || line.includes('===') || line.includes('[BDD HOOK]')) {
      return 'log-line info';
    }
    return 'log-line';
  };

  // Format dynamic timer (e.g. 74 seconds -> "01:14")
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div>
      {/* Brand Header */}
      <header className="header-container">
        <div className="brand-section">
          <div className="brand-logo" />
          <h1 className="brand-title">SauceDemo Enterprise BDD Dashboard</h1>
        </div>
        
        {/* Real-time Dashboard Status Indicators */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: runStatus === 'RUNNING' ? 'var(--color-primary)' : 
                              runStatus === 'COMPLETED' ? 'var(--color-success)' :
                              runStatus === 'FAILED' ? 'var(--color-danger)' : 'var(--color-text-muted)',
              boxShadow: runStatus === 'RUNNING' ? '0 0 10px var(--color-primary)' : 'none'
            }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{runStatus}</span>
          </div>
          {runStatus === 'RUNNING' && (
            <div style={{ fontSize: '0.9rem', color: 'var(--color-primary)', fontWeight: 600 }}>
              Elapsed: {formatTime(timerSeconds)}
            </div>
          )}
        </div>
      </header>

      {/* Main Grid Workstation */}
      <main className="dashboard-grid">
        
        {/* Left Hand side: Test suite manager & selections */}
        <section className="glass-panel">
          <h2 className="panel-title">Execution Configurator</h2>
          
          {/* Toggles */}
          <div className="selector-tabs">
            <button 
              className={`tab-btn ${tab === 'suites' ? 'active' : ''}`}
              onClick={() => setTab('suites')}
              disabled={runStatus === 'RUNNING'}
            >
              Run by Suite (Tags)
            </button>
            <button 
              className={`tab-btn ${tab === 'scenarios' ? 'active' : ''}`}
              onClick={() => setTab('scenarios')}
              disabled={runStatus === 'RUNNING'}
            >
              Select Individual Scenarios
            </button>
          </div>

          {/* Suites Configuration tab */}
          {tab === 'suites' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Select an execution suite. The dashboard will trigger the Maven runner executing scenarios matched with that tag.
              </p>
              <div className="suite-grid">
                {suites.map(suiteName => (
                  <div 
                    key={suiteName}
                    className={`suite-card ${selectedSuite === suiteName ? 'selected' : ''}`}
                    onClick={() => runStatus !== 'RUNNING' && setSelectedSuite(suiteName)}
                  >
                    <div className="suite-label">{suiteName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                      @{suiteName}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scenario Selection list */}
          {tab === 'scenarios' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  Discovered {scenarios.length} Cucumber BDD Scenarios. Toggle checkbox to include in run.
                </p>
              </div>
              
              <div className="scenario-scroll">
                {scenarios.map(sc => {
                  const isSelected = selectedScenarios.includes(sc.name);
                  return (
                    <div 
                      key={sc.id}
                      className={`scenario-row ${isSelected ? 'selected' : ''}`}
                      onClick={() => runStatus !== 'RUNNING' && toggleScenario(sc.name)}
                    >
                      <div className="checkbox-custom">
                        {isSelected && <span className="checkbox-icon">✓</span>}
                      </div>
                      <div className="scenario-info">
                        <span className="scenario-name">{sc.name}</span>
                        <div className="scenario-meta">
                          <span className="feature-tag">{sc.feature}</span>
                          {sc.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="meta-badge">@{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Trigger button */}
          <button 
            className="run-btn"
            onClick={handleTriggerRun}
            disabled={runStatus === 'RUNNING'}
          >
            {runStatus === 'RUNNING' ? 'Running Automation...' : 'Trigger Suite Execution 🚀'}
          </button>
        </section>

        {/* Right Hand side: Execution monitor, stats, and real-time console log */}
        <section className="glass-panel" style={{ gap: '1.5rem' }}>
          <h2 className="panel-title">Execution Console</h2>
          
          {/* Test Status Counters */}
          <div className="metrics-row">
            <div className="metric-card">
              <div className="metric-label">Status</div>
              <div className="metric-value" style={{ 
                color: runStatus === 'RUNNING' ? 'var(--color-primary)' : 
                       runStatus === 'COMPLETED' ? 'var(--color-success)' :
                       runStatus === 'FAILED' ? 'var(--color-danger)' : 'var(--color-text-muted)'
              }}>{runStatus}</div>
            </div>
            
            <div className="metric-card">
              <div className="metric-label">Passed</div>
              <div className="metric-value" style={{ color: 'var(--color-success)' }}>{passCount}</div>
            </div>
            
            <div className="metric-card">
              <div className="metric-label">Failed</div>
              <div className="metric-value" style={{ color: 'var(--color-danger)' }}>{failCount}</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Start Time</div>
              <div className="metric-value" style={{ fontSize: '1rem', marginTop: '12px' }}>{startTime || '--:--'}</div>
            </div>
          </div>

          {/* Real-time HTML report banner upon completion */}
          {reportUrl && (
            <div className="report-banner">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-success)' }}>
                  Execution Complete!
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                  Interactive Extent HTML Report and failure screenshots generated successfully.
                </span>
              </div>
              <a 
                href={reportUrl} 
                target="_blank" 
                rel="noreferrer"
                className="report-link-btn"
              >
                Open Extent Report 📊
              </a>
            </div>
          )}

          {/* Scrolling Shell window */}
          <div className="console-window">
            {logs.length === 0 ? (
              <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                Console idle. Select tests and click 'Trigger Suite Execution' to stream live surefire logs...
              </span>
            ) : (
              logs.map((log, index) => (
                <div key={index} className={getLogClass(log)}>
                  {log}
                </div>
              ))
            )}
            <div ref={consoleEndRef} />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
