import apiClient from './apiClient.js';

export const observationsApi = {
  /**
   * Get all telemetry observations for authenticated user
   */
  async getObservations() {
    return apiClient('/observations', { method: 'GET' });
  },

  /**
   * Get specific observation details by ID
   */
  async getObservationById(id) {
    return apiClient(`/observations/${id}`, { method: 'GET' });
  },

  /**
   * Record a new telemetry observation event
   */
  async createObservation(observationData) {
    return apiClient('/observations', {
      method: 'POST',
      body: observationData,
    });
  },
};

export default observationsApi;
