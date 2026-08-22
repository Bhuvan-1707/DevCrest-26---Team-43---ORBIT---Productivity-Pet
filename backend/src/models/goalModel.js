import pool from '../config/database.js';

export const GoalModel = {
  findAllByUserId: async (userId) => {
    const rows = await pool.query(
      'SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  },

  findById: async (id, userId) => {
    const rows = await pool.query(
      'SELECT * FROM goals WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (rows && rows.length > 0) {
      return rows[0];
    }
    return null;
  },

  create: async ({ userId, title, description, progress, completedMilestones, totalMilestones, nextMilestone, targetDate, status }) => {
    const goalTitle = title;
    const goalDesc = description || null;
    const goalProgress = progress !== undefined ? Number(progress) : 0;
    const completedM = completedMilestones !== undefined ? Number(completedMilestones) : 0;
    const totalM = totalMilestones !== undefined ? Number(totalMilestones) : 1;
    const nextM = nextMilestone || null;
    const target = targetDate || null;
    const goalStatus = status || 'active';

    const result = await pool.query(
      `INSERT INTO goals (user_id, title, description, progress, completed_milestones, total_milestones, next_milestone, target_date, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, goalTitle, goalDesc, goalProgress, completedM, totalM, nextM, target, goalStatus]
    );
    const insertId = result.insertId ? Number(result.insertId) : Date.now();
    return {
      id: insertId,
      user_id: Number(userId),
      title: goalTitle,
      description: goalDesc,
      progress: goalProgress,
      completed_milestones: completedM,
      total_milestones: totalM,
      next_milestone: nextM,
      target_date: target,
      status: goalStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  update: async (id, userId, updates) => {
    const current = await GoalModel.findById(id, userId);
    if (!current) return null;

    const nextTitle = updates.title !== undefined ? updates.title : current.title;
    const nextDesc = updates.description !== undefined ? updates.description : current.description;
    const nextProgress = updates.progress !== undefined ? Number(updates.progress) : current.progress;
    const nextCompletedM = updates.completedMilestones !== undefined ? Number(updates.completedMilestones) : (updates.completed_milestones !== undefined ? Number(updates.completed_milestones) : current.completed_milestones);
    const nextTotalM = updates.totalMilestones !== undefined ? Number(updates.totalMilestones) : (updates.total_milestones !== undefined ? Number(updates.total_milestones) : current.total_milestones);
    const nextNextM = updates.nextMilestone !== undefined ? updates.nextMilestone : (updates.next_milestone !== undefined ? updates.next_milestone : current.next_milestone);
    const nextTarget = updates.targetDate !== undefined ? updates.targetDate : (updates.target_date !== undefined ? updates.target_date : current.target_date);
    const nextStatus = updates.status !== undefined ? updates.status : current.status;

    await pool.query(
      `UPDATE goals 
       SET title = ?, description = ?, progress = ?, completed_milestones = ?, total_milestones = ?, next_milestone = ?, target_date = ?, status = ?
       WHERE id = ? AND user_id = ?`,
      [nextTitle, nextDesc, nextProgress, nextCompletedM, nextTotalM, nextNextM, nextTarget, nextStatus, id, userId]
    );

    return {
      ...current,
      title: nextTitle,
      description: nextDesc,
      progress: nextProgress,
      completed_milestones: nextCompletedM,
      total_milestones: nextTotalM,
      next_milestone: nextNextM,
      target_date: nextTarget,
      status: nextStatus,
      updated_at: new Date().toISOString(),
    };
  },

  delete: async (id, userId) => {
    const result = await pool.query(
      'DELETE FROM goals WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  },
};

export default GoalModel;
