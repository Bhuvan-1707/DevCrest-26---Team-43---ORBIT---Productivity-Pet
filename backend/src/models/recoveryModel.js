import pool from '../config/database.js';

export const RecoveryModel = {
  findAllByUserId: async (userId) => {
    const rows = await pool.query(
      'SELECT * FROM recovery_sessions WHERE user_id = ? ORDER BY started_at DESC',
      [userId]
    );
    return rows;
  },

  findById: async (id, userId) => {
    const rows = await pool.query(
      'SELECT * FROM recovery_sessions WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (rows && rows.length > 0) {
      return rows[0];
    }
    return null;
  },

  create: async ({ userId, focusSessionId, recommendedDurationMinutes, fatigueLevel, triggerReason }) => {
    const focusId = focusSessionId ? Number(focusSessionId) : null;
    const recDur = recommendedDurationMinutes ? Number(recommendedDurationMinutes) : 6;
    const fatigue = fatigueLevel || 'Low';
    const reason = triggerReason || 'POST_SESSION_RECOVERY';

    const result = await pool.query(
      `INSERT INTO recovery_sessions 
       (user_id, focus_session_id, recommended_duration_minutes, actual_duration_minutes, fatigue_level, trigger_reason, status, started_at) 
       VALUES (?, ?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP)`,
      [userId, focusId, recDur, recDur, fatigue, reason]
    );
    const insertId = result.insertId ? Number(result.insertId) : Date.now();
    return {
      id: insertId,
      user_id: Number(userId),
      focus_session_id: focusId,
      recommended_duration_minutes: recDur,
      actual_duration_minutes: recDur,
      fatigue_level: fatigue,
      trigger_reason: reason,
      status: 'active',
      started_at: new Date().toISOString(),
      completed_at: null,
      created_at: new Date().toISOString()
    };
  },

  update: async (id, userId, updates) => {
    const current = await RecoveryModel.findById(id, userId);
    if (!current) return null;

    const nextStatus = updates.status || current.status;
    const nextActual = updates.actualDurationMinutes !== undefined ? Number(updates.actualDurationMinutes) : (updates.actual_duration_minutes !== undefined ? Number(updates.actual_duration_minutes) : current.actual_duration_minutes);
    let nextCompletedAt = current.completed_at;

    if (nextStatus === 'completed' && current.status !== 'completed') {
      nextCompletedAt = new Date();
    }

    await pool.query(
      `UPDATE recovery_sessions 
       SET status = ?, actual_duration_minutes = ?, completed_at = ?
       WHERE id = ? AND user_id = ?`,
      [nextStatus, nextActual, nextCompletedAt, id, userId]
    );

    return {
      ...current,
      status: nextStatus,
      actual_duration_minutes: nextActual,
      completed_at: nextCompletedAt ? new Date(nextCompletedAt).toISOString() : current.completed_at
    };
  }
};

export default RecoveryModel;
