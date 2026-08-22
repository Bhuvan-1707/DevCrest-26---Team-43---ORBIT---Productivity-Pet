import express from 'express';
import {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
} from '../controllers/goalController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// All goal routes require JWT authentication
router.use(authenticateToken);

/**
 * @route   GET /api/goals
 * @desc    Get all goals belonging to authenticated user
 */
router.get('/', getGoals);

/**
 * @route   POST /api/goals
 * @desc    Create a new goal
 */
router.post('/', createGoal);

/**
 * @route   GET /api/goals/:id
 * @desc    Get specific goal by ID
 */
router.get('/:id', getGoalById);

/**
 * @route   PUT /api/goals/:id
 * @desc    Update an existing goal
 */
router.put('/:id', updateGoal);

/**
 * @route   DELETE /api/goals/:id
 * @desc    Delete a goal
 */
router.delete('/:id', deleteGoal);

export default router;
