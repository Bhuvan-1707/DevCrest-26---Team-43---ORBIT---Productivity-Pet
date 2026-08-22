import ObservationModel from '../models/observationModel.js';

// Preserved observation types from Module 2
export const ALLOWED_OBSERVATION_TYPES = [
  'SESSION_STARTED',
  'SESSION_PAUSED',
  'SESSION_RESUMED',
  'SESSION_COMPLETED',
  'TASK_STARTED',
  'TASK_COMPLETED',
  'TASK_CREATED',
  'TASK_UPDATED',
  'PAGE_VIEW',
  'RECOVERY_STARTED',
];

/**
 * GET /api/observations
 * Get all telemetry observations for authenticated user
 */
export async function getObservations(req, res, next) {
  try {
    const observations = await ObservationModel.findAllByUserId(req.user.id);
    return res.status(200).json({
      status: 'ok',
      count: observations.length,
      data: observations,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/observations/:id
 * Get specific telemetry observation by ID
 */
export async function getObservationById(req, res, next) {
  try {
    const observation = await ObservationModel.findById(req.params.id, req.user.id);
    if (!observation) {
      return res.status(404).json({
        status: 'error',
        message: 'Observation record not found or access denied.',
      });
    }
    return res.status(200).json({
      status: 'ok',
      data: observation,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/observations
 * Record a new telemetry observation event
 */
export async function createObservation(req, res, next) {
  try {
    const { id, type, source, activity, context, metadata, timestamp } = req.body;

    // 1. Validate Observation Type
    if (!type || !ALLOWED_OBSERVATION_TYPES.includes(type)) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid or missing observation type '${type}'. Allowed types: ${ALLOWED_OBSERVATION_TYPES.join(', ')}`,
      });
    }

    // 2. Validate Activity object & name
    if (!activity || !activity.name || typeof activity.name !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Observation activity object with a valid activity name is required.',
      });
    }

    // 3. Type-specific metadata schema validation
    if (type.startsWith('TASK_')) {
      const taskId = context?.taskId || metadata?.taskId;
      if (!taskId) {
        return res.status(400).json({
          status: 'error',
          message: `Observation type '${type}' requires context.taskId field.`,
        });
      }
    }

    if (type.startsWith('SESSION_')) {
      const sessionId = context?.sessionId || metadata?.sessionId;
      if (!sessionId) {
        return res.status(400).json({
          status: 'error',
          message: `Observation type '${type}' requires context.sessionId field.`,
        });
      }
    }

    if (type === 'PAGE_VIEW') {
      const page = context?.page || metadata?.route;
      if (!page) {
        return res.status(400).json({
          status: 'error',
          message: `Observation type 'PAGE_VIEW' requires context.page field.`,
        });
      }
    }

    // 4. Record observation in database / model layer
    const newObservation = await ObservationModel.create({
      userId: req.user.id,
      id,
      type,
      source,
      activity,
      context,
      metadata,
      timestamp,
    });

    return res.status(201).json({
      status: 'ok',
      message: 'Observation recorded successfully.',
      data: newObservation,
    });
  } catch (err) {
    next(err);
  }
}
