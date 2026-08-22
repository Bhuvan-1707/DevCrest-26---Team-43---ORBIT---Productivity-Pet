import express from 'express';
import { getInsights, createInsight } from '../controllers/insightController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// All insight routes require JWT authentication
router.use(authenticateToken);

/**
 * @route   GET /api/insights
 * @desc    Get insights for authenticated user
 */
router.get('/', getInsights);

/**
 * @route   POST /api/insights
 * @desc    Create a new insight record
 */
router.post('/', createInsight);

export default router;
