import apiClient from './apiClient.js';

export const goalsApi = {
  /**
   * Get all goals for authenticated user
   */
  async getGoals() {
    return apiClient('/goals', { method: 'GET' });
  },

  /**
   * Get specific goal by ID
   */
  async getGoalById(id) {
    return apiClient(`/goals/${id}`, { method: 'GET' });
  },

  /**
   * Create a new goal
   */
  async createGoal(goalData) {
    return apiClient('/goals', {
      method: 'POST',
      body: goalData,
    });
  },

  /**
   * Update an existing goal
   */
  async updateGoal(id, updates) {
    return apiClient(`/goals/${id}`, {
      method: 'PUT',
      body: updates,
    });
  },

  /**
   * Delete a goal
   */
  async deleteGoal(id) {
    return apiClient(`/goals/${id}`, { method: 'DELETE' });
  },
};

export default goalsApi;
