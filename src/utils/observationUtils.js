/**
 * ORBIT Module 2: Observation Telemetry Utility Functions
 * 
 * Pure helper functions for formatting, transforming, and grouping observation records.
 */

import { OBSERVATION_TYPES, createObservation as rawCreateObservation } from '../data/observationData';

/**
 * 1. Factory helper to construct standardized observation objects.
 */
export function createObservation(params) {
  return rawCreateObservation(params);
}

/**
 * 2. Convert observation type constant into human-readable label.
 * @param {string} type - OBSERVATION_TYPES value
 * @returns {string} Human readable label
 */
export function getObservationTypeLabel(type) {
  const typeLabels = {
    [OBSERVATION_TYPES.SESSION_STARTED]: 'Focus Session Started',
    [OBSERVATION_TYPES.SESSION_PAUSED]: 'Focus Session Paused',
    [OBSERVATION_TYPES.SESSION_RESUMED]: 'Focus Session Resumed',
    [OBSERVATION_TYPES.SESSION_COMPLETED]: 'Focus Session Completed',
    [OBSERVATION_TYPES.TASK_STARTED]: 'Task Started',
    [OBSERVATION_TYPES.TASK_COMPLETED]: 'Task Completed',
    [OBSERVATION_TYPES.TASK_CREATED]: 'Task Created',
    [OBSERVATION_TYPES.TASK_UPDATED]: 'Task Updated',
    [OBSERVATION_TYPES.PAGE_VIEW]: 'Page Navigated',
    [OBSERVATION_TYPES.RECOVERY_STARTED]: 'Recovery Session Started',
  };

  return typeLabels[type] || type || 'General Observation';
}

/**
 * 3. Format ISO timestamp into a human-friendly relative or formatted time string.
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Formatted time (e.g. "12 mins ago", "Today at 2:30 PM")
 */
export function formatObservationTime(timestamp) {
  if (!timestamp) return 'Just now';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * 4. Calculate total cumulative duration (in minutes) across a set of observations.
 * @param {Array} observations - List of observation records
 * @returns {number} Total duration in minutes
 */
export function calculateObservationDuration(observations = []) {
  if (!Array.isArray(observations)) return 0;

  return observations.reduce((total, obs) => {
    const duration = obs?.activity?.duration || 0;
    return total + Number(duration);
  }, 0);
}

/**
 * 5. Group observations by date key (YYYY-MM-DD).
 * @param {Array} observations - List of observation records
 * @returns {Object} Object map with YYYY-MM-DD keys containing arrays of observations
 */
export function groupObservationsByDate(observations = []) {
  if (!Array.isArray(observations)) return {};

  return observations.reduce((grouped, obs) => {
    const dateKey = obs.timestamp ? obs.timestamp.substring(0, 10) : 'Unknown Date';
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(obs);
    return grouped;
  }, {});
}

/**
 * 6. Get most recent N observations sorted by timestamp descending.
 * @param {Array} observations - List of observation records
 * @param {number} limit - Maximum number of records to return
 * @returns {Array} Sliced & sorted observation records
 */
export function getRecentObservations(observations = [], limit = 10) {
  if (!Array.isArray(observations)) return [];

  return [...observations]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
}

/**
 * 7. Pure filtering helper mapping observation types to category filters.
 * Filters in-place without duplicating datasets or creating separate arrays.
 * @param {Array} observations - Source observation array
 * @param {string} filterCategory - 'ALL' | 'SESSIONS' | 'TASKS' | 'NAVIGATION' | 'RECOVERY'
 * @returns {Array} Filtered observation array
 */
export function filterObservationsByCategory(observations = [], filterCategory = 'ALL') {
  if (!Array.isArray(observations)) return [];
  const cat = (filterCategory || 'ALL').toUpperCase();
  if (cat === 'ALL') return observations;

  return observations.filter(obs => {
    const type = obs.type || '';
    switch (cat) {
      case 'SESSIONS':
        return type.startsWith('SESSION_');
      case 'TASKS':
        return type.startsWith('TASK_');
      case 'NAVIGATION':
        return type === OBSERVATION_TYPES.PAGE_VIEW;
      case 'RECOVERY':
        return type === OBSERVATION_TYPES.RECOVERY_STARTED;
      default:
        return true;
    }
  });
}
