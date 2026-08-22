import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Play, 
  Pause, 
  CheckCircle2, 
  CheckSquare, 
  Plus, 
  Edit3, 
  Compass, 
  Zap,
  Clock,
  Layers,
  Filter,
  ChevronRight
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import ObservationDetailModal from './ObservationDetailModal';
import { OBSERVATION_TYPES } from '../../data/observationData';
import { observationService } from '../../services/observationService';
import { 
  getObservationTypeLabel, 
  groupObservationsByDate, 
  getRecentObservations,
  filterObservationsByCategory
} from '../../utils/observationUtils';

/**
 * Type to Icon & Color mapping for ORBIT design consistency
 */
const typeIconMap = {
  [OBSERVATION_TYPES.SESSION_STARTED]: { icon: Play, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' },
  [OBSERVATION_TYPES.SESSION_PAUSED]: { icon: Pause, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  [OBSERVATION_TYPES.SESSION_RESUMED]: { icon: Play, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' },
  [OBSERVATION_TYPES.SESSION_COMPLETED]: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  [OBSERVATION_TYPES.TASK_STARTED]: { icon: Play, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30' },
  [OBSERVATION_TYPES.TASK_COMPLETED]: { icon: CheckSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  [OBSERVATION_TYPES.TASK_CREATED]: { icon: Plus, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30' },
  [OBSERVATION_TYPES.TASK_UPDATED]: { icon: Edit3, color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/30' },
  [OBSERVATION_TYPES.PAGE_VIEW]: { icon: Compass, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' },
  [OBSERVATION_TYPES.RECOVERY_STARTED]: { icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
};

const FILTER_OPTIONS = [
  { id: 'ALL', label: 'ALL', icon: Layers },
  { id: 'SESSIONS', label: 'SESSIONS', icon: Play },
  { id: 'TASKS', label: 'TASKS', icon: CheckSquare },
  { id: 'NAVIGATION', label: 'NAVIGATION', icon: Compass },
  { id: 'RECOVERY', label: 'RECOVERY', icon: Zap },
];

export default function ObservationTimeline({ limit = 50, title = "Observation Timeline", initialFilter = "ALL" }) {
  const [observations, setObservations] = useState([]);
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [selectedObservation, setSelectedObservation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch observations from service
  const fetchObservations = async () => {
    try {
      const data = await observationService.getObservations();
      const recent = getRecentObservations(data, limit);
      setObservations(recent);
    } catch (err) {
      console.error('[ObservationTimeline] Failed to load observations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObservations();
    // Poll for new observations every 3 seconds to keep UI live
    const interval = setInterval(fetchObservations, 3000);
    return () => clearInterval(interval);
  }, [limit]);

  // Format date header (TODAY, YESTERDAY, or formatted date)
  const formatDateHeader = (dateStr) => {
    const todayStr = new Date().toISOString().substring(0, 10);
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().substring(0, 10);
    
    if (dateStr === todayStr) return 'TODAY';
    if (dateStr === yesterdayStr) return 'YESTERDAY';

    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
    } catch (e) {
      return dateStr.toUpperCase();
    }
  };

  const filteredObservations = filterObservationsByCategory(observations, activeFilter);
  const groupedObservations = groupObservationsByDate(filteredObservations);
  const dateKeys = Object.keys(groupedObservations).sort((a, b) => new Date(b) - new Date(a));

  return (
    <>
      <Card className="orbit-card flex flex-col justify-between h-full relative overflow-hidden">
        {/* Header & Filter Controls Bar */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-100 font-heading">
                {title}
              </h3>
            </div>
            <Badge variant="cyan" size="sm" pulse>
              Live Stream
            </Badge>
          </div>

          {/* Filter Button Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800/60">
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1 shrink-0 font-heading">
              <Filter size={12} className="text-cyan-400" /> FILTER:
            </span>
            {FILTER_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isActive = activeFilter === opt.id;
              const count = filterObservationsByCategory(observations, opt.id).length;

              return (
                <button
                  key={opt.id}
                  onClick={() => setActiveFilter(opt.id)}
                  className={`
                    px-2.5 py-1 rounded-lg text-[11px] font-bold font-heading transition-all shrink-0 flex items-center gap-1.5
                    ${isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800/40'}
                  `}
                >
                  <Icon size={12} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />
                  <span>{opt.label}</span>
                  <span className={`text-[9px] px-1 rounded ${isActive ? 'bg-cyan-950 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Timeline Stream */}
        {loading ? (
          <div className="py-8 flex items-center justify-center text-xs text-slate-400">
            Loading observations...
          </div>
        ) : filteredObservations.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-slate-300 font-heading">No Observations</span>
            <span className="text-[11px] text-slate-400">No events matched the selected "{activeFilter}" filter.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-6 my-2 relative overflow-y-auto max-h-[480px] pr-1">
            {dateKeys.map((dateKey) => (
              <div key={dateKey} className="flex flex-col gap-3">
                {/* Date Section Label */}
                <span className="text-[10px] font-bold tracking-widest text-cyan-400 font-heading uppercase px-1">
                  {formatDateHeader(dateKey)}
                </span>

                {/* Timeline Items List */}
                <div className="relative border-l border-slate-800/80 ml-3.5 pl-5 flex flex-col gap-4">
                  <AnimatePresence mode="popLayout">
                    {groupedObservations[dateKey].map((obs, idx) => {
                      const iconConfig = typeIconMap[obs.type] || { 
                        icon: Clock, 
                        color: 'text-slate-400', 
                        bg: 'bg-slate-800 border-slate-700' 
                      };
                      const Icon = iconConfig.icon;
                      const timeFormatted = obs.timestamp 
                        ? new Date(obs.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                        : 'Just now';

                      return (
                        <motion.div
                          key={obs.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.15, delay: idx * 0.02 }}
                          onClick={() => setSelectedObservation(obs)}
                          className="relative flex flex-col gap-1 text-xs group cursor-pointer p-2 rounded-xl hover:bg-slate-900/60 border border-transparent hover:border-slate-800 transition-all"
                        >
                          {/* Timeline Node Icon Bullet */}
                          <div 
                            className={`
                              absolute -left-[27px] top-2.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-transform group-hover:scale-110
                              ${iconConfig.bg}
                            `}
                          >
                            <Icon size={11} className={iconConfig.color} />
                          </div>

                          {/* Event Time & Title Header */}
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-100 font-heading group-hover:text-cyan-300 transition-colors">
                              {getObservationTypeLabel(obs.type)}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-semibold text-slate-400 font-mono">
                                {timeFormatted}
                              </span>
                              <ChevronRight size={12} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
                            </div>
                          </div>

                          {/* Event Activity Name */}
                          <p className="text-xs text-slate-300 font-medium leading-snug">
                            {obs.activity?.name || 'Observation Event'}
                          </p>

                          {/* Additional Telemetry Details Badge */}
                          <div className="flex items-center gap-2 mt-0.5">
                            {obs.activity?.duration > 0 && (
                              <span className="text-[10px] text-cyan-400/90 font-medium font-mono">
                                {obs.activity.duration} {typeof obs.activity.duration === 'number' ? 'min' : ''}
                              </span>
                            )}
                            {obs.metadata?.focusScoreRating && (
                              <span className="text-[10px] text-emerald-400 font-medium font-mono">
                                Score: {obs.metadata.focusScoreRating}/100
                              </span>
                            )}
                            {obs.context?.page && (
                              <span className="text-[10px] text-slate-500 font-mono">
                                {obs.context.page}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer Meta */}
        <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <span>Active Filter: <strong className="text-cyan-400 font-heading">{activeFilter}</strong></span>
          <span className="font-mono text-slate-400">{filteredObservations.length} of {observations.length} events</span>
        </div>
      </Card>

      {/* Observation Detail Modal */}
      <ObservationDetailModal
        observation={selectedObservation}
        onClose={() => setSelectedObservation(null)}
      />
    </>
  );
}
