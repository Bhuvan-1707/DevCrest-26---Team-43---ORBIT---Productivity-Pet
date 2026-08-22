import pool from '../config/database.js';

// In-memory memories repository fallback for local dev/test when DB is offline
const memoryStore = new Map();
let memoryIdCounter = 1;
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

export const MemoryModel = {
  findAllByUserId: async (userId, typeFilter = null) => {
    return safeQuery(
      async () => {
        let sql = 'SELECT * FROM memories WHERE user_id = ?';
        const params = [userId];
        if (typeFilter) {
          sql += ' AND type = ?';
          params.push(typeFilter.toLowerCase());
        }
        sql += ' ORDER BY created_at DESC';
        const rows = await pool.query(sql, params);
        return rows.map(r => ({
          ...r,
          is_validated: Boolean(r.is_validated)
        }));
      },
      () => {
        const userMems = [];
        for (const mem of memoryStore.values()) {
          if (Number(mem.user_id) === Number(userId)) {
            if (!typeFilter || mem.type.toLowerCase() === typeFilter.toLowerCase()) {
              userMems.push(mem);
            }
          }
        }
        return userMems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
    );
  },

  create: async ({ userId, type, contentText, category, confidenceRating, isValidated, sessionDate, focusScore }) => {
    const memType = (type || 'live').toLowerCase();
    const content = contentText || 'Memory entry';
    const cat = category || 'General';
    const confRating = confidenceRating || 'High';
    const validated = isValidated !== undefined ? Boolean(isValidated) : false;
    const dateVal = sessionDate ? new Date(sessionDate) : null;
    const scoreVal = focusScore !== undefined ? Number(focusScore) : 85;

    return safeQuery(
      async () => {
        const result = await pool.query(
          `INSERT INTO memories 
           (user_id, type, content_text, category, confidence_rating, is_validated, session_date, focus_score) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, memType, content, cat, confRating, validated, dateVal, scoreVal]
        );
        const insertId = result.insertId ? Number(result.insertId) : Date.now();
        return {
          id: insertId,
          user_id: Number(userId),
          type: memType,
          content_text: content,
          category: cat,
          confidence_rating: confRating,
          is_validated: validated,
          session_date: dateVal ? dateVal.toISOString().split('T')[0] : null,
          focus_score: scoreVal,
          created_at: new Date().toISOString()
        };
      },
      () => {
        const insertId = memoryIdCounter++;
        const newMem = {
          id: insertId,
          user_id: Number(userId),
          type: memType,
          content_text: content,
          category: cat,
          confidence_rating: confRating,
          is_validated: validated,
          session_date: dateVal ? dateVal.toISOString().split('T')[0] : null,
          focus_score: scoreVal,
          created_at: new Date().toISOString()
        };
        memoryStore.set(insertId, newMem);
        return newMem;
      }
    );
  }
};

export default MemoryModel;
