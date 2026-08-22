import pool from '../config/database.js';

// In-memory sessions repository fallback for local dev/test when DB is offline
const memorySessions = new Map();
let memorySessionIdCounter = 1;
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

export const SessionModel = {
  findAllByUserId: async (userId) => {
    return safeQuery(
      async () => {
        const rows = await pool.query(
          'SELECT * FROM focus_sessions WHERE user_id = ? ORDER BY created_at DESC',
          [userId]
        );
        return rows;
      },
      () => {
        const userSessions = [];
        for (const session of memorySessions.values()) {
          if (Number(session.user_id) === Number(userId)) {
            userSessions.push(session);
          }
        }
        return userSessions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
    );
  },

  findById: async (id, userId) => {
    return safeQuery(
      async () => {
        const rows = await pool.query(
          'SELECT * FROM focus_sessions WHERE id = ? AND user_id = ?',
          [id, userId]
        );
        if (rows && rows.length > 0) {
          return rows[0];
        }
        return null;
      },
      () => {
        const session = memorySessions.get(Number(id));
        if (session && Number(session.user_id) === Number(userId)) {
          return session;
        }
        return null;
      }
    );
  },

  create: async ({ userId, taskId, sessionCode, taskTitle, plannedDurationMinutes }) => {
    const title = taskTitle || 'DAA — Graph Algorithms';
    const planned = plannedDurationMinutes ? Number(plannedDurationMinutes) : 45;
    const code = sessionCode || `sess_${Date.now()}`;
    const tId = taskId ? Number(taskId) : null;

    return safeQuery(
      async () => {
        const result = await pool.query(
          `INSERT INTO focus_sessions 
           (user_id, task_id, session_code, task_title, planned_duration_minutes, actual_duration_minutes, focus_score, status, started_at) 
           VALUES (?, ?, ?, ?, ?, 0, 85, 'running', CURRENT_TIMESTAMP)`,
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
          focus_score: 85,
          status: 'running',
          started_at: new Date().toISOString(),
          completed_at: null,
          created_at: new Date().toISOString()
        };
      },
      () => {
        const insertId = memorySessionIdCounter++;
        const newSession = {
          id: insertId,
          user_id: Number(userId),
          task_id: tId,
          session_code: code,
          task_title: title,
          planned_duration_minutes: planned,
          actual_duration_minutes: 0,
          focus_score: 85,
          status: 'running',
          started_at: new Date().toISOString(),
          completed_at: null,
          created_at: new Date().toISOString()
        };
        memorySessions.set(insertId, newSession);
        return newSession;
      }
    );
  },

  update: async (id, userId, updates) => {
    return safeQuery(
      async () => {
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
      },
      () => {
        const current = memorySessions.get(Number(id));
        if (!current || Number(current.user_id) !== Number(userId)) return null;

        const nextStatus = updates.status || current.status;
        const nextActual = updates.actual_duration_minutes !== undefined ? Number(updates.actual_duration_minutes) : current.actual_duration_minutes;
        const nextFocusScore = updates.focus_score !== undefined ? Number(updates.focus_score) : current.focus_score;

        let nextCompletedAt = current.completed_at;
        if (nextStatus === 'completed' && current.status !== 'completed') {
          nextCompletedAt = new Date().toISOString();
        }

        const updatedSession = {
          ...current,
          status: nextStatus,
          actual_duration_minutes: nextActual,
          focus_score: nextFocusScore,
          completed_at: nextCompletedAt
        };
        memorySessions.set(Number(id), updatedSession);
        return updatedSession;
      }
    );
  }
};

export default SessionModel;
