import express from 'express';
import severityService from '../services/severityService.js';
import autoDefectService from '../services/autoDefectService.js';

const router = express.Router();

/**
 * POST /api/defect/suggest-severity
 * Uses AI to suggest a severity based on defect details.
 */
router.post('/suggest-severity', async (req, res, next) => {
  try {
    const { summary, stepsToReproduce, expectedResult, actualResult, provider, model, settings } = req.body;
    
    const defectData = {
      summary,
      steps: stepsToReproduce,
      expected: expectedResult,
      actual: actualResult
    };

    const suggestion = await severityService.suggestSeverity(
      defectData, 
      provider || 'gemini', 
      model, 
      settings
    );

    res.json(suggestion);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/defect/from-testcases
 * Creates Jira defects from failed test cases.
 */
router.post('/from-testcases', async (req, res, next) => {
  try {
    const { testCases, jiraStoryId, severityOverride } = req.body;
    const authHeaders = req.headers.authorization; // Assuming Basic Auth passed from frontend

    if (!testCases || !Array.isArray(testCases)) {
      return res.status(400).json({ error: 'testCases array is required' });
    }

    const result = await autoDefectService.createDefectsFromTestCases(
      testCases,
      jiraStoryId,
      severityOverride,
      authHeaders
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/defect/manual
 * Creates a Jira defect manually.
 */
router.post('/manual', async (req, res, next) => {
  try {
    const { defectData, jiraStoryId, jiraSettings } = req.body;

    if (!defectData || !jiraSettings) {
      return res.status(400).json({ error: 'Missing defectData or jiraSettings' });
    }

    const result = await autoDefectService.createManualDefect(
      defectData,
      jiraStoryId,
      jiraSettings
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
