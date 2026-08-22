import apiClient from './apiClient.js';

export const sessionsApi = {
  /**
   * Get all focus sessions for authenticated user
   */
  async getSessions() {
    return apiClient('/sessions', { method: 'GET' });
  },

  /**
   * Get specific focus session by ID
   */
  async getSessionById(id) {
    return apiClient(`/sessions/${id}`, { method: 'GET' });
  },

  /**
   * Start / Create a new focus session
   */
  async createSession(sessionData) {
    return apiClient('/sessions', {
      method: 'POST',
      body: sessionData,
    });
  },

  /**
   * Update a focus session (pause, resume, complete, cancel)
   */
  async updateSession(id, updates) {
    return apiClient(`/sessions/${id}`, {
      method: 'PUT',
      body: updates,
    });
  },
};

export default sessionsApi;
