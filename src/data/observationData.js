/**
 * ORBIT Module 2: Observation Data Model & Telemetry Definitions
 * 
 * Defines structured observation event schemas for recording user activity telemetry.
 * Conceptual Pipeline: USER ACTIVITY → EVENT → OBSERVATION → CONTEXT → STORED RECORD
 */

// Supported Observation Event Types
export const OBSERVATION_TYPES = {
  SESSION_STARTED: 'SESSION_STARTED',
  SESSION_PAUSED: 'SESSION_PAUSED',
  SESSION_RESUMED: 'SESSION_RESUMED',
  SESSION_COMPLETED: 'SESSION_COMPLETED',
  TASK_STARTED: 'TASK_STARTED',
  TASK_COMPLETED: 'TASK_COMPLETED',
  TASK_CREATED: 'TASK_CREATED',
  TASK_UPDATED: 'TASK_UPDATED',
  PAGE_VIEW: 'PAGE_VIEW',
  RECOVERY_STARTED: 'RECOVERY_STARTED',
};

/**
 * Lightweight Validation helper to enforce data integrity for observation events.
 * Returns { valid: boolean, errors: Array<string>, observation: Object|null }
 */
export function validateObservation(obs) {
  const errors = [];
  if (!obs || typeof obs !== 'object') {
    return { valid: false, errors: ['Observation payload must be an object'], observation: null };
  }

  // 1. Unique ID
  const id = obs.id || `obs_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // 2. Timestamp validation
  let timestamp = obs.timestamp;
  if (!timestamp || isNaN(new Date(timestamp).getTime())) {
    timestamp = new Date().toISOString();
  }

  // 3. Valid Type Check
  const validTypes = Object.values(OBSERVATION_TYPES);
  if (!obs.type || !validTypes.includes(obs.type)) {
    errors.push(`Invalid observation type: "${obs.type}". Supported types: ${validTypes.join(', ')}`);
  }

  const context = { ...(obs.context || {}) };

  // 4. Session observations must contain sessionId
  if (obs.type && obs.type.startsWith('SESSION_')) {
    if (!context.sessionId) {
      errors.push(`Session observation "${obs.type}" must contain context.sessionId`);
    }
  }

  // 5. Task observations must contain taskId
  if (obs.type && obs.type.startsWith('TASK_')) {
    if (!context.taskId) {
      errors.push(`Task observation "${obs.type}" must contain context.taskId`);
    }
  }

  // 6. PAGE_VIEW observations must contain route information
  if (obs.type === OBSERVATION_TYPES.PAGE_VIEW) {
    if (!context.page && !context.route) {
      errors.push('PAGE_VIEW observation must contain route information in context.page');
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors, observation: null };
  }

  // Return validated & sanitized observation record
  return {
    valid: true,
    errors: [],
    observation: {
      ...obs,
      id,
      timestamp,
      type: obs.type,
      source: obs.source || 'ORBIT_FRONTEND_APP',
      activity: obs.activity || { name: 'Unspecified Activity', category: 'General', duration: 0 },
      context: {
        page: context.page || context.route || '/dashboard',
        taskId: context.taskId || null,
        sessionId: context.sessionId || null,
        userState: context.userState || 'active',
        ...context,
      },
      metadata: obs.metadata || {},
    },
  };
}

/**
 * Factory function to construct standardized ORBIT Observation objects
 */
export function createObservation({
  type,
  activity = {},
  context = {},
  metadata = {},
  source = 'ORBIT_FRONTEND_APP',
  id,
  timestamp,
}) {
  return {
    id: id || `obs_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: timestamp || new Date().toISOString(),
    type,
    source,
    activity: {
      name: activity.name || 'Unspecified Activity',
      category: activity.category || 'General',
      duration: activity.duration || 0,
      ...activity,
    },
    context: {
      page: context.page || context.route || '/dashboard',
      taskId: context.taskId || null,
      sessionId: context.sessionId || null,
      userState: context.userState || 'active',
      ...context,
    },
    metadata: {
      clientTime: new Date().toLocaleTimeString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'node',
      ...metadata,
    },
  };
}

/**
 * Observations Log Initializer
 * Production Clean State - Zero Seeded Observations
 */
export const mockObservations = [];
