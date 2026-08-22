import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, Clock, Compass, Layers, FileText, Code } from 'lucide-react';
import { getObservationTypeLabel } from '../../utils/observationUtils';

export default function ObservationDetailModal({ observation, onClose }) {
  if (!observation) return null;

  const typeLabel = getObservationTypeLabel(observation.type);

  return (
    <AnimatePresence>
      {observation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0d101a] backdrop-blur-2xl p-6 shadow-2xl shadow-slate-900/10 dark:shadow-cyan-950/30 text-slate-800 dark:text-slate-100"
          >
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500" />

            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sky-600 dark:text-cyan-400">
                  <Activity size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-600 dark:text-cyan-400 font-heading">
                    OBSERVATION DETAIL
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-heading">
                    {typeLabel}
                  </h3>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-5 flex flex-col gap-4 text-xs">
              {/* Type & Timestamp Badge Row */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/60 font-mono text-[11px]">
                <div className="flex items-center gap-2">
                  <Code size={13} className="text-slate-500 dark:text-slate-400" />
                  <span className="text-slate-800 dark:text-slate-300 font-bold">{observation.type}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Clock size={12} />
                  <span>{new Date(observation.timestamp).toLocaleString()}</span>
                </div>
              </div>

              {/* 1. Activity Section */}
              <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/50">
                <div className="flex items-center gap-1.5 text-sky-600 dark:text-cyan-400 font-bold font-heading text-[11px]">
                  <Layers size={13} />
                  <span>ACTIVITY</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 block">Name:</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{observation.activity?.name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 block">Category:</span>
                    <span className="font-medium">{observation.activity?.category || 'General'}</span>
                  </div>
                  {observation.activity?.duration > 0 && (
                    <div className="col-span-2 mt-1 pt-1.5 border-t border-slate-200 dark:border-slate-800/40">
                      <span className="text-[10px] text-slate-400 dark:text-slate-400 block">Duration:</span>
                      <span className="font-bold text-sky-600 dark:text-cyan-300 font-mono">
                        {observation.activity.duration} minutes
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Context Section */}
              <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/50">
                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold font-heading text-[11px]">
                  <Compass size={13} />
                  <span>CONTEXT</span>
                </div>
                <div className="flex flex-col gap-1.5 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-sans">Route:</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">{observation.context?.page || '/'}</span>
                  </div>
                  {observation.context?.taskId && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-sans">Task ID:</span>
                      <span className="text-slate-800 dark:text-slate-300">{observation.context.taskId}</span>
                    </div>
                  )}
                  {observation.context?.sessionId && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-sans">Session ID:</span>
                      <span className="text-slate-800 dark:text-slate-300">{observation.context.sessionId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Metadata Section */}
              {observation.metadata && Object.keys(observation.metadata).length > 0 && (
                <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/50">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold font-heading text-[11px]">
                    <FileText size={13} />
                    <span>METADATA</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                    {Object.entries(observation.metadata).map(([key, val]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-sans capitalize">
                          {key.replace(/([A-Z])/g, ' $1')}:
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              <span>ID: {observation.id}</span>
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold font-heading hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
