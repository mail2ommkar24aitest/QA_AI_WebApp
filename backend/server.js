import 'dotenv/config';
// Bypass SSL certificate verification for environments with restrictive proxies
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import { setGlobalDispatcher, Agent } from 'undici';
setGlobalDispatcher(new Agent({ connect: { rejectUnauthorized: false } }));
import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat.js';
import modelsRouter from './routes/models.js';
import jiraRouter from './routes/jira.js';
import defectRouter from './routes/defect.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Global crash guards ───────────────────────────────────────────────────
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server] Unhandled Rejection at:', promise, 'reason:', reason?.message || reason);
  // Do NOT exit — keep server alive
});

process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught Exception:', err.message || err);
  // Do NOT exit — keep server alive
});

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/chat', chatRouter);
app.use('/api/models', modelsRouter);
app.use('/api/jira', jiraRouter);
app.use('/api/defect', defectRouter);

// Root route to show status
app.get('/', (_req, res) => {
  res.send(`
    <div style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #0f172a; color: white;">
      <h1 style="color: #7c6ff5;">✅ QA Intelligence Core Backend</h1>
      <p>The engine is running successfully.</p>
      <a href="http://localhost:5176" style="margin-top: 20px; padding: 10px 20px; background: #7c6ff5; color: white; text-decoration: none; border-radius: 8px;">Go to App Interface</a>
    </div>
  `);
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('[Error]', err.message);
  if (!res.headersSent) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ QA Chat backend running on http://localhost:${PORT}`);
  console.log(`   Ollama endpoint: ${process.env.OLLAMA_BASE_URL}`);
});
