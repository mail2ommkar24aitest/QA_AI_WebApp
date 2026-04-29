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

    if (!response.ok) {
      const data = await response.json();
      const errorMessage = data.error || 'Failed to start chat stream';
      throw new Error(errorMessage);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      
      // Handle both raw text (for Cloud models) and JSON strings (for Ollama)
      // Actually, let's make the backend return consistent format or handle it here
      buffer += chunk;
      
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.trim()) continue;
        
        // If it's the cloud response format from our backend
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

        // Try parsing as Ollama JSON
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
          // If it's just raw text, append it (fallback)
          fullText += line;
          onChunk(fullText);
        }
      }
    }
  } catch (error) {
    console.error('[API] Chat stream caught error:', error);
    let errorMsg = error.toString();
    if (error instanceof Error) {
      errorMsg = error.message;
    }
    onError(errorMsg);
  }
};
