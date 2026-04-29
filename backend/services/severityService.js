import ProviderFactory from '../providers/ProviderFactory.js';

class SeverityService {
  /**
   * Generates a severity suggestion for a given defect using an LLM.
   * Includes rule-based fallback logic if the LLM fails or returns invalid data.
   */
  async suggestSeverity(defectData, providerName = 'gemini', model = 'gemini-1.5-flash', settings = {}) {
    const { summary, steps, expected, actual } = defectData;

    const prompt = `Analyze the following defect and assign a severity level.

Severity levels:
- Critical: system crash, data loss, blocker
- High: major feature broken
- Medium: partial functionality issue
- Low: minor UI or cosmetic issue

Return ONLY JSON:
{
  "severity": "Critical" | "High" | "Medium" | "Low",
  "reason": "short explanation"
}

Defect:
Summary: ${summary || 'N/A'}
Steps: ${steps || 'N/A'}
Expected: ${expected || 'N/A'}
Actual: ${actual || 'N/A'}
`;

    try {
      const provider = ProviderFactory.getProvider(providerName);
      const resultText = await provider.generateResponse(prompt, { model, temperature: 0.1 }, settings);

      // Clean markdown JSON formatting if present
      const cleanJson = resultText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      
      if (!['Critical', 'High', 'Medium', 'Low'].includes(parsed.severity)) {
        throw new Error('Invalid severity level from LLM');
      }

      return {
        severity: parsed.severity,
        reason: parsed.reason || 'AI Suggested'
      };

    } catch (error) {
      console.warn('[SeverityService] LLM failed, using fallback logic:', error.message);
      return this.fallbackSuggestSeverity(defectData);
    }
  }

  fallbackSuggestSeverity(defectData) {
    const combinedText = [
      defectData.summary,
      defectData.actual
    ].join(' ').toLowerCase();

    if (combinedText.match(/crash|data loss|panic|security|fatal/)) {
      return { severity: 'Critical', reason: 'Fallback: Keyword match (Crash/Data Loss)' };
    }
    if (combinedText.match(/not working|broken|fails|error|exception|timeout/)) {
      return { severity: 'High', reason: 'Fallback: Keyword match (Functional Failure)' };
    }
    if (combinedText.match(/ui|alignment|typo|color|margin|padding|cosmetic/)) {
      return { severity: 'Low', reason: 'Fallback: Keyword match (UI/Cosmetic)' };
    }
    
    return { severity: 'Medium', reason: 'Fallback: Default severity' };
  }
}

export default new SeverityService();
