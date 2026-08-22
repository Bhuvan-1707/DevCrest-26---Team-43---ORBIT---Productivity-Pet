import apiClient from './apiClient.js';

export const memoryApi = {
  /**
   * Get all memories for authenticated user (supports optional type filter)
   */
  async getMemories(typeFilter = null) {
    const query = typeFilter ? `?type=${encodeURIComponent(typeFilter)}` : '';
    return apiClient(`/memories${query}`, { method: 'GET' });
  },

  /**
   * Create a new memory record
   */
  async createMemory(memoryData) {
    return apiClient('/memories', {
      method: 'POST',
      body: memoryData,
    });
  },
};

export default memoryApi;
