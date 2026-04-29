import express from 'express';
import { streamChat } from '../controllers/chatController.js';

const router = express.Router();

// POST /api/chat — streams response from Ollama
router.post('/', streamChat);

export default router;
