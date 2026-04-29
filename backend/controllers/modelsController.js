import fetch from 'node-fetch';

/**
 * Retrieves the list of installed models from Ollama.
 */
export async function listModels(req, res) {
  const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const endpoint = `${ollamaUrl}/api/tags`;
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }
    const data = await response.json();
    // data.models is an array of objects with name and other metadata
    const modelNames = data.models.map(m => m.name);
    res.json({ models: modelNames });
  } catch (err) {
    console.error('[Models error]', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
