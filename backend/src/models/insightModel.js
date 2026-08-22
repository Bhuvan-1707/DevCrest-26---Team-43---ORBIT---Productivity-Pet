import pool from '../config/database.js';

// In-memory insights repository fallback for local dev/test when DB is offline
const insightStore = new Map();
let insightIdCounter = 1;
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

export const InsightModel = {
  findAllByUserId: async (userId) => {
    return safeQuery(
      async () => {
        const rows = await pool.query(
          'SELECT * FROM insights WHERE user_id = ? ORDER BY created_at DESC',
          [userId]
        );
        return rows.map(r => ({
          ...r,
          is_demo_data: Boolean(r.is_demo_data)
        }));
      },
      () => {
        const userInsights = [];
        for (const ins of insightStore.values()) {
          if (Number(ins.user_id) === Number(userId)) {
            userInsights.push(ins);
          }
        }
        return userInsights.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
    );
  },

  create: async ({ userId, title, description, confidenceScore, evidenceCount, type, isDemoData }) => {
    const insTitle = title;
    const insDesc = description || 'Productivity pattern observation';
    const insScore = confidenceScore !== undefined ? Number(confidenceScore) : 80;
    const insCount = evidenceCount !== undefined ? Number(evidenceCount) : 1;
    const insType = type || 'Observation';
    const insDemo = isDemoData !== undefined ? Boolean(isDemoData) : false;

    return safeQuery(
      async () => {
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
      },
      () => {
        const insertId = insightIdCounter++;
        const newInsight = {
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
        insightStore.set(insertId, newInsight);
        return newInsight;
      }
    );
  }
};

export default InsightModel;
