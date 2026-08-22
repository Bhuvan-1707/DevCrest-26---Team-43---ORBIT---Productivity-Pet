import pool from '../config/database.js';

export const SessionModel = {
  findAllByUserId: async (userId) => {
    const rows = await pool.query(
      'SELECT * FROM focus_sessions WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  },

  findById: async (id, userId) => {
    const rows = await pool.query(
      'SELECT * FROM focus_sessions WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (rows && rows.length > 0) {
      return rows[0];
    }
    return null;
  },

  create: async ({ userId, taskId, sessionCode, taskTitle, plannedDurationMinutes }) => {
    const title = taskTitle || 'Focus Session';
    const planned = plannedDurationMinutes ? Number(plannedDurationMinutes) : 45;
    const code = sessionCode || `sess_${Date.now()}`;
    const tId = taskId ? Number(taskId) : null;

    const result = await pool.query(
      `INSERT INTO focus_sessions 
       (user_id, task_id, session_code, task_title, planned_duration_minutes, actual_duration_minutes, focus_score, status, started_at) 
       VALUES (?, ?, ?, ?, ?, 0, 0, 'running', CURRENT_TIMESTAMP)`,
      [userId, tId, code, title, planned]
    );
    const insertId = result.insertId ? Number(result.insertId) : Date.now();
    return {
      id: insertId,
      user_id: Number(userId),
      task_id: tId,
      session_code: code,
      task_title: title,
      planned_duration_minutes: planned,
      actual_duration_minutes: 0,
      focus_score: 0,
      status: 'running',
      started_at: new Date().toISOString(),
      completed_at: null,
      created_at: new Date().toISOString()
    };
  },

  update: async (id, userId, updates) => {
    const current = await SessionModel.findById(id, userId);
    if (!current) return null;

    const nextStatus = updates.status || current.status;
    const nextActual = updates.actual_duration_minutes !== undefined ? Number(updates.actual_duration_minutes) : current.actual_duration_minutes;
    const nextFocusScore = updates.focus_score !== undefined ? Number(updates.focus_score) : current.focus_score;

    let nextCompletedAt = current.completed_at;
    if (nextStatus === 'completed' && current.status !== 'completed') {
      nextCompletedAt = new Date();
    }

    await pool.query(
      `UPDATE focus_sessions 
       SET status = ?, actual_duration_minutes = ?, focus_score = ?, completed_at = ?
       WHERE id = ? AND user_id = ?`,
      [nextStatus, nextActual, nextFocusScore, nextCompletedAt, id, userId]
    );

    return {
      ...current,
      status: nextStatus,
      actual_duration_minutes: nextActual,
      focus_score: nextFocusScore,
      completed_at: nextCompletedAt ? new Date(nextCompletedAt).toISOString() : current.completed_at
    };
  }
};

export default SessionModel;
