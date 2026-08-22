import apiClient from './apiClient.js';

export const insightsApi = {
  /**
   * Get all insights for authenticated user
   */
  async getInsights() {
    return apiClient('/insights', { method: 'GET' });
  },

  /**
   * Create a new insight record
   */
  async createInsight(insightData) {
    return apiClient('/insights', {
      method: 'POST',
      body: insightData,
    });
  },
};

export default insightsApi;
