import pool from '../config/database.js';

export const TaskModel = {
  findAllByUserId: async (userId) => {
    const rows = await pool.query(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows.map(t => ({
      ...t,
      completed: Boolean(t.completed)
    }));
  },

  findById: async (id, userId) => {
    const rows = await pool.query(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (rows && rows.length > 0) {
      return {
        ...rows[0],
        completed: Boolean(rows[0].completed)
      };
    }
    return null;
  },

  create: async ({ userId, goalId, title, difficulty, estimatedMinutes, category }) => {
    const taskDifficulty = difficulty || 'medium';
    const taskEstMinutes = estimatedMinutes ? Number(estimatedMinutes) : 25;
    const taskCategory = category || 'General';
    const taskGoalId = goalId ? Number(goalId) : null;

    const result = await pool.query(
      `INSERT INTO tasks (user_id, goal_id, title, completed, difficulty, estimated_minutes, category) 
       VALUES (?, ?, ?, FALSE, ?, ?, ?)`,
      [userId, taskGoalId, title, taskDifficulty, taskEstMinutes, taskCategory]
    );
    const insertId = result.insertId ? Number(result.insertId) : Date.now();
    return {
      id: insertId,
      user_id: Number(userId),
      goal_id: taskGoalId,
      title,
      completed: false,
      difficulty: taskDifficulty,
      estimated_minutes: taskEstMinutes,
      category: taskCategory,
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  },

  update: async (id, userId, updates) => {
    const currentTask = await TaskModel.findById(id, userId);
    if (!currentTask) return null;

    const nextTitle = updates.title !== undefined ? updates.title : currentTask.title;
    const nextCompleted = updates.completed !== undefined ? Boolean(updates.completed) : currentTask.completed;
    const nextDifficulty = updates.difficulty !== undefined ? updates.difficulty : currentTask.difficulty;
    const nextEstMinutes = updates.estimated_minutes !== undefined ? Number(updates.estimated_minutes) : currentTask.estimated_minutes;
    const nextCategory = updates.category !== undefined ? updates.category : currentTask.category;
    
    let nextCompletedAt = currentTask.completed_at;
    if (nextCompleted && !currentTask.completed) {
      nextCompletedAt = new Date();
    } else if (!nextCompleted) {
      nextCompletedAt = null;
    }

    await pool.query(
      `UPDATE tasks 
       SET title = ?, completed = ?, difficulty = ?, estimated_minutes = ?, category = ?, completed_at = ?
       WHERE id = ? AND user_id = ?`,
      [nextTitle, nextCompleted, nextDifficulty, nextEstMinutes, nextCategory, nextCompletedAt, id, userId]
    );

    return {
      ...currentTask,
      title: nextTitle,
      completed: nextCompleted,
      difficulty: nextDifficulty,
      estimated_minutes: nextEstMinutes,
      category: nextCategory,
      completed_at: nextCompletedAt ? new Date(nextCompletedAt).toISOString() : null,
      updated_at: new Date().toISOString()
    };
  },

  delete: async (id, userId) => {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }
};

export default TaskModel;
