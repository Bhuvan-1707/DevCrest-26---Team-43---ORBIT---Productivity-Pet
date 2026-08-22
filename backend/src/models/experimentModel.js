import pool from '../config/database.js';

export const ExperimentModel = {
  findAllByUserId: async (userId) => {
    const rows = await pool.query(
      'SELECT * FROM experiments WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  },

  findById: async (id, userId) => {
    const rows = await pool.query(
      'SELECT * FROM experiments WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (rows && rows.length > 0) {
      return rows[0];
    }
    return null;
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

  update: async (id, userId, updates) => {
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

  delete: async (id, userId) => {
    const result = await pool.query(
      'DELETE FROM experiments WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  },
};

export default ExperimentModel;
