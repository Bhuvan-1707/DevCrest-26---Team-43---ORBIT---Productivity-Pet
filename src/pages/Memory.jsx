import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Radio, ShieldCheck, History, Sparkles, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import { mockMemories } from '../data/mockData';

export default function Memory() {
  const [activeLayer, setActiveLayer] = useState('all'); // 'all' | 'live' | 'trusted' | 'evidence'

  const memoryLayers = [
    {
      id: 'live',
      title: 'LIVE MEMORY',
      subtitle: 'Short-term operational context & active session telemetry',
      icon: Radio,
      badgeVariant: 'live',
      badgeText: 'Live Stream',
      count: mockMemories.live.length,
      color: 'cyan',
    },
    {
      id: 'trusted',
      title: 'TRUSTED MEMORY',
      subtitle: 'Validated working rules & high-confidence patterns',
      icon: ShieldCheck,
      badgeVariant: 'trusted',
      badgeText: 'Validated Rules',
      count: mockMemories.trusted.length,
      color: 'emerald',
    },
    {
      id: 'evidence',
      title: 'EVIDENCE LOGS',
      subtitle: 'Historical session logs backing personal protocol rules',
      icon: History,
      badgeVariant: 'evidence',
      badgeText: 'Historical Telemetry',
      count: mockMemories.evidence.length,
      color: 'indigo',
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full select-none">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Database size={20} className="text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 font-heading">
            INTELLIGENCE MEMORY VAULT
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100 font-heading tracking-tight">
          Three-Tier Cognitive Memory System
        </h1>
        <p className="text-sm text-slate-400 max-w-3xl font-sans">
          ORBIT separates telemetry into operational context (<strong className="text-slate-200">Live</strong>), validated behavioral rules (<strong className="text-slate-200">Trusted</strong>), and historical execution logs (<strong className="text-slate-200">Evidence</strong>).
        </p>
      </div>

      {/* Memory Layer Navigation Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-1.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
        <button
          onClick={() => setActiveLayer('all')}
          className={`py-3 px-4 rounded-xl text-xs font-bold font-heading transition-all flex items-center justify-between ${
            activeLayer === 'all'
              ? 'bg-gradient-to-r from-indigo-600/30 via-cyan-600/30 to-indigo-600/20 text-slate-100 border border-cyan-500/40 shadow-lg'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <span className="flex items-center gap-2">
            <Sparkles size={15} /> All Memory Layers
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-300">
            {mockMemories.live.length + mockMemories.trusted.length + mockMemories.evidence.length}
          </span>
        </button>

        {memoryLayers.map((layer) => {
          const Icon = layer.icon;
          const isActive = activeLayer === layer.id;
          return (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className={`py-3 px-4 rounded-xl text-xs font-bold font-heading transition-all flex items-center justify-between ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600/30 via-cyan-600/30 to-indigo-600/20 text-slate-100 border border-cyan-500/40 shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon size={15} className={isActive ? 'text-cyan-400' : 'text-slate-400'} />
                {layer.title}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-300">
                {layer.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Memory Content Visualization Grid */}
      <div className="flex flex-col gap-8">
        {/* 1. LIVE MEMORY LAYER */}
        {(activeLayer === 'all' || activeLayer === 'live') && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Radio size={18} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 font-heading">
                    Live Memory (Operational Stream)
                  </h3>
                  <p className="text-xs text-slate-400">Short-term working context active right now</p>
                </div>
              </div>
              <Badge variant="live" pulse>
                {mockMemories.live.length} Items Active
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockMemories.live.map((item, idx) => (
                <Card 
                  key={item.id}
                  className="orbit-card bg-gradient-to-br from-[#0c1220]/90 to-[#0a0d18]/80 border-cyan-500/20 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                        {item.category}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock size={11} /> {item.timestamp}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-100 mt-1">
                      {item.text}
                    </p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Memory ID: {item.id}</span>
                    <span className="text-cyan-400 font-medium">Volatile Context</span>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* 2. TRUSTED MEMORY LAYER */}
        {(activeLayer === 'all' || activeLayer === 'trusted') && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 font-heading">
                    Trusted Memory (Validated Rules)
                  </h3>
                  <p className="text-xs text-slate-400">High-confidence principles proven through telemetry</p>
                </div>
              </div>
              <Badge variant="trusted">
                {mockMemories.trusted.length} Protocol Rules
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockMemories.trusted.map((item) => (
                <Card 
                  key={item.id}
                  className="orbit-card bg-gradient-to-br from-[#0a1814]/90 to-[#091217]/80 border-emerald-500/25 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Validated Rule
                      </span>
                      <Badge variant="emerald" size="sm">
                        {item.confidence}
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold text-slate-100 mt-1">
                      "{item.text}"
                    </p>
                  </div>
                  <div className="mt-4 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Rule Ref: {item.id}</span>
                    <span className="text-emerald-400 font-medium">Protocol Standard</span>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* 3. EVIDENCE MEMORY LAYER */}
        {(activeLayer === 'all' || activeLayer === 'evidence') && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <History size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 font-heading">
                    Evidence Memory (Historical Logs)
                  </h3>
                  <p className="text-xs text-slate-400">Recorded focus telemetry and outcome data</p>
                </div>
              </div>
              <Badge variant="evidence">
                {mockMemories.evidence.length} Recorded Sessions
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockMemories.evidence.map((item) => (
                <Card 
                  key={item.id}
                  className="orbit-card bg-gradient-to-br from-[#0f1426]/90 to-[#0b0e1b]/80 border-indigo-500/20 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Calendar size={12} /> {item.sessionDate}
                      </span>
                      <span className="font-bold text-cyan-300">{item.duration}</span>
                    </div>

                    <div className="flex flex-col gap-1 my-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">Focus Rating</span>
                        <span className="font-bold text-indigo-300">{item.focusScore} / 100</span>
                      </div>
                      <ProgressBar
                        value={item.focusScore}
                        variant="indigo"
                        height="sm"
                      />
                    </div>

                    <p className="text-xs text-slate-200 font-medium line-clamp-2">
                      {item.outcome}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Telemetry Log: {item.id}</span>
                    <span className="text-slate-400 font-mono">Immutable</span>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
