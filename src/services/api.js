import { OBSERVATION_TYPES } from '../data/observationData';
import { observationService } from './observationService';
import tasksApi from './api/tasksApi.js';

const STORAGE_KEYS = {
  SESSIONS: 'orbit_completed_sessions',
  FOCUS: 'orbit_focus_state',
  PET: 'orbit_pet_state',
  TASKS: 'orbit_tasks_state',
};

// Helper to get items from localStorage with fallback
const getStorageItem = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

// Helper to save items to localStorage
const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
};

/**
 * ORBIT API Service Abstraction
 * Designed to return Promise-based async responses.
 */
export const api = {
  // Fetch Dashboard State
  getDashboard: async () => {
    const sessions = getStorageItem(STORAGE_KEYS.SESSIONS, []);
    const focus = getStorageItem(STORAGE_KEYS.FOCUS, { current: 0, change: 0 });
    const petState = getStorageItem(STORAGE_KEYS.PET, 'idle');
    const tasks = getStorageItem(STORAGE_KEYS.TASKS, []);

    return {
      tasks,
      focus,
      weeklyProductivity: [],
      goal: null,
      recovery: null,
      insights: [],
      memories: [],
      protocol: null,
      petState,
      completedSessions: sessions,
    };
  },

  // Tasks API
  getTasks: async () => {
    try {
      const res = await tasksApi.getTasks();
      const rawTasks = res?.data || res || [];
      return rawTasks.map(t => ({
        id: t.id,
        title: t.title,
        status: t.status || (t.completed ? 'completed' : 'pending'),
        completed: t.status === 'completed' || Boolean(t.completed),
        category: t.category || t.difficulty || 'General',
        difficulty: t.difficulty || 'medium',
      }));
    } catch (err) {
      console.warn('[API Service] Backend tasks fetch error:', err.message);
      return getStorageItem(STORAGE_KEYS.TASKS, []);
    }
  },

  createTask: async (taskData) => {
    let newTask;
    try {
      const res = await tasksApi.createTask({
        title: taskData.title || 'Untitled Task',
        category: taskData.category || 'General',
        difficulty: taskData.difficulty || 'medium',
        status: 'pending',
      });
      const data = res?.data || res;
      newTask = {
        id: data.id,
        title: data.title,
        status: data.status || 'pending',
        completed: data.status === 'completed',
        category: data.category || data.difficulty || 'General',
        difficulty: data.difficulty || 'medium',
      };
    } catch (err) {
      console.warn('[API Service] Backend task creation fallback:', err.message);
      const tasks = getStorageItem(STORAGE_KEYS.TASKS, []);
      newTask = {
        id: Date.now(),
        title: taskData.title || 'Untitled Task',
        completed: false,
        status: 'pending',
        category: taskData.category || 'General',
        difficulty: taskData.difficulty || 'medium',
        ...taskData,
      };
      setStorageItem(STORAGE_KEYS.TASKS, [newTask, ...tasks]);
    }

    // Record TASK_CREATED Observation
    observationService.recordObservation({
      type: OBSERVATION_TYPES.TASK_CREATED,
      activity: {
        name: newTask.title,
        category: newTask.category,
      },
      context: {
        taskId: newTask.id,
        newState: { completed: false },
      },
      metadata: {
        taskTitle: newTask.title,
      },
    });

    return newTask;
  },

  startTask: async (taskId) => {
    try {
      const res = await tasksApi.updateTask(taskId, { status: 'in_progress' });
      const targetTask = res?.data || res;

      // Record TASK_STARTED Observation
      observationService.recordObservation({
        type: OBSERVATION_TYPES.TASK_STARTED,
        activity: {
          name: targetTask.title,
          category: targetTask.category || 'General',
        },
        context: {
          taskId: targetTask.id,
          userState: 'focused',
        },
        metadata: {
          taskTitle: targetTask.title,
        },
      });

      return targetTask;
    } catch (err) {
      console.warn('[API Service] Backend task start error:', err.message);
      return null;
    }
  },

  updateTask: async (taskId, updates) => {
    let updatedTask;
    const isCompletedNow = updates.completed === true || updates.status === 'completed';
    const backendStatus = isCompletedNow ? 'completed' : (updates.status || 'pending');

    try {
      const res = await tasksApi.updateTask(taskId, {
        title: updates.title,
        status: backendStatus,
        difficulty: updates.difficulty,
      });
      const data = res?.data || res;
      updatedTask = {
        id: data.id,
        title: data.title,
        status: data.status,
        completed: data.status === 'completed',
        category: data.category || data.difficulty || 'General',
        difficulty: data.difficulty || 'medium',
      };
    } catch (err) {
      console.warn('[API Service] Backend task update fallback:', err.message);
      updatedTask = { id: taskId, ...updates };
    }

    // Record TASK_COMPLETED or TASK_UPDATED Observation
    const observationType = isCompletedNow ? OBSERVATION_TYPES.TASK_COMPLETED : OBSERVATION_TYPES.TASK_UPDATED;

    observationService.recordObservation({
      type: observationType,
      activity: {
        name: updatedTask.title,
        category: updatedTask.category || 'General',
      },
      context: {
        taskId,
        newState: { completed: isCompletedNow },
      },
      metadata: {
        taskTitle: updatedTask.title,
      },
    });

    return updatedTask;
  },

  deleteTask: async (taskId) => {
    try {
      await tasksApi.deleteTask(taskId);
      return true;
    } catch (err) {
      console.warn('[API Service] Backend task delete error:', err.message);
      return false;
    }
  },

  // Sessions API
  recordCompletedSession: async (sessionData) => {
    const existingSessions = getStorageItem(STORAGE_KEYS.SESSIONS, []);
    const newSession = {
      id: Date.now(),
      duration: sessionData.duration || sessionData.plannedDurationMinutes || 45,
      focusScore: sessionData.focusScore || 85,
      taskTitle: sessionData.taskTitle || "Focus Session",
      completedAt: new Date().toISOString(),
    };
    
    const updatedSessions = [newSession, ...existingSessions];
    setStorageItem(STORAGE_KEYS.SESSIONS, updatedSessions);

    // Update Focus Trend and Score
    const currentFocus = getStorageItem(STORAGE_KEYS.FOCUS, { current: 0, change: 0 });
    const updatedFocus = {
      ...currentFocus,
      current: Math.min(100, currentFocus.current + 3),
      change: currentFocus.change + 1,
    };
    setStorageItem(STORAGE_KEYS.FOCUS, updatedFocus);

    // Set Pet State to Happy
    setStorageItem(STORAGE_KEYS.PET, 'happy');

    return {
      session: newSession,
      focus: updatedFocus,
    };
  },

  // Reset/Clear Demo Session State
  resetSessionState: async () => {
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.FOCUS);
    localStorage.removeItem(STORAGE_KEYS.PET);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
  }
};
