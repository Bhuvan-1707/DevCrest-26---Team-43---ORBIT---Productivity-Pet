import React, { useState, useEffect } from 'react';
import { Activity, Clock, Coffee, CheckCircle2 } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { recoveryApi } from '../../services/api/recoveryApi';
import { OBSERVATION_TYPES } from '../../data/observationData';
import { observationService } from '../../services/observationService';

export default function RecoveryCard() {
  const [recovering, setRecovering] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [lastRecovery, setLastRecovery] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecovery() {
      setLoading(true);
      try {
        const res = await recoveryApi.getRecoverySessions();
        const sessions = res?.data || res || [];
        if (sessions.length > 0) {
          setLastRecovery(sessions[0]);
          if (sessions[0].status === 'started' || sessions[0].status === 'in_progress') {
            setRecovering(true);
            setActiveSessionId(sessions[0].id);
          }
        }
      } catch (err) {
        console.error('[RecoveryCard] Error loading recovery sessions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRecovery();
  }, []);

  const toggleRecovery = async () => {
    if (!recovering) {
      setRecovering(true);
      try {
        // 1. Create recovery session in backend API
        const res = await recoveryApi.createRecoverySession({
          duration: 15,
          status: 'started',
          reason: 'Scheduled focus rest cycle',
        });
        const created = res?.data || res;
        setActiveSessionId(created.id);
        setLastRecovery(created);

        // 2. Record RECOVERY_STARTED Observation
        observationService.recordObservation({
          type: OBSERVATION_TYPES.RECOVERY_STARTED,
          activity: {
            name: 'Rest Cycle',
            category: 'Recovery',
            duration: 15,
          },
          context: {
            page: '/dashboard',
            recoveryId: created.id,
          },
          metadata: {
            durationMinutes: 15,
          },
        });
      } catch (err) {
        console.error('[RecoveryCard] Error starting recovery session:', err);
      }
    } else {
      setRecovering(false);
      if (activeSessionId) {
        try {
          await recoveryApi.updateRecoverySession(activeSessionId, {
            status: 'completed',
          });
        } catch (err) {
          console.error('[RecoveryCard] Error completing recovery session:', err);
        }
      }
    }
  };

  if (loading) {
    return (
      <Card className="orbit-card flex items-center justify-center h-full min-h-[220px]">
        <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
      </Card>
    );
  }

  return (
    <Card className="orbit-card flex flex-col justify-between h-full relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-emerald-400" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
              RECOVERY
            </span>
          </div>
          <Badge variant={recovering ? 'emerald' : 'default'} pulse={recovering} size="sm">
            {recovering ? 'In Recovery' : 'Rhythm Balanced'}
          </Badge>
        </div>

        <h3 className="text-base font-bold text-slate-100 font-heading tracking-tight mt-1">
          Recovery Engine
        </h3>
      </div>

      {/* Recovery Status Metrics */}
      <div className="grid grid-cols-2 gap-3 my-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
            <Clock size={15} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-medium">Status</span>
            <span className="text-xs font-bold text-slate-200 capitalize">{lastRecovery?.status || 'Ready'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Coffee size={15} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase font-medium">Target</span>
            <span className="text-xs font-bold text-emerald-300">{lastRecovery?.duration || 15} min break</span>
          </div>
        </div>
      </div>

      {/* Context Note */}
      <p className="text-xs text-slate-400 italic mb-4">
        "{lastRecovery?.reason || 'Take micro-rest breaks between focus windows to maintain energy.'}"
      </p>

      {/* Interactive Start/Stop Recovery Button */}
      <Button
        variant={recovering ? 'accent' : 'secondary'}
        size="md"
        icon={recovering ? CheckCircle2 : Coffee}
        fullWidth
        onClick={toggleRecovery}
      >
        {recovering ? 'Complete Recovery' : 'Start Recovery Break'}
      </Button>
    </Card>
  );
}
