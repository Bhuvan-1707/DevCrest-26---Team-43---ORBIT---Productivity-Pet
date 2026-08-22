import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Radio, ShieldCheck, History, Sparkles, Clock, Calendar, CheckCircle2, AlertCircle, Plus, X } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import ProgressBar from '../components/common/ProgressBar';
import { memoryApi } from '../services/api/memoryApi';

export default function Memory() {
  const [activeLayer, setActiveLayer] = useState('all'); // 'all' | 'live' | 'trusted' | 'evidence'
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Memory creation modal / form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [memType, setMemType] = useState('live');
  const [contentText, setContentText] = useState('');
  const [category, setCategory] = useState('Active Session');
  const [confidenceRating, setConfidenceRating] = useState('High (85%)');
  const [focusScore, setFocusScore] = useState(85);

  useEffect(() => {
    loadMemories();
  }, []);

  async function loadMemories() {
    setLoading(true);
    setError('');
    try {
      const res = await memoryApi.getMemories();
      let fetched = res?.data || res || [];
      if (!Array.isArray(fetched)) fetched = [];
      setMemories(fetched);
    } catch (err) {
      console.error('[Memory Page] Error loading memories:', err);
      setError(err.message || 'Failed to load memory vault items');
    } finally {
      setLoading(false);
    }
  }

  const handleCreateMemory = async (e) => {
    e.preventDefault();
    if (!contentText.trim()) return;

    setError('');
    try {
      const res = await memoryApi.createMemory({
        type: memType,
        contentText: contentText.trim(),
        category: category.trim() || 'General',
        confidenceRating: confidenceRating.trim() || 'High',
        isValidated: memType === 'trusted',
        sessionDate: new Date().toISOString().split('T')[0],
        focusScore: Number(focusScore) || 85,
      });

      const newMem = res?.data || res;
      setMemories(prev => [newMem, ...prev]);
      
      // Reset form
      setContentText('');
      setShowAddForm(false);
    } catch (err) {
      console.error('[Memory Page] Error creating memory:', err);
      setError(err.message || 'Failed to record memory');
    }
  };

  // Group memories into 3 tiers
  const liveMemories = memories.filter(m => (m.type || '').toLowerCase() === 'live');
  const trustedMemories = memories.filter(m => (m.type || '').toLowerCase() === 'trusted');
  const evidenceMemories = memories.filter(m => (m.type || '').toLowerCase() === 'evidence');

  const memoryLayers = [
    {
      id: 'live',
      title: 'LIVE MEMORY',
      subtitle: 'Short-term operational context & active session telemetry',
      icon: Radio,
      badgeVariant: 'live',
      badgeText: 'Live Stream',
      count: liveMemories.length,
      color: 'cyan',
    },
    {
      id: 'trusted',
      title: 'TRUSTED MEMORY',
      subtitle: 'Validated working rules & high-confidence patterns',
      icon: ShieldCheck,
      badgeVariant: 'trusted',
      badgeText: 'Validated Rules',
      count: trustedMemories.length,
      color: 'emerald',
    },
    {
      id: 'evidence',
      title: 'EVIDENCE LOGS',
      subtitle: 'Historical session logs backing personal protocol rules',
      icon: History,
      badgeVariant: 'evidence',
      badgeText: 'Historical Telemetry',
      count: evidenceMemories.length,
      color: 'indigo',
    },
  ];

  const formatRelativeTime = (isoString) => {
    if (!isoString) return 'Recent';
    const date = new Date(isoString);
    const diffMins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full select-none">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Database size={20} className="text-sky-600 dark:text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-cyan-400 font-heading">
              INTELLIGENCE MEMORY VAULT
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-heading tracking-tight">
            Three-Tier Cognitive Memory System
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-3xl font-sans">
            ORBIT separates telemetry into operational context (<strong className="text-slate-800 dark:text-slate-200">Live</strong>), validated behavioral rules (<strong className="text-slate-800 dark:text-slate-200">Trusted</strong>), and historical execution logs (<strong className="text-slate-800 dark:text-slate-200">Evidence</strong>).
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={showAddForm ? X : Plus}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : 'Add Memory Record'}
        </Button>
      </div>

      {/* Error State Banner */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Add Memory Form */}
      {showAddForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="orbit-card p-6 border-indigo-500/30">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading mb-4">
              Record New Memory Entry
            </h3>
            <form onSubmit={handleCreateMemory} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Memory Tier</label>
                  <select
                    value={memType}
                    onChange={e => setMemType(e.target.value)}
                    className="w-full bg-white dark:bg-[#07090e] border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="live">Live Operational Context</option>
                    <option value="trusted">Trusted Protocol Rule</option>
                    <option value="evidence">Evidence Session Log</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="e.g. Active Session / Protocol"
                    className="w-full bg-white dark:bg-[#07090e] border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Confidence / Focus Rating</label>
                  {memType === 'evidence' ? (
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={focusScore}
                      onChange={e => setFocusScore(e.target.value)}
                      className="w-full bg-white dark:bg-[#07090e] border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  ) : (
                    <input
                      type="text"
                      value={confidenceRating}
                      onChange={e => setConfidenceRating(e.target.value)}
                      placeholder="e.g. High (85%)"
                      className="w-full bg-white dark:bg-[#07090e] border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Memory Detail Text</label>
                <input
                  type="text"
                  required
                  value={contentText}
                  onChange={e => setContentText(e.target.value)}
                  placeholder="Record observed context or rule..."
                  className="w-full bg-white dark:bg-[#07090e] border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Record Memory
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Memory Layer Navigation Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-1.5 rounded-2xl bg-slate-200/60 dark:bg-slate-950/70 border border-slate-300/80 dark:border-slate-800/80">
        <button
          onClick={() => setActiveLayer('all')}
          className={`py-3 px-4 rounded-xl text-xs font-bold font-heading transition-all flex items-center justify-between cursor-pointer ${
            activeLayer === 'all'
              ? 'bg-white dark:bg-gradient-to-r dark:from-indigo-600/30 dark:via-cyan-600/30 dark:to-indigo-600/20 text-indigo-600 dark:text-slate-100 border border-slate-200 dark:border-cyan-500/40 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/40'
          }`}
        >
          <span className="flex items-center gap-2">
            <Sparkles size={15} /> All Memory Layers
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
            {memories.length}
          </span>
        </button>

        {memoryLayers.map((layer) => {
          const Icon = layer.icon;
          const isActive = activeLayer === layer.id;
          return (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className={`py-3 px-4 rounded-xl text-xs font-bold font-heading transition-all flex items-center justify-between cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-gradient-to-r dark:from-indigo-600/30 dark:via-cyan-600/30 dark:to-indigo-600/20 text-indigo-600 dark:text-slate-100 border border-slate-200 dark:border-cyan-500/40 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900/40'
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon size={15} className={isActive ? 'text-indigo-600 dark:text-cyan-400' : 'text-slate-400'} />
                {layer.title}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                {layer.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      ) : memories.length === 0 ? (
        /* Empty State */
        <Card className="orbit-card p-12 text-center flex flex-col items-center">
          <Database size={32} className="text-slate-400 dark:text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Cognitive Memory Vault Empty</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            Record your first operational context, validated rule, or session log.
          </p>
        </Card>
      ) : (
        /* Memory Content Visualization Grid */
        <div className="flex flex-col gap-8">
          {/* 1. LIVE MEMORY LAYER */}
          {(activeLayer === 'all' || activeLayer === 'live') && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-sky-50 dark:bg-cyan-500/10 text-sky-600 dark:text-cyan-400 border border-sky-200 dark:border-cyan-500/20">
                    <Radio size={18} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
                      Live Memory (Operational Stream)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Short-term working context active right now</p>
                  </div>
                </div>
                <Badge variant="live" pulse>
                  {liveMemories.length} Items Active
                </Badge>
              </div>

              {liveMemories.length === 0 ? (
                <div className="text-xs text-slate-500 dark:text-slate-400 italic p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-800/40">
                  No active Live Operational Memory logs.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {liveMemories.map((item) => (
                    <Card 
                      key={item.id}
                      className="orbit-card bg-gradient-to-br from-sky-50/80 via-white to-indigo-50/40 dark:from-[#0c1220]/90 dark:to-[#0a0d18]/80 border-sky-200 dark:border-cyan-500/20 hover:border-sky-300 dark:hover:border-cyan-500/40 transition-all flex flex-col justify-between"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-cyan-400">
                            {item.category || 'Active Session'}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Clock size={11} /> {formatRelativeTime(item.created_at)}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
                          {item.content_text || item.text}
                        </p>
                      </div>
                      <div className="mt-4 pt-2 border-t border-slate-200/80 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                        <span>Memory ID: L-{item.id}</span>
                        <span className="text-sky-600 dark:text-cyan-400 font-medium">Volatile Context</span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* 2. TRUSTED MEMORY LAYER */}
          {(activeLayer === 'all' || activeLayer === 'trusted') && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
                      Trusted Memory (Validated Rules)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">High-confidence principles proven through telemetry</p>
                  </div>
                </div>
                <Badge variant="trusted">
                  {trustedMemories.length} Protocol Rules
                </Badge>
              </div>

              {trustedMemories.length === 0 ? (
                <div className="text-xs text-slate-500 dark:text-slate-400 italic p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-800/40">
                  No validated Trusted Protocol Rules recorded yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {trustedMemories.map((item) => (
                    <Card 
                      key={item.id}
                      className="orbit-card bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/30 dark:from-[#0a1814]/90 dark:to-[#091217]/80 border-emerald-200 dark:border-emerald-500/25 hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Validated Rule
                          </span>
                          <Badge variant="emerald" size="sm">
                            {item.confidence_rating || item.confidence || 'High (80%)'}
                          </Badge>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
                          "{item.content_text || item.text}"
                        </p>
                      </div>
                      <div className="mt-4 pt-2 border-t border-slate-200/80 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                        <span>Rule Ref: T-{item.id}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Protocol Standard</span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* 3. EVIDENCE MEMORY LAYER */}
          {(activeLayer === 'all' || activeLayer === 'evidence') && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                    <History size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading">
                      Evidence Memory (Historical Logs)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Recorded focus telemetry and outcome data</p>
                  </div>
                </div>
                <Badge variant="evidence">
                  {evidenceMemories.length} Recorded Sessions
                </Badge>
              </div>

              {evidenceMemories.length === 0 ? (
                <div className="text-xs text-slate-500 dark:text-slate-400 italic p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-800/40">
                  No historical Evidence Session logs recorded yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {evidenceMemories.map((item) => (
                    <Card 
                      key={item.id}
                      className="orbit-card bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 dark:from-[#0f1426]/90 dark:to-[#0b0e1b]/80 border-indigo-200 dark:border-indigo-500/20 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all flex flex-col justify-between"
                    >
                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Calendar size={12} /> {item.session_date || item.sessionDate || 'Recent'}
                          </span>
                          <span className="font-bold text-indigo-600 dark:text-cyan-300">45 min</span>
                        </div>

                        <div className="flex flex-col gap-1 my-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 dark:text-slate-400 font-medium">Focus Rating</span>
                            <span className="font-bold text-indigo-700 dark:text-indigo-300">{item.focus_score || item.focusScore || 85} / 100</span>
                          </div>
                          <ProgressBar
                            value={item.focus_score || item.focusScore || 85}
                            variant="indigo"
                            height="sm"
                          />
                        </div>

                        <p className="text-xs text-slate-800 dark:text-slate-200 font-medium line-clamp-2">
                          {item.content_text || item.outcome || 'Focus telemetry log'}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/80 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                        <span>Telemetry Log: E-{item.id}</span>
                        <span className="text-slate-500 dark:text-slate-400 font-mono">Immutable</span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
