import express from 'express';
import {
  getExperiments,
  getExperimentById,
  createExperiment,
  updateExperiment,
  deleteExperiment,
} from '../controllers/experimentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// All experiment routes require JWT authentication
router.use(authenticateToken);

/**
 * @route   GET /api/experiments
 * @desc    Get all experiments for authenticated user
 */
router.get('/', getExperiments);

/**
 * @route   POST /api/experiments
 * @desc    Create a new experiment
 */
router.post('/', createExperiment);

/**
 * @route   GET /api/experiments/:id
 * @desc    Get specific experiment by ID
 */
router.get('/:id', getExperimentById);

/**
 * @route   PUT /api/experiments/:id
 * @desc    Update an existing experiment
 */
router.put('/:id', updateExperiment);

/**
 * @route   DELETE /api/experiments/:id
 * @desc    Delete an experiment
 */
router.delete('/:id', deleteExperiment);

export default router;
