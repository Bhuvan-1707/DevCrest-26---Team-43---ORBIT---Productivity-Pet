import express from 'express';
import {
  getObservations,
  getObservationById,
  createObservation,
} from '../controllers/observationController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// All observation routes require JWT authentication
router.use(authenticateToken);

/**
 * @route   GET /api/observations
 * @desc    Get all observations for authenticated user
 */
router.get('/', getObservations);

/**
 * @route   POST /api/observations
 * @desc    Record a new telemetry observation event
 */
router.post('/', createObservation);

/**
 * @route   GET /api/observations/:id
 * @desc    Get specific observation by ID
 */
router.get('/:id', getObservationById);

export default router;
