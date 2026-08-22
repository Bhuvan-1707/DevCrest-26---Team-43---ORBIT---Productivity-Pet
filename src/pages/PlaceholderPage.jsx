import React from 'react';

export default function PlaceholderPage({ title, description, icon: Icon }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl lg:text-2xl font-bold text-slate-100 font-heading tracking-tight">
          {title}
        </h1>
        <p className="text-xs lg:text-sm text-slate-400">
          {description}
        </p>
      </div>

      <div className="orbit-card rounded-2xl p-8 lg:p-12 flex flex-col items-center justify-center min-h-[420px] text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-slate-300 flex items-center justify-center mb-5 text-xl font-bold">
          {typeof Icon === 'function' ? <Icon size={26} /> : (Icon || '⚡')}
        </div>
        <h2 className="text-lg font-semibold text-slate-200 font-heading">
          {title} — Coming Soon
        </h2>
        <p className="text-xs lg:text-sm text-slate-400 max-w-md mt-2 leading-relaxed">
          ORBIT will unlock this module as behavioral observation and evidence gathering progresses.
        </p>
        <span className="mt-5 px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-900/90 text-slate-400 border border-slate-800">
          Module 2+ Feature
        </span>
      </div>
    </div>
  );
}
