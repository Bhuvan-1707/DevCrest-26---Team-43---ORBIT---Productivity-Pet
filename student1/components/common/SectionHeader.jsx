import React from 'react';

export default function SectionHeader({
  title,
  subtitle,
  action,
  icon: Icon,
  badge,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`} {...props}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-cyan-400 mt-0.5">
            <Icon size={18} />
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-slate-100 font-heading tracking-tight">
              {title}
            </h3>
            {badge && (
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded-md bg-slate-800 text-cyan-400 border border-slate-700/60">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-400 font-normal leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {action && (
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {action}
        </div>
      )}
    </div>
  );
}
