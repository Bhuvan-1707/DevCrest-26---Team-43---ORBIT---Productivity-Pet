import pool from '../config/database.js';

export const MemoryModel = {
  findAllByUserId: async (userId, typeFilter = null) => {
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

  create: async ({ userId, type, contentText, category, confidenceRating, isValidated, sessionDate, focusScore }) => {
    const memType = (type || 'live').toLowerCase();
    const content = contentText || 'Memory entry';
    const cat = category || 'General';
    const confRating = confidenceRating || 'High';
    const validated = isValidated !== undefined ? Boolean(isValidated) : false;
    const dateVal = sessionDate ? new Date(sessionDate) : null;
    const scoreVal = focusScore !== undefined ? Number(focusScore) : 85;

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
  }
};

export default MemoryModel;
