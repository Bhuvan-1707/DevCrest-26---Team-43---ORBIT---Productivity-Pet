import pool from '../config/database.js';

// Format database row to Module 2 frontend schema object
const formatObservationRow = (row) => {
  if (!row) return null;

  let context = {};
  let metadata = {};

  try {
    context = typeof row.context_json === 'string' ? JSON.parse(row.context_json) : (row.context_json || {});
  } catch (e) {
    context = {};
  }

  try {
    metadata = typeof row.metadata_json === 'string' ? JSON.parse(row.metadata_json) : (row.metadata_json || {});
  } catch (e) {
    metadata = {};
  }

  return {
    id: row.id,
    user_id: Number(row.user_id),
    timestamp: row.timestamp ? new Date(row.timestamp).toISOString() : new Date().toISOString(),
    type: row.type,
    source: row.source || 'ORBIT_FRONTEND_APP',
    activity: {
      name: row.activity_name,
      category: row.activity_category || 'General',
      duration: Number(row.activity_duration || 0),
    },
    context: {
      page: row.route || '/dashboard',
      taskId: row.task_id ? Number(row.task_id) : context.taskId,
      sessionId: context.sessionId || row.focus_session_id,
      ...context,
    },
    metadata: {
      ...metadata,
    },
  };
};

export const ObservationModel = {
  findAllByUserId: async (userId) => {
    const rows = await pool.query(
      'SELECT * FROM observations WHERE user_id = ? ORDER BY timestamp DESC',
      [userId]
    );
    return rows.map(formatObservationRow);
  },

  findById: async (id, userId) => {
    const rows = await pool.query(
      'SELECT * FROM observations WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    if (rows && rows.length > 0) {
      return formatObservationRow(rows[0]);
    }
    return null;
  },

  create: async ({ userId, id, type, source, activity, context, metadata, timestamp }) => {
    const obsId = id || `obs_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const obsSource = source || 'ORBIT_FRONTEND_APP';
    const obsTimestamp = timestamp || new Date().toISOString();
    const activityName = activity?.name || 'General Activity';
    const activityCategory = activity?.category || 'General';
    const activityDuration = activity?.duration ? Number(activity.duration) : 0;
    const route = context?.page || metadata?.route || '/dashboard';
    const taskId = context?.taskId ? Number(context.taskId) : null;

    const contextJson = JSON.stringify(context || {});
    const metadataJson = JSON.stringify(metadata || {});

    await pool.query(
      `INSERT INTO observations 
       (id, user_id, type, source, activity_name, activity_category, activity_duration, route, task_id, context_json, metadata_json, timestamp) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [obsId, userId, type, obsSource, activityName, activityCategory, activityDuration, route, taskId, contextJson, metadataJson, new Date(obsTimestamp)]
    );

    return {
      id: obsId,
      user_id: Number(userId),
      timestamp: obsTimestamp,
      type,
      source: obsSource,
      activity: {
        name: activityName,
        category: activityCategory,
        duration: activityDuration,
      },
      context: context || { page: route },
      metadata: metadata || {},
    };
  },
};

export default ObservationModel;
