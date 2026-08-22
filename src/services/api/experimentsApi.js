import apiClient from './apiClient.js';

export const experimentsApi = {
  /**
   * Get all experiments for authenticated user
   */
  async getExperiments() {
    return apiClient('/experiments', { method: 'GET' });
  },

  /**
   * Get specific experiment by ID
   */
  async getExperimentById(id) {
    return apiClient(`/experiments/${id}`, { method: 'GET' });
  },

  /**
   * Create a new experiment
   */
  async createExperiment(experimentData) {
    return apiClient('/experiments', {
      method: 'POST',
      body: experimentData,
    });
  },

  /**
   * Update an existing experiment
   */
  async updateExperiment(id, updates) {
    return apiClient(`/experiments/${id}`, {
      method: 'PUT',
      body: updates,
    });
  },

  /**
   * Delete an experiment
   */
  async deleteExperiment(id) {
    return apiClient(`/experiments/${id}`, { method: 'DELETE' });
  },
};

export default experimentsApi;
