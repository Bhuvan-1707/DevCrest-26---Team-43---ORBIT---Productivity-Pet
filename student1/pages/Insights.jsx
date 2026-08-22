import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { Sparkles, TrendingUp, Layers, ShieldCheck, Zap, Sliders, CheckCircle2, Award } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import { 
  mockWeeklyProductivity, 
  mockInsights, 
  mockProtocol,
  mockFocus 
} from '../data/mockData';

// Custom Tooltip for Focus Trend
const FocusTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-xl bg-[#0c0e17]/95 border border-slate-800 shadow-xl text-xs">
        <p className="font-bold text-slate-200 mb-1">{label} Telemetry</p>
        <p className="text-cyan-400 font-semibold">Focus Score: {payload[0].value} / 100</p>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Task Completion
const TaskTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-xl bg-[#0c0e17]/95 border border-slate-800 shadow-xl text-xs">
        <p className="font-bold text-slate-200 mb-1">{label} Activity</p>
        <p className="text-emerald-400 font-semibold">Completed: {payload[0].value} tasks</p>
      </div>
    );
  }
  return null;
};

export default function Insights() {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full select-none">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-heading">
            BEHAVIORAL OBSERVATION ENGINE
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 font-heading tracking-tight">
          System Observations & Protocol Analysis
        </h1>
        <p className="text-sm text-slate-400 max-w-3xl font-sans">
          ORBIT continuously monitors focus trends, task velocity, and break intervals to build evidence-backed observations and refine your personal learning protocol.
        </p>
      </div>

      {/* 1 & 2. Focus Trend & Task Completion Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Focus Score Trend Chart */}
        <Card className="orbit-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">TELEMETRY</span>
              <h3 className="text-base font-bold text-slate-100 font-heading">Focus Score Evolution</h3>
            </div>
            <Badge variant="cyan" size="sm">
              <TrendingUp size={12} className="mr-1 inline" /> +{mockFocus.change}% Trend
            </Badge>
          </div>

          <div className="w-full h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockWeeklyProductivity} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[40, 100]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<FocusTooltip />} />
                <Area type="monotone" dataKey="focus" stroke="#38bdf8" strokeWidth={2.5} fill="url(#areaGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* 2. Task Completion Velocity Bar Chart */}
        <Card className="orbit-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">VELOCITY</span>
              <h3 className="text-base font-bold text-slate-100 font-heading">Task Completion Velocity</h3>
            </div>
            <Badge variant="emerald" size="sm">
              31 Tasks This Week
            </Badge>
          </div>

          <div className="w-full h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockWeeklyProductivity} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 8]} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<TaskTooltip />} />
                <Bar dataKey="tasksCompleted" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* 3, 4, 5. Detected Behavioral Patterns */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-cyan-400" />
            <h3 className="text-lg font-bold text-slate-100 font-heading">
              Detected Behavior Patterns
            </h3>
          </div>
          <Badge variant="indigo" size="sm">
            {mockInsights.length} Observations Active
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockInsights.map((insight) => (
            <Card 
              key={insight.id}
              glow
              className="orbit-card bg-gradient-to-br from-[#0d1426]/90 to-[#0a0d18]/80 border-cyan-500/30 flex flex-col justify-between"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                    <Sparkles size={12} /> {insight.type}
                  </span>
                  <Badge variant="cyan" size="sm">
                    {insight.confidence}% Confidence
                  </Badge>
                </div>

                <h4 className="text-base font-bold text-slate-100 font-heading mt-1">
                  {insight.title}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed font-sans mt-1">
                  "{insight.description}"
                </p>
              </div>

              {/* Confidence Progress & Evidence Statements */}
              <div className="mt-6 flex flex-col gap-3 pt-3 border-t border-slate-800/60">
                <ProgressBar
                  value={insight.confidence}
                  variant="cyan"
                  height="sm"
                />

                <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="flex items-center gap-1.5 font-medium text-slate-300">
                    <Layers size={13} className="text-indigo-400" />
                    Based on <strong className="text-cyan-300">{insight.evidenceCount} recorded sessions</strong>.
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Verified</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 6. Personal Protocol Preview */}
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-emerald-400" />
            <h3 className="text-lg font-bold text-slate-100 font-heading">
              Personalized Protocol Preview
            </h3>
          </div>
          <Badge variant="emerald" size="sm">
            {mockProtocol.status}
          </Badge>
        </div>

        <Card className="orbit-card bg-gradient-to-r from-[#0a1622]/90 via-[#0d1b2a]/80 to-[#102235]/90 border-emerald-500/30">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-2">
            <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Focus Cycle Cadence</span>
              <span className="text-sm font-bold text-cyan-300 font-heading">{mockProtocol.focusCycle}</span>
              <span className="text-[10px] text-slate-500">45m focus + 6m break</span>
            </div>

            <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Optimal Study Window</span>
              <span className="text-sm font-bold text-amber-300 font-heading">{mockProtocol.bestStudyTime}</span>
              <span className="text-[10px] text-slate-500">Peak morning cognitive window</span>
            </div>

            <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Learning Method</span>
              <span className="text-sm font-bold text-emerald-300 font-heading">{mockProtocol.preferredMethod}</span>
              <span className="text-[10px] text-slate-500">Active retrieval practice</span>
            </div>

            <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Recovery Strategy</span>
              <span className="text-sm font-bold text-indigo-300 font-heading">{mockProtocol.recovery}</span>
              <span className="text-[10px] text-slate-500">Walking + ambient music</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
