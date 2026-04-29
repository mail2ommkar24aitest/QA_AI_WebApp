import { GoogleGenerativeAI } from '@google/generative-ai';
import BaseProvider from './BaseProvider.js';

class GeminiProvider extends BaseProvider {
  async streamResponse(res, prompt, options, settings) {
    if (!settings.apiKey) throw new Error('Gemini API Key is required');

    const genAI = new GoogleGenerativeAI(settings.apiKey);
    const model = genAI.getGenerativeModel({ model: settings.model || 'gemini-1.5-flash' });
    
    const result = await model.generateContentStream(prompt);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(`data: ${chunkText}\n\n`); // Added extra newline for SSE compliance
    }
    res.write('data: [DONE]\n');
    res.end();
  }

  async generateResponse(prompt, options, settings) {
    if (!settings.apiKey) throw new Error('Gemini API Key is required');

    const genAI = new GoogleGenerativeAI(settings.apiKey);
    const model = genAI.getGenerativeModel({ 
      model: settings.model || 'gemini-1.5-flash',
      generationConfig: {
        temperature: options.temperature || 0.7,
      }
    });
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}

export default new GeminiProvider();
