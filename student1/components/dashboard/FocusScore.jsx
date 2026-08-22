import React from 'react';
import { Target, TrendingUp } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { useSession } from '../../hooks/useSession';

export default function FocusScore() {
  const { focusState } = useSession();
  const score = focusState?.current || 82;
  const strokeDashoffset = 283 - (283 * score) / 100; // Circumference = 2 * π * 45 ≈ 283

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
        <span className="text-slate-400">Trend Status</span>
        <span className="flex items-center gap-1 font-bold text-emerald-400">
          <TrendingUp size={13} />
          ↑ {focusState?.change || 8}% from avg
        </span>
      </div>
    </Card>
  );
}
