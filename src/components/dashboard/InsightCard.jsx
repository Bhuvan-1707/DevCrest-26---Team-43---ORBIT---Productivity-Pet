import React from 'react';
import { Sparkles, Layers, ShieldCheck } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import ProgressBar from '../common/ProgressBar';
import { mockInsights } from '../../data/mockData';

export default function InsightCard() {
  const insight = mockInsights[0] || {
    title: "Morning focus window optimization",
    description: "You tend to maintain higher focus during shorter morning sessions.",
    confidence: 78,
    evidenceCount: 12,
    type: "Observation"
  };

  return (
    <Card 
      glow 
      className="orbit-card bg-gradient-to-br from-[#0e1426]/90 via-[#0b0e1a]/80 to-[#101a2e]/90 border-cyan-500/30 flex flex-col justify-between h-full relative overflow-hidden group"
    >
      {/* Signature Glow Background Effect */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />

      {/* Header */}
      <div className="flex flex-col gap-1.5 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-cyan-400 font-extrabold text-xs tracking-wider font-heading">
            <Sparkles size={16} className="animate-pulse" />
            <span>✦ ORBIT DISCOVERED</span>
          </div>
          <Badge variant="cyan" size="sm" pulse>
            Demo Telemetry
          </Badge>
        </div>

        <h3 className="text-base font-bold text-slate-100 font-heading tracking-tight mt-1">
          {insight.title}
        </h3>
      </div>

      {/* Explanation Content */}
      <p className="text-xs lg:text-sm text-slate-300 leading-relaxed my-4 relative z-10 font-sans">
        "{insight.description}"
      </p>

      {/* Confidence & Evidence Footer Meta */}
      <div className="flex flex-col gap-3 pt-3 border-t border-slate-800/80 relative z-10">
        {/* Confidence Meter */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <ShieldCheck size={13} className="text-cyan-400" />
              Pattern Confidence
            </span>
            <span className="font-bold text-cyan-300">{insight.confidence}%</span>
          </div>
          <ProgressBar
            value={insight.confidence}
            variant="cyan"
            height="sm"
            animate
          />
        </div>

        {/* Evidence Count Statement */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
          <span className="flex items-center gap-1.5 font-medium">
            <Layers size={13} className="text-indigo-400" />
            Based on <strong className="text-slate-200">{insight.evidenceCount} recorded sessions</strong>.
          </span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wide">Observed</span>
        </div>
      </div>
    </Card>
  );
}
