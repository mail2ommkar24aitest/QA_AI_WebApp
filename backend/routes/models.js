import express from 'express';
import { listModels } from '../controllers/modelsController.js';
import { listGeminiModels } from '../controllers/geminiModelsController.js';

const router = express.Router();

// GET /api/models — returns list of locally available Ollama models
router.get('/', listModels);

// POST /api/models/gemini — returns list of available Gemini models for a key
router.post('/gemini', listGeminiModels);

export default router;
