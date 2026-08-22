import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Play, 
  CheckSquare, 
  Clock, 
  Sparkles 
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { OBSERVATION_TYPES } from '../../data/observationData';
import { observationService } from '../../services/observationService';
import { formatObservationTime } from '../../utils/observationUtils';

/**
 * ObservationSummary Component
 * Dynamically computes real-time telemetry metrics from stored observation logs.
 */
export default function ObservationSummary() {
  const [metrics, setMetrics] = useState({
    totalObservations: 0,
    sessionsToday: 0,
    tasksCompletedToday: 0,
    totalFocusMinutes: 0,
    mostRecentActivity: null,
  });
  const [loading, setLoading] = useState(true);

  const calculateMetrics = async () => {
    try {
      const logs = await observationService.getObservations();
      const todayStr = new Date().toISOString().substring(0, 10);

      // 1. Total Observations
      const totalObservations = logs.length;

      // 2. Sessions Today (SESSION_STARTED or SESSION_COMPLETED recorded today)
      const sessionsToday = logs.filter(obs => 
        obs.timestamp?.startsWith(todayStr) && 
        (obs.type === OBSERVATION_TYPES.SESSION_STARTED || obs.type === OBSERVATION_TYPES.SESSION_COMPLETED)
      ).length;

      // 3. Tasks Completed Today (TASK_COMPLETED recorded today)
      const tasksCompletedToday = logs.filter(obs => 
        obs.timestamp?.startsWith(todayStr) && 
        obs.type === OBSERVATION_TYPES.TASK_COMPLETED
      ).length;

      // 4. Total Focus Minutes (Sum of duration across focus session observations)
      const totalFocusMinutes = logs.reduce((acc, obs) => {
        if (obs.type === OBSERVATION_TYPES.SESSION_COMPLETED || obs.type === OBSERVATION_TYPES.SESSION_PAUSED) {
          const dur = Number(obs.activity?.duration) || Number(obs.metadata?.actualDurationMinutes) || 0;
          return acc + dur;
        }
        return acc;
      }, 0);

      // 5. Most Recent Activity
      const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const mostRecentActivity = sortedLogs[0] || null;

      setMetrics({
        totalObservations,
        sessionsToday,
        tasksCompletedToday,
        totalFocusMinutes,
        mostRecentActivity,
      });
    } catch (err) {
      console.error('[ObservationSummary] Error calculating metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateMetrics();
    // Poll telemetry storage every 3 seconds to keep counters live
    const interval = setInterval(calculateMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 select-none">
      {/* Total Observations Card */}
      <Card className="orbit-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-cyan-400">TOTAL EVENTS</span>
          <Activity size={15} className="text-sky-600 dark:text-cyan-400" />
        </div>
        <div className="mt-2">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-heading">
            {loading ? '...' : metrics.totalObservations}
          </span>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Stored observations</p>
        </div>
      </Card>

      {/* Sessions Today Card */}
      <Card className="orbit-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">SESSIONS TODAY</span>
          <Play size={15} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="mt-2">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-heading">
            {loading ? '...' : metrics.sessionsToday}
          </span>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Focus cycles run</p>
        </div>
      </Card>

      {/* Tasks Completed Today Card */}
      <Card className="orbit-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">TASKS DONE TODAY</span>
          <CheckSquare size={15} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="mt-2">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-heading">
            {loading ? '...' : metrics.tasksCompletedToday}
          </span>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Completed items</p>
        </div>
      </Card>

      {/* Total Focus Minutes Card */}
      <Card className="orbit-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">FOCUS MINUTES</span>
          <Clock size={15} className="text-amber-600 dark:text-amber-400" />
        </div>
        <div className="mt-2">
          <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-heading">
            {loading ? '...' : `${metrics.totalFocusMinutes}m`}
          </span>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Cumulative duration</p>
        </div>
      </Card>

      {/* Most Recent Activity Card */}
      <Card className="orbit-card p-4 flex flex-col justify-between border-sky-200 dark:border-cyan-500/30">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-cyan-300 flex items-center gap-1">
            <Sparkles size={12} /> RECENT ACTIVITY
          </span>
          <Badge variant="cyan" size="sm">Live</Badge>
        </div>
        <div className="mt-2">
          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 font-heading truncate">
            {loading ? '...' : metrics.mostRecentActivity?.activity?.name || 'No Activity'}
          </p>
          <p className="text-[10px] text-sky-600 dark:text-cyan-400 mt-0.5 font-medium">
            {metrics.mostRecentActivity ? formatObservationTime(metrics.mostRecentActivity.timestamp) : 'N/A'}
          </p>
        </div>
      </Card>
    </div>
  );
}
