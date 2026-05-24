import BaseProvider from './BaseProvider.js';

class OllamaProvider extends BaseProvider {
  async streamResponse(res, prompt, options, settings) {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const endpoint = `${ollamaUrl}/api/generate`;
    const model = options.model || 'llama3';

    console.log(`[OllamaProvider] Calling Ollama for model: ${model}`);

    let ollamaResponse;
    try {
      ollamaResponse = await fetch(endpoint, {
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
    } catch (fetchErr) {
      // Ollama not running — give a clear error
      throw new Error(`Cannot connect to Ollama at ${ollamaUrl}. Is Ollama running?`);
    }

    if (!ollamaResponse.ok) {
      const errText = await ollamaResponse.text();
      throw new Error(`Ollama error (${ollamaResponse.status}): ${errText}`);
    }

    const safeWrite = (chunk) => {
      if (!res.writableEnded) {
        res.write(chunk);
      }
    };

    const reader = ollamaResponse.body.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        safeWrite(value);
      }
    } finally {
      // Always release the reader and close the response
      reader.releaseLock();
      if (!res.writableEnded) {
        res.end();
      }
    }
  }

  async generateResponse(prompt, options, settings) {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const endpoint = `${ollamaUrl}/api/generate`;
    const model = options.model || 'llama3';

    let response;
    try {
      response = await fetch(endpoint, {
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
    } catch (fetchErr) {
      throw new Error(`Cannot connect to Ollama at ${ollamaUrl}. Is Ollama running?`);
    }

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ollama error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data.response;
  }
}

export default new OllamaProvider();
