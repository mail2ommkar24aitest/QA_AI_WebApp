import OpenAIProvider from './OpenAIProvider.js';
import GeminiProvider from './GeminiProvider.js';
import OllamaProvider from './OllamaProvider.js';

class ProviderFactory {
  getProvider(providerName) {
    switch (providerName.toLowerCase()) {
      case 'openai':
        return OpenAIProvider;
      case 'gemini':
        return GeminiProvider;
      case 'ollama':
        return OllamaProvider;
      default:
        throw new Error(`Unsupported provider: ${providerName}`);
    }
  }
}

export default new ProviderFactory();
