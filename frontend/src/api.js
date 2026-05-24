const API_BASE_URL = 'http://localhost:3001/api';

export const fetchModels = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/models`);
    if (!response.ok) throw new Error('Failed to fetch models');
    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
};

export const chatStream = async (model, prompt, onChunk, onDone, onError, provider = 'ollama', cloudSettings = {}, signal) => {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal,
      body: JSON.stringify({ 
        model, 
        prompt, 
        provider,
        settings: cloudSettings[provider] || {}
      }),
    });

    // ── Handle non-streaming error responses (400, 500, etc.) ──────────────
    if (!response.ok) {
      // Check content type — backend sends JSON for pre-stream errors
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        throw new Error(data.error || `Server error (${response.status})`);
      } else {
        const text = await response.text();
        throw new Error(text || `Server error (${response.status})`);
      }
    }

    // ── Stream is live — read SSE chunks ────────────────────────────────────
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep incomplete last line in buffer

      for (const line of lines) {
        if (!line.trim()) continue;
        
        // SSE format: "data: <content>"
        if (line.startsWith('data: ')) {
          const dataContent = line.slice(6);
          if (dataContent === '[DONE]') {
            onDone(fullText);
            continue;
          }
          if (dataContent.startsWith('[ERROR:')) {
            const errorMessage = dataContent.replace(/^\[ERROR:\s*/, '').replace(/\]$/, '').trim();
            throw new Error(errorMessage);
          }
          fullText += dataContent;
          onChunk(fullText);
          continue;
        }

        // Ollama raw JSON format
        try {
          const json = JSON.parse(line);
          if (json.response) {
            fullText += json.response;
            onChunk(fullText);
          }
          if (json.done) {
            onDone(fullText);
          }
        } catch (e) {
          // Raw text fallback
          fullText += line;
          onChunk(fullText);
        }
      }
    }

    // If stream ended without [DONE], still call onDone
    if (fullText && !fullText.endsWith('[DONE]')) {
      onDone(fullText);
    }

  } catch (error) {
    // Ignore intentional aborts
    if (error?.name === 'AbortError' || error?.message?.includes('signal is aborted')) {
      return;
    }
    console.error('[API] Chat stream caught error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    onError(errorMsg);
  }
};
