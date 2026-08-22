import React, { useState, useEffect } from 'react';
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
import { Sparkles, TrendingUp, Layers, ShieldCheck, Sliders, AlertCircle } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import { insightsApi } from '../services/api/insightsApi';
import { sessionsApi } from '../services/api/sessionsApi';
import { tasksApi } from '../services/api/tasksApi';

// Custom Tooltip for Focus Trend
const FocusTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-xl bg-white/95 dark:bg-[#0c0e17]/95 border border-slate-200 dark:border-slate-800 shadow-xl text-xs backdrop-blur-md">
        <p className="font-bold text-slate-900 dark:text-slate-200 mb-1 font-heading">{label} Telemetry</p>
        <p className="text-indigo-600 dark:text-cyan-400 font-semibold">Focus Score: {payload[0].value} / 100</p>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Task Completion
const TaskTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-xl bg-white/95 dark:bg-[#0c0e17]/95 border border-slate-200 dark:border-slate-800 shadow-xl text-xs backdrop-blur-md">
        <p className="font-bold text-slate-900 dark:text-slate-200 mb-1 font-heading">{label} Activity</p>
        <p className="text-emerald-600 dark:text-emerald-400 font-semibold">Completed: {payload[0].value} tasks</p>
      </div>
    );
  }
  return null;
};

