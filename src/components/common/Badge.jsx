import React from 'react';

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon,
  pulse = false,
  className = '',
  ...props
}) {
  const sizeMap = {
    sm: 'px-2 py-0.5 text-[10px] rounded-md gap-1 font-medium',
    md: 'px-2.5 py-1 text-xs rounded-full gap-1.5 font-semibold',
  };

  const variantMap = {
    default: 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300',
    indigo: 'bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300',
    cyan: 'bg-sky-50 dark:bg-cyan-500/10 border border-sky-200 dark:border-cyan-500/20 text-sky-700 dark:text-cyan-300',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400',
    purple: 'bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-300',
    rose: 'bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300',
    
    /* Memory Tier Badges */
    live: 'bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400',
    trusted: 'bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300',
    evidence: 'bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 text-sky-700 dark:text-sky-300',
  };

  const pulseColors = {
    default: 'bg-slate-400',
    indigo: 'bg-indigo-500',
    cyan: 'bg-sky-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-500',
    rose: 'bg-rose-500',
    live: 'bg-rose-500',
    trusted: 'bg-amber-500',
    evidence: 'bg-sky-500',
  };

  return (
    <span
      className={`
        inline-flex items-center tracking-wide uppercase select-none transition-colors
        ${sizeMap[size] || sizeMap.md}
        ${variantMap[variant] || variantMap.default}
        ${className}
      `}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseColors[variant] || 'bg-slate-400'}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${pulseColors[variant] || 'bg-slate-400'}`} />
        </span>
      )}
      {Icon && <Icon size={size === 'sm' ? 11 : 13} />}
      {children && <span>{children}</span>}
    </span>
  );
}
