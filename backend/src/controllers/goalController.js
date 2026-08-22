import GoalModel from '../models/goalModel.js';

/**
 * GET /api/goals
 * Get all goals belonging to authenticated user
 */
export async function getGoals(req, res, next) {
  try {
    const goals = await GoalModel.findAllByUserId(req.user.id);
    return res.status(200).json({
      status: 'ok',
      count: goals.length,
      data: goals,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/goals/:id
 * Get specific goal by ID
 */
export async function getGoalById(req, res, next) {
  try {
    const goal = await GoalModel.findById(req.params.id, req.user.id);
    if (!goal) {
      return res.status(404).json({
        status: 'error',
        message: 'Goal not found or access denied.',
      });
    }
    return res.status(200).json({
      status: 'ok',
      data: goal,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/goals
 * Create a new goal for authenticated user
 */
export async function createGoal(req, res, next) {
  try {
    const { title, description, progress, completedMilestones, totalMilestones, nextMilestone, targetDate, status } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Goal title is required.',
      });
    }

    const newGoal = await GoalModel.create({
      userId: req.user.id,
      title: title.trim(),
      description,
      progress,
      completedMilestones,
      totalMilestones,
      nextMilestone,
      targetDate,
      status,
    });

    return res.status(201).json({
      status: 'ok',
      message: 'Goal created successfully.',
      data: newGoal,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/goals/:id
 * Update an existing goal
 */
export async function updateGoal(req, res, next) {
  try {
    const { id } = req.params;
    const existingGoal = await GoalModel.findById(id, req.user.id);

    if (!existingGoal) {
      return res.status(404).json({
        status: 'error',
        message: 'Goal not found or access denied.',
      });
    }

    const updatedGoal = await GoalModel.update(id, req.user.id, req.body);

    return res.status(200).json({
      status: 'ok',
      message: 'Goal updated successfully.',
      data: updatedGoal,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/goals/:id
 * Delete a goal
 */
export async function deleteGoal(req, res, next) {
  try {
    const { id } = req.params;
    const existingGoal = await GoalModel.findById(id, req.user.id);

    if (!existingGoal) {
      return res.status(404).json({
        status: 'error',
        message: 'Goal not found or access denied.',
      });
    }

    await GoalModel.delete(id, req.user.id);

    return res.status(200).json({
      status: 'ok',
      message: 'Goal deleted successfully.',
      deletedGoalId: Number(id),
    });
  } catch (err) {
    next(err);
  }
}
