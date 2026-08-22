import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';
import Card from '../common/Card';
import { sessionsApi } from '../../services/api/sessionsApi';
import { tasksApi } from '../../services/api/tasksApi';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 rounded-xl bg-[#0c0e17]/95 border border-slate-800 shadow-xl backdrop-blur-md text-xs select-none">
        <p className="font-bold text-slate-200 mb-1.5 font-heading">{label} — Focus Summary</p>
        <div className="flex flex-col gap-1 text-slate-300">
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Focus Score:</span>
            <span className="font-bold text-cyan-400">{data.focus} / 100</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Tasks Completed:</span>
            <span className="font-semibold text-slate-200">{data.tasksCompleted} tasks</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400">Productive Time:</span>
            <span className="font-semibold text-slate-200">{data.productiveMinutes} min</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const DEFAULT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ProductivityOverview() {
  const [chartData, setChartData] = useState([]);
  const [avgScore, setAvgScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      try {
        const [sessRes, taskRes] = await Promise.all([
          sessionsApi.getSessions().catch(() => ({ data: [] })),
          tasksApi.getTasks().catch(() => ({ data: [] })),
        ]);

        const sessions = sessRes?.data || sessRes || [];
        const tasks = taskRes?.data || taskRes || [];

        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const dayMap = {};
        days.forEach(d => {
          dayMap[d] = { focusSum: 0, count: 0, tasksCompleted: 0, productiveMinutes: 0 };
        });

        if (Array.isArray(sessions)) {
          sessions.forEach(s => {
            const date = new Date(s.created_at || s.createdAt || Date.now());
            const dayName = days[(date.getDay() + 6) % 7]; // Map Sun(0)->6, Mon(1)->0
            if (dayMap[dayName]) {
              dayMap[dayName].focusSum += (s.focusScore || s.focus_score || 80);
              dayMap[dayName].count += 1;
              dayMap[dayName].productiveMinutes += (s.actualDurationMinutes || s.actual_duration_minutes || s.duration || 0);
            }
          });
        }

        if (Array.isArray(tasks)) {
          tasks.forEach(t => {
            if (t.completed || t.status === 'completed') {
              const date = new Date(t.updated_at || t.updatedAt || Date.now());
              const dayName = days[(date.getDay() + 6) % 7];
              if (dayMap[dayName]) {
                dayMap[dayName].tasksCompleted += 1;
              }
            }
          });
        }

        const dynamicChart = days.map(day => {
          const entry = dayMap[day];
          const focusAvg = entry.count > 0 ? Math.round(entry.focusSum / entry.count) : 0;
          return {
            day,
            focus: focusAvg,
            tasksCompleted: entry.tasksCompleted,
            productiveMinutes: entry.productiveMinutes,
          };
        });

        if (sessions.length > 0) {
          const calculatedAvg = Math.round(
            sessions.reduce((acc, s) => acc + (s.focusScore || s.focus_score || 80), 0) / sessions.length
          );
          setAvgScore(calculatedAvg);
        } else {
          setAvgScore(0);
        }

        setChartData(dynamicChart);
      } catch (err) {
        console.error('[ProductivityOverview] Error loading trend:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <Card className="orbit-card flex items-center justify-center h-full min-h-[260px]">
        <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
      </Card>
    );
  }

  return (
    <Card className="orbit-card flex flex-col justify-between h-full relative overflow-hidden">
      {/* Header & Score Metric */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100 font-heading">
              Productivity Overview
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            7-day focus trend analysis
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right">
            <div className="flex items-center gap-1 font-extrabold text-lg text-slate-100 font-heading">
              {avgScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-medium flex items-center justify-end gap-0.5">
              <TrendingUp size={10} /> Live backend index
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Line Chart Container */}
      <div className="w-full h-56 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.6} />

            <XAxis 
              dataKey="day" 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }} 
              dy={5}
            />

            <YAxis 
              domain={[40, 100]} 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: '#64748b', fontSize: 10 }} 
              dx={-5}
            />

            <Tooltip content={<CustomTooltip />} />

            <Line 
              type="monotone" 
              dataKey="focus" 
              stroke="#38bdf8" 
              strokeWidth={3} 
              dot={{ fill: '#0f172a', stroke: '#38bdf8', strokeWidth: 2, r: 4 }} 
              activeDot={{ fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2, r: 6 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Metrics */}
      <div className="pt-3 mt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <span>Highest Focus: <strong className="text-slate-200">Friday (85)</strong></span>
        <span>7-day Avg: <strong className="text-slate-200">{avgScore} / 100</strong></span>
      </div>
    </Card>
  );
}
