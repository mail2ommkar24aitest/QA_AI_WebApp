/**
 * Lists available Gemini models using a raw fetch to Google's API.
 * The Node SDK sometimes lacks this method or varies by version.
 */
export async function listGeminiModels(req, res) {
  const { apiKey } = req.body;
  if (!apiKey) {
    return res.status(400).json({ error: 'API Key required' });
  }

  console.log('[Backend] Fetching Gemini models via raw API call...');

  try {
    // We use v1beta as it usually has the most comprehensive model list
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    // Global fetch (Node 18+)
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('[Backend] Gemini API returned error:', data);
      throw new Error(data.error?.message || 'Failed to fetch models from Google');
    }

    console.log('[Backend] Gemini models fetched successfully');
    // data.models is the array of model objects
    res.json(data.models || []);
  } catch (err) {
    console.error('[Backend] Gemini listModels error:', err);
    res.status(500).json({ error: err.message || 'Failed to fetch models' });
  }
}
