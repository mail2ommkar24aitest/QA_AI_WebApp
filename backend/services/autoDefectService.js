import jiraService from './jiraService.js';

class AutoDefectService {
  /**
   * Transforms a list of failed test cases into Jira defect payloads.
   * @param {Array} testCases Array of test case objects
   * @param {string} jiraStoryId Optional Jira story ID to link to
   * @param {string} overrideSeverity Optional severity override
   */
  async createDefectsFromTestCases(testCases, jiraStoryId, overrideSeverity, authHeaders) {
    const defectsCreated = [];
    const errors = [];

    for (const tc of testCases) {
      if (tc.status !== 'Failed') continue;

      try {
        const payload = this.buildDefectPayload(tc, jiraStoryId, overrideSeverity);
        
        // This assumes jiraService has a method createIssue(payload, headers)
        // If it only has search, we need to add createIssue to jiraService.
        const result = await jiraService.createIssue(payload, authHeaders);
        
        defectsCreated.push({
          testCaseTitle: tc.title,
          defectKey: result.key,
          defectUrl: result.self
        });
      } catch (error) {
        errors.push({
          testCaseTitle: tc.title,
          error: error.message
        });
      }
    }

    return { defectsCreated, errors };
  }

  buildDefectPayload(testCase, jiraStoryId, overrideSeverity) {
    // Basic Jira V3 Issue payload structure
    const payload = {
      fields: {
        project: {
          key: this.extractProjectKey(jiraStoryId) || process.env.JIRA_PROJECT_KEY // Fallback
        },
        summary: `[Auto-Defect] ${testCase.title} - Failed`,
        description: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "This defect was auto-generated from a failed test case execution." }]
            },
            {
              type: "heading",
              attrs: { level: 3 },
              content: [{ type: "text", text: "Steps to Reproduce" }]
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: Array.isArray(testCase.steps) ? testCase.steps.join('\\n') : testCase.steps || 'N/A' }]
            },
            {
              type: "heading",
              attrs: { level: 3 },
              content: [{ type: "text", text: "Expected Result" }]
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: testCase.expectedResult || 'N/A' }]
            },
            {
              type: "heading",
              attrs: { level: 3 },
              content: [{ type: "text", text: "Actual Result" }]
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: testCase.actualResult || 'N/A' }]
            }
          ]
        },
        issuetype: {
          name: "Task" // Standard fallback
        }
      }
    };

    // If overrideSeverity is provided, map it to Jira Priority/Severity field
    // Note: Jira custom field IDs vary by instance, usually customfield_100XX.
    // For this generic implementation, we might just append it to the description or map if known.

    return payload;
  }

  extractProjectKey(issueIdOrKey) {
    if (!issueIdOrKey) return null;
    const parts = issueIdOrKey.split('-');
    if (parts.length >= 2) return parts[0];
    return null;
  }

  async createManualDefect(defectData, jiraStoryId, jiraSettings) {
    const { summary, stepsToReproduce, expectedResult, actualResult, severity, priority } = defectData;
    
    const payload = {
      fields: {
        project: {
          key: this.extractProjectKey(jiraStoryId) || process.env.JIRA_PROJECT_KEY // Fallback
        },
        summary: `[Defect] ${summary}`,
        description: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "heading",
              attrs: { level: 3 },
              content: [{ type: "text", text: "Steps to Reproduce" }]
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: stepsToReproduce || 'N/A' }]
            },
            {
              type: "heading",
              attrs: { level: 3 },
              content: [{ type: "text", text: "Expected Result" }]
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: expectedResult || 'N/A' }]
            },
            {
              type: "heading",
              attrs: { level: 3 },
              content: [{ type: "text", text: "Actual Result" }]
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: actualResult || 'N/A' }]
            },
            {
              type: "paragraph",
              content: [{ type: "text", text: `\nSeverity: ${severity}\nPriority: ${priority}` }]
            }
          ]
        },
        issuetype: {
          name: "Task" // Standard fallback
        }
      }
    };

    return await jiraService.createIssue(jiraSettings.domain, jiraSettings.email, jiraSettings.apiToken, payload);
  }
}

export default new AutoDefectService();
