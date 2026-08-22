/**
 * Centralized API Client for ORBIT Frontend
 * Handles HTTP requests, JWT token attachment, base URL configuration, and error normalization.
 */

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'orbit_token';

let memoryToken = null;

/**
 * Get stored authentication JWT token
 */
export function getAuthToken() {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return memoryToken;
}

/**
 * Store authentication JWT token
 */
export function setAuthToken(token) {
  if (token) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
    memoryToken = token;
  } else {
    clearAuthToken();
  }
}

/**
 * Remove stored authentication JWT token
 */
export function clearAuthToken() {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
  memoryToken = null;
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Generic fetch wrapper method
 */
export async function apiClient(endpoint, { body, headers, customConfig = {}, method = 'GET' } = {}) {
  const token = getAuthToken();

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...customConfig,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${cleanEndpoint}`;

  let response;
  try {
    response = await fetch(url, config);
  } catch (error) {
    throw new ApiError(error.message || 'Network request failed. Is the backend server running?', 0);
  }

  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage = (data && typeof data === 'object' && data.message) || response.statusText || 'An API error occurred';
    throw new ApiError(errorMessage, response.status, data);
  }

  return data;
}

export default apiClient;
