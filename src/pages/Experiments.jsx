import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Plus, Trash2, CheckCircle2, AlertCircle, Play, Check } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { experimentsApi } from '../services/api/experimentsApi';

export default function Experiments() {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const [name, setName] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [variable, setVariable] = useState('');

  useEffect(() => {
    loadExperiments();
  }, []);

  async function loadExperiments() {
    setLoading(true);
    setError('');
    try {
      const res = await experimentsApi.getExperiments();
      const items = res?.data || res || [];
      setExperiments(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('[Experiments Page] Error loading experiments:', err);
      setError(err.message || 'Failed to load experiments');
    } finally {
      setLoading(false);
    }
  }

  const handleCreateExperiment = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const res = await experimentsApi.createExperiment({
        title: name.trim(),
        name: name.trim(),
        hypothesis: hypothesis.trim() || 'Testing productivity hypothesis',
        variable: variable.trim() || 'Focus Duration',
        start_date: new Date().toISOString().substring(0, 10),
        status: 'active',
        result: 'In Progress',
      });
      const created = res?.data || res;
      setExperiments(prev => [created, ...prev]);
      setName('');
      setHypothesis('');
      setVariable('');
      setShowAddForm(false);
    } catch (err) {
      console.error('[Experiments Page] Create experiment failed:', err);
      setError(err.message || 'Failed to create experiment');
    }
  };

  const handleCompleteExperiment = async (exp) => {
    const nextStatus = exp.status === 'completed' ? 'active' : 'completed';
    const nextResult = nextStatus === 'completed' ? 'Hypothesis Validated' : 'In Progress';

    setExperiments(prev =>
      prev.map(e => (e.id === exp.id ? { ...e, status: nextStatus, result: nextResult } : e))
    );

    try {
      await experimentsApi.updateExperiment(exp.id, {
        status: nextStatus,
        result: nextResult,
      });
    } catch (err) {
      console.error('[Experiments Page] Update experiment failed:', err);
    }
  };

  const handleDeleteExperiment = async (id) => {
    setExperiments(prev => prev.filter(e => e.id !== id));
    try {
      await experimentsApi.deleteExperiment(id);
    } catch (err) {
      console.error('[Experiments Page] Delete experiment failed:', err);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full select-none">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Zap className="text-amber-400" size={20} />
            <h1 className="text-xl lg:text-2xl font-bold text-slate-100 font-heading">
              Behavioral Experiments
            </h1>
          </div>
          <p className="text-xs lg:text-sm text-slate-400">
            Design, execute, and validate personal productivity and focus experiments.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : 'New Experiment'}
        </Button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Create Experiment Form */}
      {showAddForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="orbit-card p-6 border-amber-500/30">
            <h3 className="text-sm font-bold text-slate-100 font-heading mb-4">Design New Experiment</h3>
            <form onSubmit={handleCreateExperiment} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Experiment Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. 50-Minute Pomodoro vs 25-Minute"
                    className="w-full bg-[#07090e] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Tested Variable</label>
                  <input
                    type="text"
                    value={variable}
                    onChange={e => setVariable(e.target.value)}
                    placeholder="e.g. Session Length / Morning Timing"
                    className="w-full bg-[#07090e] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Hypothesis</label>
                <textarea
                  rows={2}
                  value={hypothesis}
                  onChange={e => setHypothesis(e.target.value)}
                  placeholder="What outcome do you expect from this change?"
                  className="w-full bg-[#07090e] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="submit" variant="primary" size="sm">Launch Experiment</Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Experiments Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
        </div>
      ) : experiments.length === 0 ? (
        <Card className="orbit-card p-12 text-center flex flex-col items-center">
          <Zap size={32} className="text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No active experiments</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">Click 'New Experiment' to design your first productivity test.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {experiments.map(exp => (
            <Card key={exp.id} className="orbit-card p-6 flex flex-col justify-between relative overflow-hidden group">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Badge variant={exp.status === 'completed' ? 'emerald' : 'amber'} size="sm">
                    {exp.status || 'active'}
                  </Badge>
                  <button
                    onClick={() => handleDeleteExperiment(exp.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-all"
                    title="Delete Experiment"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-100 font-heading mt-1">{exp.name}</h3>
                {exp.variable && <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">Variable: {exp.variable}</span>}
                {exp.hypothesis && <p className="text-xs text-slate-300 italic">"{exp.hypothesis}"</p>}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">Result: <strong className="text-slate-200">{exp.result || 'In Progress'}</strong></span>
                <button
                  onClick={() => handleCompleteExperiment(exp)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold flex items-center gap-1 transition-all"
                >
                  <Check size={13} />
                  {exp.status === 'completed' ? 'Reopen' : 'Validate'}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
