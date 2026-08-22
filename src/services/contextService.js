/**
 * ORBIT Module 2: Context Snapshot Service
 * 
 * Provides structured state snapshots describing the user's current ORBIT environment.
 * Pure context telemetry — contains zero predictions, conclusions, or AI logic.
 */

import { tasksApi, goalsApi, sessionsApi } from './api';

export const contextService = {
  /**
   * Captures and returns a structured context snapshot of the active ORBIT environment.
   * @param {Object} overrides - Optional contextual overrides (e.g. route, sessionStatus)
   * @returns {Promise<Object>} Structured context snapshot object
   */
  getCurrentContext: async (overrides = {}) => {
    try {
      const [tasksRes, goalsRes] = await Promise.allSettled([
        tasksApi.getTasks(),
        goalsApi.getGoals(),
      ]);

      const tasks = tasksRes.status === 'fulfilled' ? (tasksRes.value?.data || tasksRes.value || []) : [];
      const goals = goalsRes.status === 'fulfilled' ? (goalsRes.value?.data || goalsRes.value || []) : [];

      const completedTaskCount = Array.isArray(tasks) ? tasks.filter(t => t.completed).length : 0;
      const activeTaskItem = Array.isArray(tasks) ? tasks.find(t => !t.completed) : null;
      const primaryGoal = Array.isArray(goals) && goals.length > 0 ? goals[0] : null;

      const currentRoute = typeof window !== 'undefined' ? window.location.pathname : '/dashboard';

      return {
        timestamp: new Date().toISOString(),
        route: overrides.route || currentRoute,
        activeTask: overrides.activeTask || {
          id: activeTaskItem?.id || 1,
          title: activeTaskItem?.title || 'Deep Work Focus Block',
          difficulty: activeTaskItem?.difficulty || 'high',
          estimatedMinutes: activeTaskItem?.estimatedMinutes || 45,
        },
        activeSession: overrides.activeSession || {
          id: overrides.sessionId || `sess_active`,
          targetMinutes: 45,
          status: overrides.sessionStatus || 'idle',
        },
        sessionStatus: overrides.sessionStatus || 'idle',
        focusScore: 88,
        completedTasks: completedTaskCount,
        totalTasks: Array.isArray(tasks) ? tasks.length : 0,
        currentGoal: {
          title: primaryGoal?.title || 'Master Full-Stack Productivity System',
          progress: primaryGoal?.totalMilestones ? Math.round((primaryGoal.completedMilestones / primaryGoal.totalMilestones) * 100) : 60,
        },
        recoveryState: 'good',
        petState: overrides.petState || 'idle',
        ...overrides,
      };
    } catch (err) {
      console.error('[ContextService] Error building context snapshot:', err);
      return {
        timestamp: new Date().toISOString(),
        route: typeof window !== 'undefined' ? window.location.pathname : '/dashboard',
        activeTask: { title: 'Deep Work Focus Block' },
        activeSession: { status: 'idle' },
        sessionStatus: 'idle',
        focusScore: 85,
        completedTasks: 0,
        totalTasks: 0,
        currentGoal: { title: 'Master Full-Stack Productivity System', progress: 50 },
        recoveryState: 'good',
        petState: 'idle',
        ...overrides,
      };
    }
  },
};

export default contextService;
