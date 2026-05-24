import OpenAI from 'openai';
import BaseProvider from './BaseProvider.js';

class OpenAIProvider extends BaseProvider {
  async streamResponse(res, prompt, options, settings) {
    if (!settings.apiKey) throw new Error('OpenAI API Key is required');

    const openai = new OpenAI({ apiKey: settings.apiKey });
    const stream = await openai.chat.completions.create({
      model: settings.model || 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
      ...options
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const safeWrite = (chunk) => {
      if (!res.writableEnded) {
        res.write(chunk);
      }
    };

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        safeWrite(JSON.stringify({ response: content }) + '\n');
      }
    }
    safeWrite('data: [DONE]\n\n');
    if (!res.writableEnded) res.end();
  }
}

export default new OpenAIProvider();
