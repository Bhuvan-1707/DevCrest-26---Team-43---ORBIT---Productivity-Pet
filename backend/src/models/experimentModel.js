import pool from '../config/database.js';

// In-memory experiments repository fallback for local dev/test when DB is offline
const memoryExperiments = new Map();
let memoryExpIdCounter = 1;
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

export const ExperimentModel = {
  findAllByUserId: async (userId) => {
    return safeQuery(
      async () => {
        const rows = await pool.query(
          'SELECT * FROM experiments WHERE user_id = ? ORDER BY created_at DESC',
          [userId]
        );
        return rows;
      },
      () => {
        const userExps = [];
        for (const exp of memoryExperiments.values()) {
          if (Number(exp.user_id) === Number(userId)) {
            userExps.push(exp);
          }
        }
        return userExps.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
    );
  },

  findById: async (id, userId) => {
    return safeQuery(
      async () => {
        const rows = await pool.query(
          'SELECT * FROM experiments WHERE id = ? AND user_id = ?',
          [id, userId]
        );
        if (rows && rows.length > 0) {
          return rows[0];
        }
        return null;
      },
      () => {
        const exp = memoryExperiments.get(Number(id));
        if (exp && Number(exp.user_id) === Number(userId)) {
          return exp;
        }
        return null;
      }
    );
  },

  create: async ({ userId, title, hypothesis, variableTested, status, outcomeSummary, confidenceScore, startedAt, endedAt }) => {
    const expTitle = title;
    const expHyp = hypothesis || null;
    const expVar = variableTested || null;
    const expStatus = status || 'active';
    const expOutcome = outcomeSummary || null;
    const expScore = confidenceScore !== undefined ? Number(confidenceScore) : 75;
    const expStart = startedAt ? new Date(startedAt) : new Date();
    const expEnd = endedAt ? new Date(endedAt) : null;

    return safeQuery(
      async () => {
        const result = await pool.query(
          `INSERT INTO experiments 
           (user_id, title, hypothesis, variable_tested, status, outcome_summary, confidence_score, started_at, ended_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, expTitle, expHyp, expVar, expStatus, expOutcome, expScore, expStart, expEnd]
        );
        const insertId = result.insertId ? Number(result.insertId) : Date.now();
        return {
          id: insertId,
          user_id: Number(userId),
          title: expTitle,
          hypothesis: expHyp,
          variable_tested: expVar,
          status: expStatus,
          outcome_summary: expOutcome,
          confidence_score: expScore,
          started_at: expStart.toISOString(),
          ended_at: expEnd ? expEnd.toISOString() : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      },
      () => {
        const insertId = memoryExpIdCounter++;
        const newExp = {
          id: insertId,
          user_id: Number(userId),
          title: expTitle,
          hypothesis: expHyp,
          variable_tested: expVar,
          status: expStatus,
          outcome_summary: expOutcome,
          confidence_score: expScore,
          started_at: expStart.toISOString(),
          ended_at: expEnd ? expEnd.toISOString() : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        memoryExperiments.set(insertId, newExp);
        return newExp;
      }
    );
  },

  update: async (id, userId, updates) => {
    return safeQuery(
      async () => {
        const current = await ExperimentModel.findById(id, userId);
        if (!current) return null;

        const nextTitle = updates.title !== undefined ? updates.title : current.title;
        const nextHyp = updates.hypothesis !== undefined ? updates.hypothesis : current.hypothesis;
        const nextVar = updates.variableTested !== undefined ? updates.variableTested : (updates.variable_tested !== undefined ? updates.variable_tested : current.variable_tested);
        const nextStatus = updates.status !== undefined ? updates.status : current.status;
        const nextOutcome = updates.outcomeSummary !== undefined ? updates.outcomeSummary : (updates.outcome_summary !== undefined ? updates.outcome_summary : current.outcome_summary);
        const nextScore = updates.confidenceScore !== undefined ? Number(updates.confidenceScore) : (updates.confidence_score !== undefined ? Number(updates.confidence_score) : current.confidence_score);
        const nextEnd = updates.endedAt ? new Date(updates.endedAt) : (nextStatus === 'completed' ? new Date() : current.ended_at);

        await pool.query(
          `UPDATE experiments 
           SET title = ?, hypothesis = ?, variable_tested = ?, status = ?, outcome_summary = ?, confidence_score = ?, ended_at = ?
           WHERE id = ? AND user_id = ?`,
          [nextTitle, nextHyp, nextVar, nextStatus, nextOutcome, nextScore, nextEnd, id, userId]
        );

        return {
          ...current,
          title: nextTitle,
          hypothesis: nextHyp,
          variable_tested: nextVar,
          status: nextStatus,
          outcome_summary: nextOutcome,
          confidence_score: nextScore,
          ended_at: nextEnd ? new Date(nextEnd).toISOString() : current.ended_at,
          updated_at: new Date().toISOString(),
        };
      },
      () => {
        const current = memoryExperiments.get(Number(id));
        if (!current || Number(current.user_id) !== Number(userId)) return null;

        const nextStatus = updates.status !== undefined ? updates.status : current.status;
        let nextEnd = current.ended_at;
        if (updates.endedAt) nextEnd = new Date(updates.endedAt).toISOString();
        else if (nextStatus === 'completed' && current.status !== 'completed') nextEnd = new Date().toISOString();

        const updatedExp = {
          ...current,
          ...updates,
          title: updates.title !== undefined ? updates.title : current.title,
          hypothesis: updates.hypothesis !== undefined ? updates.hypothesis : current.hypothesis,
          variable_tested: updates.variableTested !== undefined ? updates.variableTested : (updates.variable_tested !== undefined ? updates.variable_tested : current.variable_tested),
          status: nextStatus,
          outcome_summary: updates.outcomeSummary !== undefined ? updates.outcomeSummary : (updates.outcome_summary !== undefined ? updates.outcome_summary : current.outcome_summary),
          confidence_score: updates.confidenceScore !== undefined ? Number(updates.confidenceScore) : (updates.confidence_score !== undefined ? Number(updates.confidence_score) : current.confidence_score),
          ended_at: nextEnd,
          updated_at: new Date().toISOString(),
        };
        memoryExperiments.set(Number(id), updatedExp);
        return updatedExp;
      }
    );
  },

  delete: async (id, userId) => {
    return safeQuery(
      async () => {
        const result = await pool.query(
          'DELETE FROM experiments WHERE id = ? AND user_id = ?',
          [id, userId]
        );
        return result.affectedRows > 0;
      },
      () => {
        const exp = memoryExperiments.get(Number(id));
        if (exp && Number(exp.user_id) === Number(userId)) {
          memoryExperiments.delete(Number(id));
          return true;
        }
        return false;
      }
    );
  },
};

export default ExperimentModel;
