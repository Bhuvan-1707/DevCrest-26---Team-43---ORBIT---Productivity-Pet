import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { OBSERVATION_TYPES } from '../../data/observationData';
import { observationService } from '../../services/observationService';

const PAGE_NAMES = {
  '/dashboard': 'Dashboard',
  '/session': 'Focus',
  '/memory': 'Memory',
  '/insights': 'Insights',
  '/observations': 'Observations',
  '/tasks': 'Tasks',
  '/goals': 'Goals',
  '/recovery': 'Recovery',
  '/experiments': 'Experiments',
};

/**
 * NavigationObserver
 * Telemetry component that records PAGE_VIEW observations upon route changes inside ORBIT.
 * Uses a ref lock to avoid duplicate PAGE_VIEW observations caused by React re-renders.
 */
export default function NavigationObserver() {
  const location = useLocation();
  const lastRecordedRouteRef = useRef(null);

  useEffect(() => {
    const route = location.pathname;
    
    // Prevent duplicate PAGE_VIEW telemetry caused by React re-renders or StrictMode
    if (lastRecordedRouteRef.current === route) {
      return;
    }
    
    lastRecordedRouteRef.current = route;
    const pageName = PAGE_NAMES[route] || 'Dashboard';

    // Record PAGE_VIEW observation via observationService
    observationService.recordObservation({
      type: OBSERVATION_TYPES.PAGE_VIEW,
      activity: {
        name: `Navigated to ${pageName}`,
        category: 'Navigation',
        duration: 0,
      },
      context: {
        page: route,
        pageName,
      },
      metadata: {
        route,
        pageName,
      },
    });
  }, [location.pathname]);

  return null;
}
