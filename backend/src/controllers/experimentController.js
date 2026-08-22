import ExperimentModel from '../models/experimentModel.js';

/**
 * GET /api/experiments
 * Get all productivity experiments belonging to authenticated user
 */
export async function getExperiments(req, res, next) {
  try {
    const experiments = await ExperimentModel.findAllByUserId(req.user.id);
    return res.status(200).json({
      status: 'ok',
      count: experiments.length,
      data: experiments,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/experiments/:id
 * Get specific experiment by ID
 */
export async function getExperimentById(req, res, next) {
  try {
    const experiment = await ExperimentModel.findById(req.params.id, req.user.id);
    if (!experiment) {
      return res.status(404).json({
        status: 'error',
        message: 'Experiment not found or access denied.',
      });
    }
    return res.status(200).json({
      status: 'ok',
      data: experiment,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/experiments
 * Create a new productivity experiment
 */
export async function createExperiment(req, res, next) {
  try {
    const { title, hypothesis, variableTested, status, outcomeSummary, confidenceScore, startedAt, endedAt } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Experiment title/name is required.',
      });
    }

    const newExperiment = await ExperimentModel.create({
      userId: req.user.id,
      title: title.trim(),
      hypothesis,
      variableTested,
      status,
      outcomeSummary,
      confidenceScore,
      startedAt,
      endedAt,
    });

    return res.status(201).json({
      status: 'ok',
      message: 'Experiment created successfully.',
      data: newExperiment,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/experiments/:id
 * Update an existing experiment
 */
export async function updateExperiment(req, res, next) {
  try {
    const { id } = req.params;
    const existingExperiment = await ExperimentModel.findById(id, req.user.id);

    if (!existingExperiment) {
      return res.status(404).json({
        status: 'error',
        message: 'Experiment not found or access denied.',
      });
    }

    const updatedExperiment = await ExperimentModel.update(id, req.user.id, req.body);

    return res.status(200).json({
      status: 'ok',
      message: 'Experiment updated successfully.',
      data: updatedExperiment,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/experiments/:id
 * Delete an experiment
 */
export async function deleteExperiment(req, res, next) {
  try {
    const { id } = req.params;
    const existingExperiment = await ExperimentModel.findById(id, req.user.id);

    if (!existingExperiment) {
      return res.status(404).json({
        status: 'error',
        message: 'Experiment not found or access denied.',
      });
    }

    await ExperimentModel.delete(id, req.user.id);

    return res.status(200).json({
      status: 'ok',
      message: 'Experiment deleted successfully.',
      deletedExperimentId: Number(id),
    });
  } catch (err) {
    next(err);
  }
}
