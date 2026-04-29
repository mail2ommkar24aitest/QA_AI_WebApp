import BaseProvider from './BaseProvider.js';

class OllamaProvider extends BaseProvider {
  async streamResponse(res, prompt, options, settings) {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const endpoint = `${ollamaUrl}/api/generate`;
    const model = options.model || 'llama3';

    console.log(`[Backend] Calling Ollama for model: ${model}`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        model, 
        prompt, 
        stream: true, 
        options: {
          temperature: options.temperature || 0.7,
          ...options.ollamaOptions
        }
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ollama Error: ${errText}`);
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const reader = response.body.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();
  }

  async generateResponse(prompt, options, settings) {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const endpoint = `${ollamaUrl}/api/generate`;
    const model = options.model || 'llama3';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        model, 
        prompt, 
        stream: false, 
        options: {
          temperature: options.temperature || 0.7,
          ...options.ollamaOptions
        }
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ollama Error: ${errText}`);
    }

    const data = await response.json();
    return data.response;
  }
}

export default new OllamaProvider();
