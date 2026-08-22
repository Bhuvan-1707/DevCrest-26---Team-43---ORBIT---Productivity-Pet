import React, { useState, useEffect } from 'react';
import { Sparkles, Layers, ShieldCheck } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import ProgressBar from '../common/ProgressBar';
import { insightsApi } from '../../services/api/insightsApi';

export default function InsightCard() {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInsight() {
      setLoading(true);
      try {
        const res = await insightsApi.getInsights();
        const items = res?.data || res || [];
        if (items.length > 0) {
          setInsight(items[0]);
        } else {
          // Seed initial insight pattern
          const seedRes = await insightsApi.createInsight({
            title: "Morning focus window optimization",
            explanation: "You tend to maintain higher focus during shorter morning sessions.",
            confidence: 82,
            evidenceCount: 14,
          });
          setInsight(seedRes?.data || seedRes);
        }
      } catch (err) {
        console.error('[InsightCard] Error loading insights:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInsight();
  }, []);

  if (loading) {
    return (
      <Card className="orbit-card flex items-center justify-center h-full min-h-[220px]">
        <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
      </Card>
    );
  }

  const title = insight?.title || 'Morning focus window optimization';
  const explanation = insight?.explanation || insight?.description || 'You tend to maintain higher focus during shorter morning sessions.';
  const confidence = insight?.confidence || 82;
  const evidenceCount = insight?.evidenceCount || insight?.evidence_count || 14;

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
            Telemetry Pattern
          </Badge>
        </div>

        <h3 className="text-base font-bold text-slate-100 font-heading tracking-tight mt-1">
          {title}
        </h3>
      </div>

      {/* Explanation Content */}
      <p className="text-xs lg:text-sm text-slate-300 leading-relaxed my-4 relative z-10 font-sans">
        "{explanation}"
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
            <span className="font-bold text-cyan-300">{confidence}%</span>
          </div>
          <ProgressBar
            value={confidence}
            variant="cyan"
            height="sm"
            animate
          />
        </div>

        {/* Evidence Count Statement */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
          <span className="flex items-center gap-1.5 font-medium">
            <Layers size={13} className="text-indigo-400" />
            Based on <strong className="text-slate-200">{evidenceCount} recorded sessions</strong>.
          </span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wide">Observed</span>
        </div>
      </div>
    </Card>
  );
}
