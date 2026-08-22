import React, { useState } from 'react';
import { 
  Activity, 
  BarChart3,
  ListFilter
} from 'lucide-react';
import ObservationSummary from '../components/observations/ObservationSummary';
import ObservationTimeline from '../components/observations/ObservationTimeline';
import ActivityAnalytics from '../components/observations/ActivityAnalytics';

export default function Observations() {
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' | 'analytics'

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full select-none">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Activity size={20} className="text-sky-600 dark:text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-cyan-400 font-heading">
              ORBIT SYSTEM TELEMETRY
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-heading tracking-tight">
            Observation Record Log
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl font-sans">
            Structured stream recording focus session events, task interactions, recovery cycles, and navigation steps within ORBIT.
          </p>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200/60 dark:bg-slate-900/80 border border-slate-300/80 dark:border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`
              px-4 py-2 rounded-lg text-xs font-bold font-heading flex items-center gap-2 transition-all cursor-pointer
              ${activeTab === 'timeline'
                ? 'bg-white dark:bg-cyan-500/20 text-indigo-600 dark:text-cyan-300 border border-slate-200 dark:border-cyan-500/40 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}
            `}
          >
            <ListFilter size={14} />
            <span>Timeline Log</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`
              px-4 py-2 rounded-lg text-xs font-bold font-heading flex items-center gap-2 transition-all cursor-pointer
              ${activeTab === 'analytics'
                ? 'bg-white dark:bg-cyan-500/20 text-indigo-600 dark:text-cyan-300 border border-slate-200 dark:border-cyan-500/40 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}
            `}
          >
            <BarChart3 size={14} />
            <span>Telemetry Analytics</span>
          </button>
        </div>
      </div>

      {/* 2. Observation Summary Component (Real-time computed metrics) */}
      <ObservationSummary />

      {/* 3. Tab Content View Switch */}
      {activeTab === 'analytics' ? (
        <ActivityAnalytics />
      ) : (
        <div className="w-full">
          <ObservationTimeline limit={50} title="Observations Telemetry Stream" />
        </div>
      )}
    </div>
  );
}
