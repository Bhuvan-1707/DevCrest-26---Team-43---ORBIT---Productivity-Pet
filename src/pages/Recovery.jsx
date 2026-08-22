import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Coffee, CheckCircle2, Clock, AlertCircle, Plus } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { recoveryApi } from '../services/api/recoveryApi';
import { OBSERVATION_TYPES } from '../data/observationData';
import { observationService } from '../services/observationService';

export default function Recovery() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    setLoading(true);
    setError('');
    try {
      const res = await recoveryApi.getRecoverySessions();
      const items = res?.data || res || [];
      const list = Array.isArray(items) ? items : [];
      setSessions(list);
      const running = list.find(s => s.status === 'started' || s.status === 'in_progress');
      if (running) setActiveSession(running);
    } catch (err) {
      console.error('[Recovery Page] Error loading recovery sessions:', err);
      setError(err.message || 'Failed to load recovery sessions');
    } finally {
      setLoading(false);
    }
  }

  const handleStartRecovery = async () => {
    setError('');
    try {
      const res = await recoveryApi.createRecoverySession({
        duration: 15,
        status: 'started',
        reason: 'Cognitive rest cycle between focus windows',
      });
      const created = res?.data || res;
      setActiveSession(created);
      setSessions(prev => [created, ...prev]);

      // Record RECOVERY_STARTED Observation
      observationService.recordObservation({
        type: OBSERVATION_TYPES.RECOVERY_STARTED,
        activity: { name: 'Rest Cycle', category: 'Recovery', duration: 15 },
        context: { page: '/recovery', recoveryId: created.id },
        metadata: { durationMinutes: 15 },
      });
    } catch (err) {
      console.error('[Recovery Page] Error starting recovery:', err);
      setError(err.message || 'Failed to start recovery session');
    }
  };

  const handleCompleteRecovery = async (session) => {
    setError('');
    try {
      await recoveryApi.updateRecoverySession(session.id, {
        status: 'completed',
      });
      setSessions(prev => prev.map(s => s.id === session.id ? { ...s, status: 'completed' } : s));
      setActiveSession(null);
    } catch (err) {
      console.error('[Recovery Page] Error completing recovery:', err);
      setError(err.message || 'Failed to complete recovery session');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full select-none">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Activity className="text-emerald-400" size={20} />
            <h1 className="text-xl lg:text-2xl font-bold text-slate-100 font-heading">
              Recovery Engine & Energy Rhythm
            </h1>
          </div>
          <p className="text-xs lg:text-sm text-slate-400">
            Monitor cognitive fatigue, rest breaks, and energy recovery protocols.
          </p>
        </div>

        <Button
          variant={activeSession ? 'accent' : 'primary'}
          size="md"
          icon={activeSession ? CheckCircle2 : Coffee}
          onClick={activeSession ? () => handleCompleteRecovery(activeSession) : handleStartRecovery}
        >
          {activeSession ? 'Complete Recovery' : 'Start 15-Min Break'}
        </Button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Active Recovery Spotlight */}
      {activeSession && (
        <Card glow className="orbit-card p-6 border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Coffee size={24} />
            </div>
            <div>
              <Badge variant="emerald" pulse size="sm">Active Recovery Break</Badge>
              <h3 className="text-base font-bold text-slate-100 font-heading mt-1">15-Minute Micro Rest in Progress</h3>
              <p className="text-xs text-slate-400">{activeSession.reason}</p>
            </div>
          </div>

          <Button
            variant="accent"
            size="sm"
            onClick={() => handleCompleteRecovery(activeSession)}
          >
            End Recovery
          </Button>
        </Card>
      )}

      {/* Session History */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
      ) : sessions.length === 0 ? (
        <Card className="orbit-card p-12 text-center flex flex-col items-center">
          <Coffee size={32} className="text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No recovery sessions recorded yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">Click 'Start 15-Min Break' to record your first rest cycle.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-slate-200 font-heading">Recovery Logs</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sessions.map(s => (
              <Card key={s.id} className="orbit-card p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={s.status === 'completed' ? 'emerald' : 'amber'} size="sm">
                    {s.status || 'started'}
                  </Badge>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {s.created_at ? new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-200 text-sm font-semibold mb-1">
                  <Clock size={15} className="text-emerald-400" />
                  <span>{s.duration || 15} Minutes Rest</span>
                </div>

                <p className="text-xs text-slate-400 italic line-clamp-2">"{s.reason || 'Focus break'}"</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
