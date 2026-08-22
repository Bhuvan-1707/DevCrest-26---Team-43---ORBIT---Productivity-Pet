import TaskModel from '../models/taskModel.js';

/**
 * GET /api/tasks
 * Get all tasks belonging to authenticated user
 */
export async function getTasks(req, res, next) {
  try {
    const tasks = await TaskModel.findAllByUserId(req.user.id);
    return res.status(200).json({
      status: 'ok',
      count: tasks.length,
      data: tasks,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/tasks/:id
 * Get a specific task by ID
 */
export async function getTaskById(req, res, next) {
  try {
    const task = await TaskModel.findById(req.params.id, req.user.id);
    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found or access denied.',
      });
    }
    return res.status(200).json({
      status: 'ok',
      data: task,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/tasks
 * Create a new task for authenticated user
 */
export async function createTask(req, res, next) {
  try {
    const { title, difficulty, estimatedMinutes, category, goalId } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Task title is required.',
      });
    }

    const newTask = await TaskModel.create({
      userId: req.user.id,
      goalId,
      title: title.trim(),
      difficulty,
      estimatedMinutes,
      category,
    });

    return res.status(201).json({
      status: 'ok',
      message: 'Task created successfully.',
      data: newTask,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/tasks/:id
 * Update a task belonging to authenticated user
 */
export async function updateTask(req, res, next) {
  try {
    const { id } = req.params;
    const existingTask = await TaskModel.findById(id, req.user.id);

    if (!existingTask) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found or access denied.',
      });
    }

    const updatedTask = await TaskModel.update(id, req.user.id, req.body);

    return res.status(200).json({
      status: 'ok',
      message: 'Task updated successfully.',
      data: updatedTask,
      observationContext: updatedTask.completed ? {
        type: 'TASK_COMPLETED',
        taskId: updatedTask.id,
        taskTitle: updatedTask.title,
        category: updatedTask.category,
        difficulty: updatedTask.difficulty,
        completedAt: updatedTask.completed_at,
      } : {
        type: 'TASK_UPDATED',
        taskId: updatedTask.id,
        taskTitle: updatedTask.title,
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/tasks/:id
 * Delete a task belonging to authenticated user
 */
export async function deleteTask(req, res, next) {
  try {
    const { id } = req.params;
    const existingTask = await TaskModel.findById(id, req.user.id);

    if (!existingTask) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found or access denied.',
      });
    }

    await TaskModel.delete(id, req.user.id);

    return res.status(200).json({
      status: 'ok',
      message: 'Task deleted successfully.',
      deletedTaskId: Number(id),
    });
  } catch (err) {
    next(err);
  }
}
