import express from 'express';
import {
  getRecoverySessions,
  createRecoverySession,
  updateRecoverySession,
} from '../controllers/recoveryController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// All recovery routes require JWT authentication
router.use(authenticateToken);

/**
 * @route   GET /api/recovery
 * @desc    Get all recovery sessions for authenticated user
 */
router.get('/', getRecoverySessions);

/**
 * @route   POST /api/recovery
 * @desc    Start/Create a recovery session
 */
router.post('/', createRecoverySession);

/**
 * @route   PUT /api/recovery/:id
 * @desc    Update/Complete a recovery session
 */
router.put('/:id', updateRecoverySession);

export default router;
