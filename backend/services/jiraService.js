import axios from 'axios';

class JiraService {
  /**
   * Fetches issues from Jira based on project or search query.
   * @param {string} domain Jira domain (e.g. your-domain.atlassian.net)
   * @param {string} email User email
   * @param {string} apiToken User API Token
   * @param {string} query Optional JQL query
   */
  async getIssues(domain, email, apiToken, query = '') {
    const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
    const baseUrl = `https://${domain}/rest/api/3/search/jql`;
    
    try {
      const response = await axios.get(baseUrl, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        },
        params: {
          jql: query || 'issuetype in (Story, Task) order by created DESC',
          maxResults: 50,
          fields: 'summary,description,status,issuetype,priority'
        }
      });
      
      return response.data.issues.map(issue => ({
        id: issue.key,
        summary: issue.fields.summary,
        description: issue.fields.description, // Note: Jira v3 returns ADF (Atlassian Document Format)
        status: issue.fields.status.name,
        type: issue.fields.issuetype.name,
        priority: issue.fields.priority.name
      }));
    } catch (error) {
      console.error('[Jira Service Error]', error.response?.data || error.message);
      throw new Error(error.response?.data?.errorMessages?.[0] || 'Failed to connect to Jira');
    }
  }

  async getIssueById(domain, email, apiToken, issueId) {
    const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
    const baseUrl = `https://${domain}/rest/api/3/issue/${issueId}`;
    
    try {
      const response = await axios.get(baseUrl, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        }
      });
      
      const issue = response.data;
      return {
        id: issue.key,
        summary: issue.fields.summary,
        description: issue.fields.description,
        status: issue.fields.status.name,
        type: issue.fields.issuetype.name,
        priority: issue.fields.priority.name
      };
    } catch (error) {
      console.error('[Jira Service Error]', error.response?.data || error.message);
      throw new Error(error.response?.data?.errorMessages?.[0] || 'Issue not found');
    }
  }

  async createIssue(domain, email, apiToken, payload) {
    const auth = Buffer.from(`${email}:${apiToken}`).toString('base64');
    const baseUrl = `https://${domain}/rest/api/3/issue`;

    try {
      const response = await axios.post(baseUrl, payload, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('[Jira Service Error - Create Issue]', error.response?.data || error.message);
      throw new Error(error.response?.data?.errorMessages?.[0] || 'Failed to create issue in Jira');
    }
  }
}

export default new JiraService();
