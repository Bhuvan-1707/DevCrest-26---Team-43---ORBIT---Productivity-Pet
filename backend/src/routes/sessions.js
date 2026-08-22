import express from 'express';
import {
  getSessions,
  getSessionById,
  createSession,
  updateSession,
} from '../controllers/sessionController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// All session routes require JWT authentication
router.use(authenticateToken);

/**
 * @route   GET /api/sessions
 * @desc    Get all focus sessions belonging to authenticated user
 */
router.get('/', getSessions);

/**
 * @route   POST /api/sessions
 * @desc    Create / start a new focus session
 */
router.post('/', createSession);

/**
 * @route   GET /api/sessions/:id
 * @desc    Get a specific focus session by ID
 */
router.get('/:id', getSessionById);

/**
 * @route   PUT /api/sessions/:id
 * @desc    Update focus session state (pause, resume, complete)
 */
router.put('/:id', updateSession);

export default router;
