import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import Button from '../components/common/Button';
import { goalsApi } from '../services/api/goalsApi';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTarget, setNewTarget] = useState(10);
  const [newDeadline, setNewDeadline] = useState('');

  useEffect(() => {
    loadGoals();
  }, []);

  async function loadGoals() {
    setLoading(true);
    setError('');
    try {
      const res = await goalsApi.getGoals();
      const items = res?.data || res || [];
      setGoals(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('[Goals Page] Error loading goals:', err);
      setError(err.message || 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  }

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await goalsApi.createGoal({
        title: newTitle.trim(),
        description: newDescription.trim() || 'Personal milestone target',
        target: parseInt(newTarget, 10) || 10,
        current_progress: 0,
        deadline: newDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
        status: 'active',
      });
      const created = res?.data || res;
      setGoals(prev => [created, ...prev]);
      setNewTitle('');
      setNewDescription('');
      setShowAddForm(false);
    } catch (err) {
      console.error('[Goals Page] Create goal failed:', err);
      setError(err.message || 'Failed to create goal');
    }
  };

  const handleIncrementProgress = async (goal) => {
    const nextProgress = Math.min(goal.target || 10, (goal.current_progress || 0) + 1);
    const nextStatus = nextProgress >= (goal.target || 10) ? 'completed' : 'active';

    setGoals(prev =>
      prev.map(g => (g.id === goal.id ? { ...g, current_progress: nextProgress, status: nextStatus } : g))
    );

    try {
      await goalsApi.updateGoal(goal.id, {
        current_progress: nextProgress,
        status: nextStatus,
      });
    } catch (err) {
      console.error('[Goals Page] Update goal failed:', err);
    }
  };

  const handleDeleteGoal = async (id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
    try {
      await goalsApi.deleteGoal(id);
    } catch (err) {
      console.error('[Goals Page] Delete goal failed:', err);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full select-none">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Compass className="text-indigo-600 dark:text-indigo-400" size={20} />
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100 font-heading">
              Goal Progress & Milestones
            </h1>
          </div>
          <p className="text-xs lg:text-sm text-slate-600 dark:text-slate-400">
            Track long-term productivity objectives and milestone targets.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : 'New Goal'}
        </Button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Create Goal Form */}
      {showAddForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="orbit-card p-6 border-indigo-500/30">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-heading mb-4">Create New Goal</h3>
            <form onSubmit={handleCreateGoal} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Goal Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="e.g. Master Operating Systems & Networking"
                    className="w-full bg-white dark:bg-[#07090e] border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Milestones Target</label>
                  <input
                    type="number"
                    min="1"
                    value={newTarget}
                    onChange={e => setNewTarget(e.target.value)}
                    className="w-full bg-white dark:bg-[#07090e] border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Description</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="Summary of this goal..."
                  className="w-full bg-white dark:bg-[#07090e] border border-slate-300 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="submit" variant="primary" size="sm">Save Goal</Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Goals Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      ) : goals.length === 0 ? (
        <Card className="orbit-card p-12 text-center flex flex-col items-center">
          <Compass size={32} className="text-slate-400 dark:text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No active goals yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">Click 'New Goal' to establish your first personal milestone target.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map(g => {
            const current = g.current_progress || 0;
            const target = g.target || 10;
            const percent = Math.min(Math.round((current / target) * 100), 100);

            return (
              <Card key={g.id} className="orbit-card p-6 flex flex-col justify-between relative overflow-hidden group">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={g.status === 'completed' ? 'emerald' : 'indigo'} size="sm">
                      {g.status || 'active'}
                    </Badge>
                    <button
                      onClick={() => handleDeleteGoal(g.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer"
                      title="Delete Goal"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-heading mt-1">{g.title}</h3>
                  {g.description && <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{g.description}</p>}
                </div>

                <div className="my-5 flex flex-col gap-2">
                  <ProgressBar value={percent} variant="gradient" height="md" showLabel />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-slate-800/60 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">{current} / {target} Milestones</span>
                  {g.status !== 'completed' && (
                    <button
                      onClick={() => handleIncrementProgress(g)}
                      className="px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <CheckCircle2 size={14} />
                      +1 Progress
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
