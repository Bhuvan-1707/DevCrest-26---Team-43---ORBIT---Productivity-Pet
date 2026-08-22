import express from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// All task routes require JWT authentication
router.use(authenticateToken);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks belonging to authenticated user
 */
router.get('/', getTasks);

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 */
router.post('/', createTask);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a specific task by ID
 */
router.get('/:id', getTaskById);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update an existing task
 */
router.put('/:id', updateTask);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 */
router.delete('/:id', deleteTask);

export default router;
