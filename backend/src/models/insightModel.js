import pool from '../config/database.js';

export const InsightModel = {
  findAllByUserId: async (userId) => {
    const rows = await pool.query(
      'SELECT * FROM insights WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows.map(r => ({
      ...r,
      is_demo_data: Boolean(r.is_demo_data)
    }));
  },

  create: async ({ userId, title, description, confidenceScore, evidenceCount, type, isDemoData }) => {
    const insTitle = title;
    const insDesc = description || 'Productivity pattern observation';
    const insScore = confidenceScore !== undefined ? Number(confidenceScore) : 80;
    const insCount = evidenceCount !== undefined ? Number(evidenceCount) : 1;
    const insType = type || 'Observation';
    const insDemo = isDemoData !== undefined ? Boolean(isDemoData) : false;

    const result = await pool.query(
      `INSERT INTO insights 
       (user_id, title, description, confidence_score, evidence_count, type, is_demo_data) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, insTitle, insDesc, insScore, insCount, insType, insDemo]
    );
    const insertId = result.insertId ? Number(result.insertId) : Date.now();
    return {
      id: insertId,
      user_id: Number(userId),
      title: insTitle,
      description: insDesc,
      confidence_score: insScore,
      evidence_count: insCount,
      type: insType,
      is_demo_data: insDemo,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
};

export default InsightModel;
