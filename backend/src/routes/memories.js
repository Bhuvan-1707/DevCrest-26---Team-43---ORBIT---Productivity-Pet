import express from 'express';
import { getMemories, createMemory } from '../controllers/memoryController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// All memory routes require JWT authentication
router.use(authenticateToken);

/**
 * @route   GET /api/memories
 * @desc    Get memories for authenticated user (supports ?type=live|trusted|evidence)
 */
router.get('/', getMemories);

/**
 * @route   POST /api/memories
 * @desc    Create a new memory record
 */
router.post('/', createMemory);

export default router;
