import apiClient, { setAuthToken, clearAuthToken } from './apiClient.js';

export const authApi = {
  /**
   * Register a new user account
   */
  async register(email, password, name) {
    const data = await apiClient('/auth/register', {
      method: 'POST',
      body: { email, password, name },
    });
    if (data?.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  /**
   * Login user with credentials
   */
  async login(email, password) {
    const data = await apiClient('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    if (data?.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  /**
   * Fetch authenticated user profile
   */
  async getMe() {
    return apiClient('/auth/me', { method: 'GET' });
  },

  /**
   * Logout user by clearing stored JWT token
   */
  logout() {
    clearAuthToken();
  },
};

export default authApi;
