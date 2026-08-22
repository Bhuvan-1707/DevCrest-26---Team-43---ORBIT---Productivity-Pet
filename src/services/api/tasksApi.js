import apiClient from './apiClient.js';

export const tasksApi = {
  /**
   * Get all tasks for authenticated user
   */
  async getTasks() {
    return apiClient('/tasks', { method: 'GET' });
  },

  /**
   * Get specific task by ID
   */
  async getTaskById(id) {
    return apiClient(`/tasks/${id}`, { method: 'GET' });
  },

  /**
   * Create a new task
   */
  async createTask(taskData) {
    return apiClient('/tasks', {
      method: 'POST',
      body: taskData,
    });
  },

  /**
   * Update an existing task
   */
  async updateTask(id, updates) {
    return apiClient(`/tasks/${id}`, {
      method: 'PUT',
      body: updates,
    });
  },

  /**
   * Delete a task
   */
  async deleteTask(id) {
    return apiClient(`/tasks/${id}`, { method: 'DELETE' });
  },
};

export default tasksApi;
