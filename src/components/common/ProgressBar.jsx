import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressBar({
  value = 0,
  max = 100,
  variant = 'cyan',
  height = 'md',
  showLabel = false,
  label,
  className = '',
  animate = true,
  ...props
}) {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  const heightMap = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variantMap = {
    cyan: 'bg-gradient-to-r from-sky-500 to-indigo-600 shadow-xs shadow-sky-500/20',
    indigo: 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-xs shadow-indigo-500/20',
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-xs shadow-emerald-500/20',
    amber: 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-xs shadow-amber-500/20',
    gradient: 'bg-gradient-to-r from-indigo-600 via-purple-500 to-sky-500 shadow-xs shadow-sky-500/20',
  };

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`} {...props}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-medium">
          {label && <span>{label}</span>}
          {showLabel && <span className="font-semibold text-slate-900 dark:text-slate-100">{Math.round(percentage)}%</span>}
        </div>
      )}

      {/* Progress Track */}
      <div 
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`w-full bg-slate-200/80 dark:bg-slate-900/90 border border-slate-300/60 dark:border-slate-800/80 rounded-full overflow-hidden p-0.5 ${heightMap[height] || heightMap.md}`}
      >
        <motion.div
          initial={animate ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full rounded-full ${variantMap[variant] || variantMap.cyan}`}
        />
      </div>
    </div>
  );
}
