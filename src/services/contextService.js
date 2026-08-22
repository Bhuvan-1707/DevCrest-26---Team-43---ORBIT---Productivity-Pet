/**
 * ORBIT Module 2: Context Snapshot Service
 * 
 * Provides structured state snapshots describing the user's current ORBIT environment.
 * Pure context telemetry — contains zero predictions, conclusions, or AI logic.
 */

import { api } from './api';
import { mockFocus } from '../data/mockData';

export const contextService = {
  /**
   * Captures and returns a structured context snapshot of the active ORBIT environment.
   * @param {Object} overrides - Optional contextual overrides (e.g. route, sessionStatus)
   * @returns {Promise<Object>} Structured context snapshot object
   */
  getCurrentContext: async (overrides = {}) => {
    try {
      const dashboardData = await api.getDashboard();
      const tasks = dashboardData.tasks || [];
      const completedTaskCount = tasks.filter(t => t.completed).length;

      const currentRoute = typeof window !== 'undefined' ? window.location.pathname : '/dashboard';

      return {
        timestamp: new Date().toISOString(),
        route: overrides.route || currentRoute,
        activeTask: overrides.activeTask || {
          id: mockFocus.activeFocusItem.id || 2,
          title: mockFocus.activeFocusItem.title,
          difficulty: mockFocus.activeFocusItem.difficulty,
          estimatedMinutes: mockFocus.activeFocusItem.estimatedMinutes || 45,
        },
        activeSession: overrides.activeSession || {
          id: overrides.sessionId || `sess_active`,
          targetMinutes: 45,
          status: overrides.sessionStatus || 'idle',
        },
        sessionStatus: overrides.sessionStatus || 'idle',
        focusScore: dashboardData.focus?.current || 82,
        completedTasks: completedTaskCount,
        totalTasks: tasks.length,
        currentGoal: {
          title: dashboardData.goal?.title || 'Become proficient in DAA',
          progress: dashboardData.goal?.progress || 78,
        },
        recoveryState: dashboardData.recovery?.state || 'good',
        petState: dashboardData.petState || 'idle',
        ...overrides,
      };
    } catch (err) {
      console.error('[ContextService] Error building context snapshot:', err);
      return {
        timestamp: new Date().toISOString(),
        route: typeof window !== 'undefined' ? window.location.pathname : '/dashboard',
        activeTask: { title: 'DAA — Graph Algorithms' },
        activeSession: { status: 'idle' },
        sessionStatus: 'idle',
        focusScore: 82,
        completedTasks: 2,
        totalTasks: 5,
        currentGoal: { title: 'Become proficient in DAA', progress: 78 },
        recoveryState: 'good',
        petState: 'idle',
        ...overrides,
      };
    }
  },
};

export default contextService;