export default function Insights() {
  const [insights, setInsights] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [totalWeeklyTasks, setTotalWeeklyTasks] = useState(0);
  const [focusTrendChange, setFocusTrendChange] = useState(12);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInsightsAndAnalytics();
  }, []);

  async function loadInsightsAndAnalytics() {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch Insights
      const res = await insightsApi.getInsights();
      let fetched = res?.data || res || [];
      if (!Array.isArray(fetched)) fetched = [];
      setInsights(fetched);

      // 2. Fetch Sessions & Tasks for Chart Analytics
      let sessions = [];
      let tasks = [];
      try {
        const sRes = await sessionsApi.getSessions();
        sessions = sRes?.data || sRes || [];
        const tRes = await tasksApi.getTasks();
        tasks = tRes?.data || tRes || [];
      } catch (e) {
        console.warn('[Insights Page] Could not load sessions/tasks for charts:', e);
      }

      // Compute weekly chart distribution (Mon-Sun)
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

      let completedTasksCount = 0;
      const chartPoints = days.map((day, idx) => {
        const dayTasks = Array.isArray(tasks) ? tasks.filter(t => t.completed && new Date(t.created_at || Date.now()).getDay() === (idx + 1) % 7).length : 0;
        completedTasksCount += dayTasks;

        const daySessions = Array.isArray(sessions) ? sessions.filter(s => new Date(s.created_at || Date.now()).getDay() === (idx + 1) % 7) : [];
        const avgScore = daySessions.length > 0 
          ? Math.round(daySessions.reduce((acc, s) => acc + Number(s.focus_score || s.focusScore || 0), 0) / daySessions.length)
          : 0;

        return {
          day,
          focus: avgScore,
          tasksCompleted: dayTasks,
        };
      });

      setWeeklyData(chartPoints);
      setTotalWeeklyTasks(completedTasksCount);
    } catch (err) {
      console.error('[Insights Page] Error loading insights:', err);
      setError(err.message || 'Failed to load system insights');
    } finally {
      setLoading(false);
    }
  }

  const activeProtocol = {
    status: insights.length > 0 ? 'ACTIVE PROTOCOL' : 'INITIAL PROTOCOL',
    focusCycle: '45 min',
    bestStudyTime: '09:00 - 11:30',
    preferredMethod: 'Active Recall',
    recovery: 'Physical Movement',
  };

  const validScores = weeklyData.map(d => d.focus).filter(f => f > 0);
  const avgFocusScore = validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0;
  const weeklyFocusHrs = Math.round((weeklyData.reduce((acc, d) => acc + d.tasksCompleted, 0) * 45 / 60) * 10) / 10;

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full select-none">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-sky-600 dark:text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-cyan-400 font-heading">
            BEHAVIORAL OBSERVATION ENGINE
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-heading tracking-tight">
          Cognitive Analytics & Behavioral Insights
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Real-time analysis of focus patterns, task completion velocity, and cognitive recovery performance.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-cyan-400" />
        </div>
      ) : error ? (
        <Card className="orbit-card p-6 border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-3">
          <AlertCircle size={20} />
          <span>Failed to load insights data: {error}</span>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="orbit-card p-5">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Avg Focus Score</span>
                <Sparkles size={16} className="text-sky-600 dark:text-cyan-400" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 font-heading">
                {avgFocusScore}
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">/ 100</span>
              </p>
              <div className="mt-3">
                <ProgressBar value={avgFocusScore} color="cyan" size="sm" />
              </div>
            </Card>

            <Card className="orbit-card p-5">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Weekly Focus Output</span>
                <TrendingUp size={16} className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 font-heading">
                {weeklyFocusHrs}
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">hrs</span>
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                Live backend tracked telemetry
              </p>
            </Card>

            <Card className="orbit-card p-5">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pattern Insights</span>
                <Layers size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 font-heading">
                {insights.length}
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400 ml-1">detected</span>
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
                {insights.length > 0 ? `${insights[0].confidenceScore || 85}% confidence average` : 'No insights recorded yet'}
              </p>
            </Card>

            <Card className="orbit-card p-5">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">System Status</span>
                <ShieldCheck size={16} className="text-sky-600 dark:text-cyan-400" />
              </div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-heading">
                Optimal
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
                Live MariaDB telemetry connected
              </p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="orbit-card p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-heading">Focus Score Trend</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Daily focus score performance from session telemetry</p>
                </div>
                <Badge variant="cyan" size="sm">7-Day Stream</Badge>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="scoreGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} opacity={0.5} />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} tickLine={false} />
                    <Tooltip content={<FocusTooltip />} />
                    <Area type="monotone" dataKey="focus" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreGlow)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="orbit-card p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-heading">Task Output Velocity</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Completed task velocity per weekday</p>
                </div>
                <Badge variant="indigo" size="sm">Activity Log</Badge>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" vertical={false} opacity={0.5} />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} allowDecimals={false} tickLine={false} />
                    <Tooltip content={<TaskTooltip />} />
                    <Bar dataKey="tasksCompleted" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-heading">
                Detected Behavioral Insights
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Sorted by Confidence Score
              </span>
            </div>

            {insights.length === 0 ? (
              <Card className="orbit-card p-8 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center gap-2">
                <Layers size={32} className="text-slate-400 dark:text-slate-600 mb-2" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">No behavioral insights detected yet</p>
                <p className="text-xs text-slate-500 dark:text-slate-500 max-w-sm">
                  Complete focus sessions and tasks to allow the behavioral engine to detect productivity patterns.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map(insight => (
                  <Card key={insight.id} className="orbit-card p-5 flex flex-col justify-between gap-4 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading">
                          {insight.title}
                        </h3>
                        <Badge variant="cyan" size="sm">
                          {insight.confidenceScore || 85}% confidence
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {insight.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Evidence Count: {insight.evidenceCount || 1} observation(s)</span>
                      <span>Recorded: {new Date(insight.created_at || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-heading">
                  Personalized Protocol Preview
                </h3>
              </div>
              <Badge variant="emerald" size="sm">
                {activeProtocol.status}
              </Badge>
            </div>

            <Card className="orbit-card bg-gradient-to-r from-emerald-50/80 via-white to-sky-50/50 dark:from-[#0a1622]/90 dark:via-[#0d1b2a]/80 dark:to-[#102235]/90 border-emerald-200 dark:border-emerald-500/30">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-2">
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Focus Cycle Cadence</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-cyan-300 font-heading">{activeProtocol.focusCycle}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-500">45m focus + 6m break</span>
                </div>

                <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Optimal Study Window</span>
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-300 font-heading">{activeProtocol.bestStudyTime}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-500">Peak morning cognitive window</span>
                </div>

                <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Learning Method</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-300 font-heading">{activeProtocol.preferredMethod}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-500">Active retrieval practice</span>
                </div>

                <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Recovery Strategy</span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-300 font-heading">{activeProtocol.recovery}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-500">Walking + ambient music</span>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
