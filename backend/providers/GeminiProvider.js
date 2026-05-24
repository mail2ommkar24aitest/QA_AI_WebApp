import { GoogleGenerativeAI } from '@google/generative-ai';
import BaseProvider from './BaseProvider.js';

class GeminiProvider extends BaseProvider {
  async streamResponse(res, prompt, options, settings) {
    if (!settings.apiKey) throw new Error('Gemini API Key is required. Please add it in Settings.');

    const genAI = new GoogleGenerativeAI(settings.apiKey);
    let requestedModelName = settings.model || options.model || 'gemini-1.5-flash';

    // Sanitise: strip the "models/" prefix if user pasted the full path
    requestedModelName = requestedModelName.replace(/^models\//, '');

    console.log(`[GeminiProvider] Using model: ${requestedModelName}`);

    const safeWrite = (chunk) => {
      if (!res.writableEnded) {
        res.write(chunk);
      }
    };

    const safeEnd = () => {
      if (!res.writableEnded) {
        res.end();
      }
    };

    const doStream = async (modelName) => {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContentStream(prompt);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          // Send as JSON so newlines are safely encoded and parsed by the frontend
          safeWrite(JSON.stringify({ response: chunkText }) + '\n');
        }
      }
      safeWrite('data: [DONE]\n\n');
      safeEnd();
    };

    try {
      await doStream(requestedModelName);
    } catch (error) {
      // Automatically fall back if the model is deprecated or not found
      if (
        error.message?.includes('404') ||
        error.message?.includes('not found') ||
        error.message?.includes('deprecated') ||
        error.status === 404
      ) {
        const fallbackModel = 'gemini-1.5-flash';
        console.warn(`[GeminiProvider] Model "${requestedModelName}" unavailable. Falling back to ${fallbackModel}.`);
        safeWrite(`data: ⚠️ *Note: Model "${requestedModelName}" is unavailable. Falling back to ${fallbackModel}.*\n\n`);
        await doStream(fallbackModel);
      } else {
        // Re-throw so chatController can handle it
        throw error;
      }
    }
  }

  async generateResponse(prompt, options, settings) {
    if (!settings.apiKey) throw new Error('Gemini API Key is required.');

    const genAI = new GoogleGenerativeAI(settings.apiKey);
    let requestedModelName = (settings.model || options.model || 'gemini-1.5-flash').replace(/^models\//, '');

    const tryGenerate = async (modelName) => {
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          temperature: options.temperature || 0.7,
        }
      });
      const result = await model.generateContent(prompt);
      return result.response.text();
    };

    try {
      return await tryGenerate(requestedModelName);
    } catch (error) {
      if (error.message?.includes('404') || error.status === 404) {
        console.warn(`[GeminiProvider] Model "${requestedModelName}" unavailable. Falling back to gemini-1.5-flash.`);
        return await tryGenerate('gemini-1.5-flash');
      }
      throw error;
    }
  }
}

export default new GeminiProvider();
