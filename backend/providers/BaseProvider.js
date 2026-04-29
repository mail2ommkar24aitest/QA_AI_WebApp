class BaseProvider {
  /**
   * Generates a streaming response from the LLM.
   * @param {object} res Express response object
   * @param {string} prompt The prompt text
   * @param {object} options Configuration (model, temperature, etc)
   * @param {object} settings API keys and other secrets
   */
  async streamResponse(res, prompt, options, settings) {
    throw new Error('streamResponse must be implemented by the provider');
  }

  /**
   * Generates a single, non-streaming text response from the LLM.
   * Useful for quick JSON extraction or categorization.
   * @param {string} prompt The prompt text
   * @param {object} options Configuration (model, temperature, etc)
   * @param {object} settings API keys and other secrets
   * @returns {Promise<string>} The generated text
   */
  async generateResponse(prompt, options, settings) {
    throw new Error('generateResponse must be implemented by the provider');
  }
}

export default BaseProvider;
