import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2, CheckSquare, Zap, X } from 'lucide-react';
import { OBSERVATION_TYPES } from '../../data/observationData';
import { subscribeObservations } from '../../services/observationService';

const TARGET_EVENT_CONFIG = {
  [OBSERVATION_TYPES.SESSION_COMPLETED]: {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    bgGradient: 'from-emerald-500/10 via-slate-900/90 to-slate-950',
    getMessage: (obs) => ({
      title: '✦ ORBIT observed',
      message: 'Focus session completed.',
      subtext: `${obs.activity?.duration || 45} minutes recorded.`,
    }),
  },
  [OBSERVATION_TYPES.TASK_COMPLETED]: {
    icon: CheckSquare,
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/40',
    bgGradient: 'from-cyan-500/10 via-slate-900/90 to-slate-950',
    getMessage: (obs) => ({
      title: '✦ ORBIT observed',
      message: 'Task completed.',
      subtext: `"${obs.activity?.name || 'Task'}" recorded as complete.`,
    }),
  },
  [OBSERVATION_TYPES.RECOVERY_STARTED]: {
    icon: Zap,
    color: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    bgGradient: 'from-amber-500/10 via-slate-900/90 to-slate-950',
    getMessage: (obs) => ({
      title: '✦ ORBIT observed',
      message: 'Recovery cycle started.',
      subtext: 'Energy recovery cycle recorded.',
    }),
  },
};

export default function ObservationToast() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Listen for new observation events
    const unsubscribe = subscribeObservations((newObservation) => {
      const config = TARGET_EVENT_CONFIG[newObservation?.type];
      if (config) {
        const details = config.getMessage(newObservation);
        setToast({
          id: newObservation.id || Date.now(),
          config,
          ...details,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast) return null;

  const Icon = toast.config.icon || Sparkles;

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-auto max-w-sm w-full px-4 select-none">
      <AnimatePresence mode="wait">
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`
              relative p-4 rounded-2xl border backdrop-blur-xl shadow-2xl shadow-black/80
              bg-gradient-to-r ${toast.config.bgGradient} ${toast.config.borderColor}
              flex items-start justify-between gap-3 overflow-hidden
            `}
          >
            {/* Top Glowing Edge Highlight */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />

            <div className="flex items-start gap-3 min-w-0">
              <div className={`p-2 rounded-xl bg-slate-900/80 border border-slate-800 shrink-0 ${toast.config.color}`}>
                <Icon size={18} />
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 font-heading">
                  {toast.title}
                </span>
                <span className="text-xs font-bold text-slate-100 font-heading">
                  {toast.message}
                </span>
                <span className="text-[11px] text-slate-300 font-sans leading-snug">
                  {toast.subtext}
                </span>
              </div>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-800/50 shrink-0"
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
