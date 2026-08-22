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
import { BarChart3, Clock, Calendar, CheckSquare, FileX } from 'lucide-react';
import Card from '../common/Card';
import { OBSERVATION_TYPES } from '../../data/observationData';
import { observationService } from '../../services/observationService';

/**
 * Custom Glassmorphism Tooltip for Recharts
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 shadow-xl backdrop-blur-md text-xs font-sans">
        <p className="font-bold text-slate-200 font-heading mb-1">{label}</p>
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3 text-[11px]">
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="font-bold text-slate-100 font-mono">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ActivityAnalytics() {
  const [hourlyData, setHourlyData] = useState([]);
  const [sessionDayData, setSessionDayData] = useState([]);
  const [taskDayData, setTaskDayData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const processAnalytics = async () => {
    try {
      const logs = await observationService.getObservations();
      setTotalCount(logs.length);

      if (!logs || logs.length === 0) {
        setLoading(false);
        return;
      }

      // 1. Observations by Hour (24-hour distribution)
      const hoursMap = Array.from({ length: 24 }, (_, i) => ({
        hourLabel: `${i.toString().padStart(2, '0')}:00`,
        events: 0,
      }));

      // 2. Days of week distribution (Last 7 Days)
      const now = new Date();
      const daysMap = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dayStr = d.toISOString().substring(0, 10);
        const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short' });
        daysMap.push({
          dateStr: dayStr,
          dayLabel,
          sessions: 0,
          tasksCompleted: 0,
          tasksCreated: 0,
        });
      }

      // Populate telemetry counts
      logs.forEach(obs => {
        if (!obs.timestamp) return;

        // Hour distribution
        const obsDate = new Date(obs.timestamp);
        const hr = obsDate.getHours();
        if (hoursMap[hr]) {
          hoursMap[hr].events += 1;
        }

        // Day distribution
        const dateStr = obs.timestamp.substring(0, 10);
        const dayItem = daysMap.find(d => d.dateStr === dateStr);
        if (dayItem) {
          if (obs.type?.startsWith('SESSION_')) {
            dayItem.sessions += 1;
          }
          if (obs.type === OBSERVATION_TYPES.TASK_COMPLETED) {
            dayItem.tasksCompleted += 1;
          }
          if (obs.type === OBSERVATION_TYPES.TASK_CREATED) {
            dayItem.tasksCreated += 1;
          }
        }
      });

      setHourlyData(hoursMap.filter(h => h.events > 0 || true)); // keep full 24h span
      setSessionDayData(daysMap);
      setTaskDayData(daysMap);
    } catch (err) {
      console.error('[ActivityAnalytics] Processing error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    processAnalytics();
    const interval = setInterval(processAnalytics, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="orbit-card p-8 flex items-center justify-center text-xs text-slate-400">
        Processing telemetry analytics...
      </Card>
    );
  }

  if (totalCount === 0) {
    return (
      <Card className="orbit-card p-10 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mb-3">
          <FileX size={24} />
        </div>
        <h4 className="text-sm font-bold text-slate-200 font-heading mb-1">
          Insufficient Observation Telemetry
        </h4>
        <p className="text-xs text-slate-400 max-w-md">
          Perform focus sessions or complete tasks to record activity telemetry and populate analytics charts.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* Chart 1: Observations by Hour */}
      <Card className="orbit-card p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100 font-heading">
              Observations by Hour
            </h3>
          </div>
          <span className="text-[10px] font-semibold text-slate-400">24-Hour Distribution</span>
        </div>

        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaColorEvents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="hourLabel" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="events" name="Total Events" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#areaColorEvents)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Grid of Chart 2 & 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 2: Focus Sessions by Day */}
        <Card className="orbit-card p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-100 font-heading">
                Focus Sessions by Day
              </h3>
            </div>
            <span className="text-[10px] font-semibold text-slate-400">Last 7 Days</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessionDayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="dayLabel" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sessions" name="Sessions" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 3: Task Activity by Day */}
        <Card className="orbit-card p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare size={16} className="text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100 font-heading">
                Task Activity by Day
              </h3>
            </div>
            <span className="text-[10px] font-semibold text-slate-400">Last 7 Days</span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskDayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="dayLabel" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="tasksCompleted" name="Completed Tasks" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="tasksCreated" name="Created Tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
