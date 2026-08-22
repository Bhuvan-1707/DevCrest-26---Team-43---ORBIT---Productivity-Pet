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
 * Demo Observations Stream
 * Realistic sample observation logs illustrating the telemetry pipeline.
 */
export const mockObservations = [
  {
    id: 'obs_1700000000001_a1b2c',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    type: OBSERVATION_TYPES.PAGE_VIEW,
    source: 'ORBIT_FRONTEND_APP',
    activity: {
      name: 'Navigated to Dashboard',
      category: 'Navigation',
      duration: 0,
    },
    context: {
      page: '/dashboard',
      taskId: null,
      sessionId: null,
    },
    metadata: {
      referrer: '/login',
      device: 'Desktop',
    },
  },
  {
    id: 'obs_1700000000002_d3e4f',
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    type: OBSERVATION_TYPES.TASK_COMPLETED,
    source: 'ORBIT_FRONTEND_APP',
    activity: {
      name: 'Review graph basics',
      category: 'Learning',
      duration: 25,
    },
    context: {
      page: '/dashboard',
      taskId: 1,
      sessionId: null,
    },
    metadata: {
      difficulty: 'medium',
      estimatedMinutes: 25,
    },
  },
  {
    id: 'obs_1700000000003_g5h6i',
    timestamp: new Date(Date.now() - 3600000 * 1.2).toISOString(),
    type: OBSERVATION_TYPES.SESSION_STARTED,
    source: 'ORBIT_FRONTEND_APP',
    activity: {
      name: 'Focus Session: DAA — Graph Algorithms',
      category: 'Practice',
      duration: 0,
    },
    context: {
      page: '/session',
      taskId: 2,
      sessionId: 'sess_991823',
    },
    metadata: {
      plannedDurationMinutes: 45,
      targetDifficulty: 'High',
    },
  },
  {
    id: 'obs_1700000000004_j7k8l',
    timestamp: new Date(Date.now() - 3600000 * 0.5).toISOString(),
    type: OBSERVATION_TYPES.SESSION_COMPLETED,
    source: 'ORBIT_FRONTEND_APP',
    activity: {
      name: 'Focus Session: DAA — Graph Algorithms',
      category: 'Practice',
      duration: 43,
    },
    context: {
      page: '/session',
      taskId: 2,
      sessionId: 'sess_991823',
    },
    metadata: {
      actualDurationMinutes: 43,
      focusScoreRating: 85,
      completionStatus: 'successful',
    },
  },
  {
    id: 'obs_1700000000005_m9n0p',
    timestamp: new Date(Date.now() - 3600000 * 0.2).toISOString(),
    type: OBSERVATION_TYPES.RECOVERY_STARTED,
    source: 'ORBIT_FRONTEND_APP',
    activity: {
      name: 'Short Micro-Break Recovery',
      category: 'Recovery',
      duration: 6,
    },
    context: {
      page: '/dashboard',
      taskId: null,
      sessionId: null,
    },
    metadata: {
      recommendedDurationMinutes: 6,
      trigger: 'POST_SESSION_RECOVERY',
    },
  },
];
