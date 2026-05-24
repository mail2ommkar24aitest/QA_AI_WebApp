import providerFactory from '../providers/ProviderFactory.js';

/**
 * Streams a chat completion from different providers using the abstraction layer.
 */
export async function streamChat(req, res) {
  const { model, prompt, provider = 'ollama', settings = {}, options = {} } = req.body;

  console.log(`[Backend] Incoming request: provider=${provider}, model=${model || 'default'}`);

  // ── Validate inputs BEFORE flushing headers ──────────────────────────────
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  let llmProvider;
  try {
    llmProvider = providerFactory.getProvider(provider);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  // For cloud providers, validate API key early
  if (provider !== 'ollama' && !settings.apiKey) {
    return res.status(400).json({ 
      error: `${provider.charAt(0).toUpperCase() + provider.slice(1)} API Key is required. Please add it in Settings.` 
    });
  }

  // ── Now set up SSE headers ───────────────────────────────────────────────
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders(); // Send headers immediately

  try {
    // Ensure model is passed in options
    const mergedOptions = { ...options, model: model || settings.model };
    
    await llmProvider.streamResponse(res, prompt, mergedOptions, settings);
  } catch (err) {
    console.error(`[Backend] ERROR in ${provider} provider:`, err.message || err);
    
    // Headers are already sent (flushHeaders was called), so write error into the stream
    try {
      res.write(`data: [ERROR: ${err.message || 'Stream interrupted'}]\n\n`);
      res.end();
    } catch (writeErr) {
      console.error('[Backend] Failed to write error to stream:', writeErr.message);
      // Response is already broken, just end it
      try { res.end(); } catch (_) { /* ignore */ }
    }
  }
}
