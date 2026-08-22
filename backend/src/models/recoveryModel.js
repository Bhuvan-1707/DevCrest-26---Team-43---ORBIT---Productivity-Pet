import pool from '../config/database.js';

// In-memory recovery sessions repository fallback for local dev/test when DB is offline
const memoryRecovery = new Map();
let memoryRecoveryIdCounter = 1;
let isDbActive = true;

// Helper for quick fallback
const safeQuery = async (queryFn, fallbackFn) => {
  if (!isDbActive) return fallbackFn();
  try {
    return await Promise.race([
      queryFn(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 1000))
    ]);
  } catch (err) {
    isDbActive = false;
    return fallbackFn();
  }
};

export const RecoveryModel = {
  findAllByUserId: async (userId) => {
    return safeQuery(
      async () => {
        const rows = await pool.query(
          'SELECT * FROM recovery_sessions WHERE user_id = ? ORDER BY started_at DESC',
          [userId]
        );
        return rows;
      },
      () => {
        const userSessions = [];
        for (const session of memoryRecovery.values()) {
          if (Number(session.user_id) === Number(userId)) {
            userSessions.push(session);
          }
        }
        return userSessions.sort((a, b) => new Date(b.started_at) - new Date(a.started_at));
      }
    );
  },

  findById: async (id, userId) => {
    return safeQuery(
      async () => {
        const rows = await pool.query(
          'SELECT * FROM recovery_sessions WHERE id = ? AND user_id = ?',
          [id, userId]
        );
        if (rows && rows.length > 0) {
          return rows[0];
        }
        return null;
      },
      () => {
        const session = memoryRecovery.get(Number(id));
        if (session && Number(session.user_id) === Number(userId)) {
          return session;
        }
        return null;
      }
    );
  },

  create: async ({ userId, focusSessionId, recommendedDurationMinutes, fatigueLevel, triggerReason }) => {
    const focusId = focusSessionId ? Number(focusSessionId) : null;
    const recDur = recommendedDurationMinutes ? Number(recommendedDurationMinutes) : 6;
    const fatigue = fatigueLevel || 'Low';
    const reason = triggerReason || 'POST_SESSION_RECOVERY';

    return safeQuery(
      async () => {
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
      () => {
        const insertId = memoryRecoveryIdCounter++;
        const newSession = {
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
        memoryRecovery.set(insertId, newSession);
        return newSession;
      }
    );
  },

  update: async (id, userId, updates) => {
    return safeQuery(
      async () => {
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
      },
      () => {
        const current = memoryRecovery.get(Number(id));
        if (!current || Number(current.user_id) !== Number(userId)) return null;

        const nextStatus = updates.status || current.status;
        const nextActual = updates.actualDurationMinutes !== undefined ? Number(updates.actualDurationMinutes) : (updates.actual_duration_minutes !== undefined ? Number(updates.actual_duration_minutes) : current.actual_duration_minutes);
        let nextCompletedAt = current.completed_at;

        if (nextStatus === 'completed' && current.status !== 'completed') {
          nextCompletedAt = new Date().toISOString();
        }

        const updatedSession = {
          ...current,
          status: nextStatus,
          actual_duration_minutes: nextActual,
          completed_at: nextCompletedAt
        };
        memoryRecovery.set(Number(id), updatedSession);
        return updatedSession;
      }
    );
  }
};

export default RecoveryModel;
