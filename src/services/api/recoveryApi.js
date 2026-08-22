import apiClient from './apiClient.js';

export const recoveryApi = {
  /**
   * Get all recovery sessions for authenticated user
   */
  async getRecoverySessions() {
    return apiClient('/recovery', { method: 'GET' });
  },

  /**
   * Start / Create a recovery session
   */
  async createRecoverySession(recoveryData) {
    return apiClient('/recovery', {
      method: 'POST',
      body: recoveryData,
    });
  },

  /**
   * Update / Complete a recovery session
   */
  async updateRecoverySession(id, updates) {
    return apiClient(`/recovery/${id}`, {
      method: 'PUT',
      body: updates,
    });
  },
};

export default recoveryApi;
