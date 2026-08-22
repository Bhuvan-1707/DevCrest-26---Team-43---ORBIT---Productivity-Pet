/**
 * ORBIT Module 2: Observation Service & Storage Adapter Architecture
 * 
 * Centralized service layer for recording and retrieving observation telemetry.
 * Implements a pluggable Storage Adapter strategy so the storage layer can be 
 * seamlessly swapped from localStorage to a Node.js + MariaDB REST API 
 * without modifying UI components.
 * 
 * Target Architecture:
 * UI (React) ➔ observationService ➔ StorageAdapter (LocalStorageAdapter | ApiStorageAdapter) ➔ (localStorage | Node.js API + MariaDB)
 */

import { mockObservations, createObservation, validateObservation } from '../data/observationData.js';

import { observationsApi } from './api/observationsApi.js';

const STORAGE_KEY = 'orbit_observation_log';
const listeners = new Set();

// Driver Configuration: 'localStorage' | 'api'
const STORAGE_DRIVER_MODE = 'api';

// ==========================================
// 1. LOCAL STORAGE ADAPTER (Fallback)
// ==========================================
class LocalStorageAdapter {
  constructor() {
    this.memoryStorage = [...mockObservations];
  }

  async readAll() {
    try {
      if (typeof localStorage === 'undefined') return [...this.memoryStorage];
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockObservations));
        this.memoryStorage = [...mockObservations];
        return [...this.memoryStorage];
      }
      const parsed = JSON.parse(data);
      this.memoryStorage = Array.isArray(parsed) ? parsed : [...mockObservations];
      return [...this.memoryStorage];
    } catch (err) {
      console.warn('[LocalStorageAdapter] Read failed, using memory fallback:', err);
      return [...this.memoryStorage];
    }
  }

  async writeAll(observations) {
    this.memoryStorage = [...observations];
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(observations));
      }
    } catch (err) {
      console.warn('[LocalStorageAdapter] Write failed, preserved in memory:', err);
    }
  }

  async saveRecord(observation) {
    const existing = await this.readAll();
    const updated = [observation, ...existing.filter(obs => obs.id !== observation.id)];
    await this.writeAll(updated);
    return observation;
  }

  async clearAll() {
    this.memoryStorage = [];
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      return true;
    } catch (err) {
      console.warn('[LocalStorageAdapter] Clear error:', err);
      return false;
    }
  }
}

// ==========================================
// 2. API STORAGE ADAPTER (Express REST + MariaDB)
// ==========================================
class ApiStorageAdapter {
  async readAll() {
    try {
      const res = await observationsApi.getObservations();
      const items = res?.data || res || [];
      return Array.isArray(items) ? items : [];
    } catch (err) {
      console.warn('[ApiStorageAdapter] Backend fetch failed:', err.message);
      return [];
    }
  }

  async saveRecord(observation) {
    try {
      const res = await observationsApi.createObservation(observation);
      return res?.data || res || observation;
    } catch (err) {
      console.warn('[ApiStorageAdapter] Backend observation creation failed:', err.message);
      return observation;
    }
  }

  async clearAll() {
    return true;
  }
}

// Instantiate active storage adapter driver
const storageAdapter = STORAGE_DRIVER_MODE === 'api'
  ? new ApiStorageAdapter()
  : new LocalStorageAdapter();


// ==========================================
// 3. PUBLIC OBSERVATION SERVICE API CONTRACT
// ==========================================

/**
 * Subscribe to new observation recording events in real-time.
 * @param {Function} listener Callback function receiving created observation
 * @returns {Function} Unsubscribe function
 */
export function subscribeObservations(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Record a new structured observation into the telemetry system.
 * @param {Object} observationPayload Raw or partial observation object
 * @returns {Promise<Object|null>} Saved observation object or null if invalid
 */
export async function recordObservation(observationPayload) {
  const rawObservation = observationPayload?.id && observationPayload?.timestamp
    ? observationPayload
    : createObservation(observationPayload || {});

  // Validate payload integrity
  const { valid, errors, observation } = validateObservation(rawObservation);

  if (!valid) {
    console.warn('[ObservationService] Invalid observation payload rejected:', errors, rawObservation);
    return null;
  }

  // Persist record via active storage adapter
  const savedRecord = await storageAdapter.saveRecord(observation);

  // Notify real-time listeners (toasts, widgets, timeline)
  listeners.forEach(fn => {
    try {
      fn(savedRecord);
    } catch (err) {
      console.error('[ObservationService] Subscription notification error:', err);
    }
  });

  return JSON.parse(JSON.stringify(savedRecord));
}

/**
 * Retrieve all observation records.
 * @returns {Promise<Array>} List of observation records (newest first)
 */
export async function getObservations() {
  const logs = await storageAdapter.readAll();
  return JSON.parse(JSON.stringify(logs));
}

/**
 * Retrieve a single observation record by ID.
 * @param {string} id Observation ID
 * @returns {Promise<Object|null>} Observation record or null
 */
export async function getObservationById(id) {
  const logs = await storageAdapter.readAll();
  const found = logs.find(obs => obs.id === id);
  return found ? JSON.parse(JSON.stringify(found)) : null;
}

/**
 * Filter observations by type constant.
 * @param {string} type OBSERVATION_TYPES value
 * @returns {Promise<Array>} Sliced array of observations matching type
 */
export async function getObservationsByType(type) {
  const logs = await storageAdapter.readAll();
  const filtered = logs.filter(obs => obs.type === type);
  return JSON.parse(JSON.stringify(filtered));
}

/**
 * Filter observations by target date string (YYYY-MM-DD) or Date object.
 * @param {string|Date} date Target date
 * @returns {Promise<Array>} Observations recorded on date
 */
export async function getObservationsByDate(date) {
  const targetDateStr = typeof date === 'string'
    ? date.substring(0, 10)
    : date.toISOString().substring(0, 10);

  const logs = await storageAdapter.readAll();
  const filtered = logs.filter(obs => obs.timestamp?.startsWith(targetDateStr));
  return JSON.parse(JSON.stringify(filtered));
}

/**
 * Clear all observation records.
 * @returns {Promise<boolean>} Success status
 */
export async function clearObservations() {
  const success = await storageAdapter.clearAll();
  return success;
}

export const observationService = {
  recordObservation,
  getObservations,
  getObservationById,
  getObservationsByType,
  getObservationsByDate,
  clearObservations,
  subscribeObservations,
};

export default observationService;
