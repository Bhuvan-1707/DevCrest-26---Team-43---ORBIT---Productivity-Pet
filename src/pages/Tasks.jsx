import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Plus, Trash2, Edit3, Clock, AlertCircle, CheckCircle2, Search, Filter, X } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import ProgressBar from '../components/common/ProgressBar';
import { tasksApi } from '../services/api/tasksApi';
import { OBSERVATION_TYPES } from '../data/observationData';
import { observationService } from '../services/observationService';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter & Search states
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'pending' | 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Form states (Create / Edit)
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Focus');
  const [difficulty, setDifficulty] = useState('medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState(25);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    setLoading(true);
    setError('');
    try {
      const res = await tasksApi.getTasks();
      const items = res?.data || res || [];
      setTasks(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('[Tasks Page] Error loading tasks:', err);
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }

  const resetForm = () => {
    setTitle('');
    setCategory('Focus');
    setDifficulty('medium');
    setEstimatedMinutes(25);
    setEditingTaskId(null);
    setShowAddForm(false);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setError('');
    const taskPayload = {
      title: title.trim(),
      category: category.trim() || 'General',
      difficulty: difficulty || 'medium',
      estimatedMinutes: Number(estimatedMinutes) || 25,
      estimated_minutes: Number(estimatedMinutes) || 25,
    };

    try {
      if (editingTaskId) {
        // Update existing task
        const res = await tasksApi.updateTask(editingTaskId, taskPayload);
        const updated = res?.data || res;
        setTasks(prev => prev.map(t => (t.id === editingTaskId ? { ...t, ...updated, ...taskPayload } : t)));
      } else {
        // Create new task
        const res = await tasksApi.createTask(taskPayload);
        const created = res?.data || res;
        setTasks(prev => [created, ...prev]);

        // Record telemetry observation
        observationService.recordObservation({
          type: OBSERVATION_TYPES.TASK_CREATED,
          activity: { name: created.title, category: created.category, duration: created.estimated_minutes || 25 },
          context: { page: '/tasks', taskId: created.id },
        });
      }
      resetForm();
    } catch (err) {
      console.error('[Tasks Page] Error saving task:', err);
      setError(err.message || 'Failed to save task');
    }
  };

  const handleToggleTask = async (task) => {
    const nextCompleted = !task.completed;
    const nextStatus = nextCompleted ? 'completed' : 'pending';

    // Optimistic UI update
    setTasks(prev =>
      prev.map(t => (t.id === task.id ? { ...t, completed: nextCompleted, status: nextStatus } : t))
    );

    try {
      await tasksApi.updateTask(task.id, {
        completed: nextCompleted,
        status: nextStatus,
      });

      // Telemetry observation
      observationService.recordObservation({
        type: nextCompleted ? OBSERVATION_TYPES.TASK_COMPLETED : OBSERVATION_TYPES.TASK_UPDATED,
        activity: { name: task.title, category: task.category || 'General', duration: 25 },
        context: { page: '/tasks', taskId: task.id },
      });
    } catch (err) {
      console.error('[Tasks Page] Error updating task completion:', err);
      // Revert optimistic update
      setTasks(prev =>
        prev.map(t => (t.id === task.id ? { ...t, completed: task.completed, status: task.status } : t))
      );
    }
  };

  const handleEditClick = (task) => {
    setEditingTaskId(task.id);
    setTitle(task.title || '');
    setCategory(task.category || 'Focus');
    setDifficulty(task.difficulty || 'medium');
    setEstimatedMinutes(task.estimated_minutes || task.estimatedMinutes || 25);
    setShowAddForm(true);
  };

  const handleDeleteTask = async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await tasksApi.deleteTask(id);
    } catch (err) {
      console.error('[Tasks Page] Error deleting task:', err);
      setError(err.message || 'Failed to delete task');
    }
  };

  // Filter tasks logically
  const categoriesList = Array.from(new Set(tasks.map(t => t.category || 'General')));

  const filteredTasks = tasks.filter(task => {
    const isCompleted = Boolean(task.completed || task.status === 'completed');
    if (filterTab === 'pending' && isCompleted) return false;
    if (filterTab === 'completed' && !isCompleted) return false;

    if (selectedCategory !== 'all' && (task.category || 'General') !== selectedCategory) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (task.title || '').toLowerCase().includes(q);
      const matchCategory = (task.category || '').toLowerCase().includes(q);
      if (!matchTitle && !matchCategory) return false;
    }

    return true;
  });

  const completedCount = tasks.filter(t => Boolean(t.completed || t.status === 'completed')).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full select-none">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <CheckSquare className="text-cyan-400" size={20} />
            <h1 className="text-xl lg:text-2xl font-bold text-slate-100 font-heading">
              Task Management Engine
            </h1>
          </div>
          <p className="text-xs lg:text-sm text-slate-400">
            Organize, track, and complete daily study and deep focus objectives.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={showAddForm ? X : Plus}
          onClick={() => {
            if (showAddForm) resetForm();
            else setShowAddForm(true);
          }}
        >
          {showAddForm ? 'Cancel' : 'New Task'}
        </Button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Create / Edit Form Card */}
      {showAddForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="orbit-card p-6 border-indigo-500/30">
            <h3 className="text-sm font-bold text-slate-100 font-heading mb-4">
              {editingTaskId ? 'Edit Task Specification' : 'Define New Target Task'}
            </h3>
            <form onSubmit={handleSaveTask} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Task Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Complete DAA Graph Algorithms practice"
                    className="w-full bg-[#07090e] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="e.g. Focus / Study / Rhythm"
                    className="w-full bg-[#07090e] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Difficulty Level</label>
                  <select
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value)}
                    className="w-full bg-[#07090e] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="low">Low Difficulty</option>
                    <option value="medium">Medium Difficulty</option>
                    <option value="high">High Difficulty</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1 block">Estimated Time (Minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={estimatedMinutes}
                    onChange={e => setEstimatedMinutes(e.target.value)}
                    className="w-full bg-[#07090e] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  {editingTaskId ? 'Update Task' : 'Save Task'}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Progress Metric Card */}
      <Card className="orbit-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0d1222]/90 via-[#0a0f1d]/80 to-[#10172a]/90">
        <div className="flex flex-col gap-1.5 min-w-[200px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 font-heading">Task Completion Index</span>
            <span className="text-xs font-extrabold text-cyan-400 font-heading">{progressPercent}%</span>
          </div>
          <ProgressBar value={progressPercent} variant="cyan" height="sm" animate />
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex flex-col items-center p-2 rounded-xl bg-slate-900/60 border border-slate-800 min-w-[80px]">
            <span className="text-slate-400 font-medium">Total</span>
            <span className="text-sm font-bold text-slate-100 font-heading">{totalCount}</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl bg-slate-900/60 border border-slate-800 min-w-[80px]">
            <span className="text-slate-400 font-medium">Pending</span>
            <span className="text-sm font-bold text-amber-400 font-heading">{totalCount - completedCount}</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl bg-slate-900/60 border border-slate-800 min-w-[80px]">
            <span className="text-slate-400 font-medium">Completed</span>
            <span className="text-sm font-bold text-emerald-400 font-heading">{completedCount}</span>
          </div>
        </div>
      </Card>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-slate-800/80 w-full md:w-auto">
          {['all', 'pending', 'completed'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs capitalize font-semibold transition-all flex-1 md:flex-initial ${
                filterTab === tab
                  ? 'bg-indigo-600/30 text-cyan-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full bg-[#07090e] border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Tasks List Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <Card className="orbit-card p-12 text-center flex flex-col items-center">
          <CheckSquare size={32} className="text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">
            {tasks.length === 0 ? 'No tasks created yet' : 'No tasks match your filter criteria'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            {tasks.length === 0 ? "Click 'New Task' to add your first study or focus objective." : 'Try clearing your search or status filter.'}
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredTasks.map(task => {
            const isCompleted = Boolean(task.completed || task.status === 'completed');
            const estMins = task.estimated_minutes || task.estimatedMinutes || 25;

            return (
              <motion.div key={task.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card
                  className={`orbit-card p-4 transition-all group ${
                    isCompleted ? 'bg-slate-950/40 border-slate-800/40 opacity-75' : 'border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: Checkbox & Details */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        onClick={() => handleToggleTask(task)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-500 text-slate-950 border border-emerald-400'
                            : 'border-2 border-slate-700 hover:border-cyan-400 bg-slate-950/60'
                        }`}
                      >
                        {isCompleted && <CheckCircle2 size={14} strokeWidth={3} />}
                      </button>

                      <div className="flex flex-col min-w-0 flex-1">
                        <span
                          className={`text-sm font-semibold truncate ${
                            isCompleted ? 'line-through text-slate-400' : 'text-slate-100'
                          }`}
                        >
                          {task.title}
                        </span>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock size={12} className="text-slate-500" />
                            {estMins} min
                          </span>
                          <span className="capitalize text-slate-400">• {task.difficulty || 'medium'} difficulty</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Badges & Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={isCompleted ? 'emerald' : 'indigo'} size="sm">
                        {task.category || 'General'}
                      </Badge>

                      <button
                        onClick={() => handleEditClick(task)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-cyan-300 transition-all rounded-lg hover:bg-slate-800"
                        title="Edit Task"
                      >
                        <Edit3 size={14} />
                      </button>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-400 transition-all rounded-lg hover:bg-slate-800"
                        title="Delete Task"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
