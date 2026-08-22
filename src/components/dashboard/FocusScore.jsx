import React, { useState, useEffect } from 'react';
import { Target, TrendingUp } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { sessionsApi } from '../../services/api/sessionsApi';

export default function FocusScore() {
  const [score, setScore] = useState(82);
  const [sessionCount, setSessionCount] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFocusMetrics() {
      setLoading(true);
      try {
        const res = await sessionsApi.getSessions();
        const sessions = res?.data || res || [];
        setSessionCount(sessions.length);

        if (sessions.length > 0) {
          const totalMins = sessions.reduce((acc, s) => acc + (s.actualDurationMinutes || s.actual_duration_minutes || s.duration || 0), 0);
          setTotalMinutes(totalMins);

          const scores = sessions.map(s => s.focusScore || s.focus_score || 80).filter(Boolean);
          if (scores.length > 0) {
            const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
            setScore(avgScore);
          }
        }
      } catch (err) {
        console.error('[FocusScore] Error loading focus sessions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFocusMetrics();
  }, []);

  const strokeDashoffset = 283 - (283 * score) / 100; // Circumference = 2 * π * 45 ≈ 283

  if (loading) {
    return (
      <Card className="orbit-card flex items-center justify-center h-full min-h-[220px]">
        <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
      </Card>
    );
  }

  return (
    <Card className="orbit-card flex flex-col justify-between h-full relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-100 font-heading">
            Focus Score
          </h3>
        </div>
        <Badge variant="cyan" size="sm">
          Live Index
        </Badge>
      </div>

      {/* Circular Progress Score Meter */}
      <div className="my-4 flex flex-col items-center justify-center relative">
        <svg className="w-32 h-32 transform -rotate-90">
          {/* Background Track */}
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-800/80"
            fill="transparent"
          />
          {/* Animated Progress Arc */}
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="url(#scoreGradient)"
            strokeWidth="8"
            strokeDasharray="283"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            fill="transparent"
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Score Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold text-slate-100 font-heading leading-none">
            {score}
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            / 100
          </span>
        </div>
      </div>

      {/* Trend Meta Footer */}
      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
        <span className="text-slate-400">{sessionCount} Sessions Recorded</span>
        <span className="flex items-center gap-1 font-bold text-emerald-400">
          <TrendingUp size={13} />
          {totalMinutes > 0 ? `${totalMinutes} focus min` : 'Optimal index'}
        </span>
      </div>
    </Card>
  );
}
