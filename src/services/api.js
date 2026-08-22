import { 
  mockUser, 
  mockTasks, 
  mockFocus, 
  mockWeeklyProductivity, 
  mockGoal, 
  mockRecovery, 
  mockInsights, 
  mockMemories, 
  mockProtocol,
  mockPetState 
} from '../data/mockData';
import { OBSERVATION_TYPES } from '../data/observationData';
import { observationService } from './observationService';

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
 * Easily swappable with backend REST endpoints later.
 */
export const api = {
  // Fetch Dashboard State
  getDashboard: async () => {
    const sessions = getStorageItem(STORAGE_KEYS.SESSIONS, []);
    const focus = getStorageItem(STORAGE_KEYS.FOCUS, mockFocus);
    const petState = getStorageItem(STORAGE_KEYS.PET, 'idle');
    const tasks = getStorageItem(STORAGE_KEYS.TASKS, mockTasks);

    return {
      user: mockUser,
      tasks,
      focus,
      weeklyProductivity: mockWeeklyProductivity,
      goal: mockGoal,
      recovery: mockRecovery,
      insights: mockInsights,
      memories: mockMemories,
      protocol: mockProtocol,
      petState,
      completedSessions: sessions,
    };
  },

  // Tasks API
  getTasks: async () => {
    return getStorageItem(STORAGE_KEYS.TASKS, mockTasks);
  },

  createTask: async (taskData) => {
    const tasks = getStorageItem(STORAGE_KEYS.TASKS, mockTasks);
    const newTask = {
      id: Date.now(),
      title: taskData.title || 'Untitled Task',
      completed: false,
      category: taskData.category || 'General',
      difficulty: taskData.difficulty || 'medium',
      ...taskData,
    };

    const updatedTasks = [newTask, ...tasks];
    setStorageItem(STORAGE_KEYS.TASKS, updatedTasks);

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
    const tasks = getStorageItem(STORAGE_KEYS.TASKS, mockTasks);
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return null;

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
  },

  updateTask: async (taskId, updates) => {
    const tasks = getStorageItem(STORAGE_KEYS.TASKS, mockTasks);
    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return tasks;

    const previousState = { ...targetTask };
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    );
    const newTaskState = updatedTasks.find(t => t.id === taskId);
    setStorageItem(STORAGE_KEYS.TASKS, updatedTasks);

    // Record TASK_COMPLETED or TASK_UPDATED Observation
    const isCompletedNow = updates.completed === true && !previousState.completed;
    const observationType = isCompletedNow ? OBSERVATION_TYPES.TASK_COMPLETED : OBSERVATION_TYPES.TASK_UPDATED;

    observationService.recordObservation({
      type: observationType,
      activity: {
        name: newTaskState.title,
        category: newTaskState.category || 'General',
      },
      context: {
        taskId,
        previousState: { completed: previousState.completed },
        newState: { completed: newTaskState.completed },
      },
      metadata: {
        taskTitle: newTaskState.title,
      },
    });

    return updatedTasks;
  },

  // Sessions API
  recordCompletedSession: async (sessionData) => {
    const existingSessions = getStorageItem(STORAGE_KEYS.SESSIONS, []);
    const newSession = {
      id: Date.now(),
      duration: sessionData.duration || 45,
      focusScore: sessionData.focusScore || 85,
      taskTitle: sessionData.taskTitle || "DAA — Graph Algorithms",
      completedAt: new Date().toISOString(),
    };
    
    const updatedSessions = [newSession, ...existingSessions];
    setStorageItem(STORAGE_KEYS.SESSIONS, updatedSessions);

    // Update Focus Trend and Score
    const currentFocus = getStorageItem(STORAGE_KEYS.FOCUS, mockFocus);
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
