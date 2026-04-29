import providerFactory from '../providers/ProviderFactory.js';

/**
 * Streams a chat completion from different providers using the abstraction layer.
 */
export async function streamChat(req, res) {
  const { model, prompt, provider = 'ollama', settings = {}, options = {} } = req.body;
  
  // Disable buffering for corporate proxies
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders(); // Send headers immediately

  console.log(`[Backend] Incoming request: provider=${provider}, model=${model || 'default'}`);

  try {
    const llmProvider = providerFactory.getProvider(provider);
    
    // Ensure model is passed in options
    const mergedOptions = { ...options, model: model || settings.model };
    
    await llmProvider.streamResponse(res, prompt, mergedOptions, settings);
  } catch (err) {
    console.error(`[Backend] ERROR in ${provider} provider:`, err);
    
    if (!res.headersSent) {
      res.status(err.status || 500).json({ error: err.message || 'Unknown provider error' });
    } else {
      res.write(`\ndata: [ERROR: ${err.message || 'Stream interrupted'}]\n`);
      res.end();
    }
  }
}
