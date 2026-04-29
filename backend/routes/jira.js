import express from 'express';
import jiraService from '../services/jiraService.js';

const router = express.Router();

// GET /api/jira/issues
router.get('/issues', async (req, res) => {
  const { domain, email, apiToken, query } = req.query;
  
  if (!domain || !email || !apiToken) {
    return res.status(400).json({ error: 'Missing Jira configuration (domain, email, or token)' });
  }

  try {
    const issues = await jiraService.getIssues(domain, email, apiToken, query);
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/jira/issues/:id
router.get('/issues/:id', async (req, res) => {
  const { domain, email, apiToken } = req.query;
  const { id } = req.params;

  if (!domain || !email || !apiToken) {
    return res.status(400).json({ error: 'Missing Jira configuration' });
  }

  try {
    const issue = await jiraService.getIssueById(domain, email, apiToken, id);
    res.json(issue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
