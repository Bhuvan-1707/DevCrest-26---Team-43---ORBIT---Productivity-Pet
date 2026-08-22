import { useState, useEffect } from 'react';
import { api } from '../services/api';

export function useSession() {
  const [completedSessions, setCompletedSessions] = useState([]);
  const [focusState, setFocusState] = useState({ current: 82, change: 8 });
  const [petState, setPetState] = useState('idle');
  const [loading, setLoading] = useState(true);

  // Load state from API / localStorage on mount
  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getDashboard();
        setCompletedSessions(data.completedSessions || []);
        setFocusState(data.focus);
        setPetState(data.petState || 'idle');
      } catch (err) {
        console.error('Error loading session state:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Complete a session & update state
  const finishSession = async (sessionData) => {
    try {
      const result = await api.recordCompletedSession(sessionData);
      setCompletedSessions(prev => [result.session, ...prev]);
      setFocusState(result.focus);
      setPetState('happy');
      return result;
    } catch (err) {
      console.error('Error recording completed session:', err);
    }
  };

  // Set pet state
  const updatePetState = (newState) => {
    setPetState(newState);
    try {
      localStorage.setItem('orbit_pet_state', JSON.stringify(newState));
    } catch (e) {}
  };

  return {
    completedSessions,
    focusState,
    petState,
    loading,
    finishSession,
    updatePetState,
  };
}
