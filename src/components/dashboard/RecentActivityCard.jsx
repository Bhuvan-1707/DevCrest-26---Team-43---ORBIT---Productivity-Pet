import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, ArrowRight, Clock, Play, CheckCircle2, CheckSquare, Compass, Zap, ChevronRight } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import ObservationDetailModal from '../observations/ObservationDetailModal';
import { OBSERVATION_TYPES } from '../../data/observationData';
import { observationService } from '../../services/observationService';
import { getObservationTypeLabel, formatObservationTime } from '../../utils/observationUtils';

const typeIconMap = {
  [OBSERVATION_TYPES.SESSION_STARTED]: { icon: Play, color: 'text-sky-600 dark:text-cyan-400' },
  [OBSERVATION_TYPES.SESSION_COMPLETED]: { icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400' },
  [OBSERVATION_TYPES.TASK_COMPLETED]: { icon: CheckSquare, color: 'text-emerald-600 dark:text-emerald-400' },
  [OBSERVATION_TYPES.PAGE_VIEW]: { icon: Compass, color: 'text-sky-600 dark:text-cyan-400' },
  [OBSERVATION_TYPES.RECOVERY_STARTED]: { icon: Zap, color: 'text-amber-600 dark:text-amber-400' },
};

export default function RecentActivityCard() {
  const navigate = useNavigate();
  const [recentLogs, setRecentLogs] = useState([]);
  const [selectedObservation, setSelectedObservation] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRecentLogs = async () => {
    try {
      const data = await observationService.getObservations();
      // Take top 4 most recent observations
      const sorted = [...data].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 4);
      setRecentLogs(sorted);
    } catch (err) {
      console.error('[RecentActivityCard] Error fetching observations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentLogs();
    const interval = setInterval(fetchRecentLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Card className="orbit-card flex flex-col justify-between h-full relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-sky-600 dark:text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">
              Recent Activity
            </h3>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-semibold text-sky-700 dark:text-cyan-400 bg-sky-50 dark:bg-cyan-500/10 px-2 py-0.5 rounded-full border border-sky-200 dark:border-cyan-500/20">
            Telemetry Stream
          </span>
        </div>

        {/* Activity List Stream (3 - 4 items) */}
        <div className="my-2 flex flex-col gap-2">
          {loading ? (
            <div className="py-4 text-center text-xs text-slate-500 dark:text-slate-400">Loading activity...</div>
          ) : recentLogs.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-500 dark:text-slate-400">No activity recorded yet.</div>
          ) : (
            recentLogs.map((obs) => {
              const iconConfig = typeIconMap[obs.type] || { icon: Clock, color: 'text-slate-500 dark:text-slate-400' };
              const Icon = iconConfig.icon;

              return (
                <motion.div
                  key={obs.id}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setSelectedObservation(obs)}
                  className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-all group"
                >
                  <div className="shrink-0 flex items-center justify-center">
                    <span className={`text-[8px] mr-0.5 ${iconConfig.color}`}>●</span>
                    <Icon size={13} className={iconConfig.color} />
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-heading truncate group-hover:text-indigo-600 dark:group-hover:text-cyan-300 transition-colors">
                        {getObservationTypeLabel(obs.type)}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 shrink-0">
                        {formatObservationTime(obs.timestamp)}
                      </span>
                    </div>
                    {obs.activity?.name && (
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 truncate font-sans">
                        {obs.activity.name}
                      </span>
                    )}
                  </div>

                  <ChevronRight size={14} className="text-slate-400 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition-colors shrink-0" />
                </motion.div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Button */}
        <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/60 mt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/observations')}
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-indigo-600 dark:text-cyan-400 hover:text-indigo-700 dark:hover:text-cyan-300"
          >
            <span>View All Observations</span>
            <ArrowRight size={14} />
          </Button>
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
