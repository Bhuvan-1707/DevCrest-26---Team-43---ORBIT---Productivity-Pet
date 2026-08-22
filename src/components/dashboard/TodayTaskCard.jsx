import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ListTodo, Plus, Trash2 } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import ProgressBar from '../common/ProgressBar';
import { api } from '../../services/api';
import { tasksApi } from '../../services/api/tasksApi';
import { OBSERVATION_TYPES } from '../../data/observationData';
import { observationService } from '../../services/observationService';

export default function TodayTaskCard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Fetch tasks from backend on mount
  useEffect(() => {
    async function loadTasks() {
      setLoading(true);
      try {
        const fetchedTasks = await tasksApi.getTasks();
        const taskList = fetchedTasks?.data || fetchedTasks || [];
        setTasks(Array.isArray(taskList) ? taskList : []);
      } catch (err) {
        console.error('[TodayTaskCard] Error loading tasks:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, []);

  // Toggle task completion status
  const toggleTask = async (id) => {
    const targetTask = tasks.find(t => t.id === id);
    if (!targetTask) return;

    const previousState = { completed: targetTask.completed };
    const nextCompleted = !targetTask.completed;
    const newState = { completed: nextCompleted };

    // Optimistic UI update
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: nextCompleted, status: nextCompleted ? 'completed' : 'pending' } : task
      )
    );

    try {
      // Backend API sync
      await tasksApi.updateTask(id, {
        status: nextCompleted ? 'completed' : 'pending',
      });
    } catch (err) {
      console.error('[TodayTaskCard] Error updating task:', err);
    }

    // Record Telemetry Observation via observationService
    if (nextCompleted) {
      observationService.recordObservation({
        type: OBSERVATION_TYPES.TASK_COMPLETED,
        activity: {
          name: targetTask.title,
          category: targetTask.category || targetTask.difficulty || 'General',
          duration: 25,
        },
        context: {
          page: '/dashboard',
          taskId: targetTask.id,
          previousState,
          newState,
        },
        metadata: {
          taskTitle: targetTask.title,
        },
      });
    } else {
      observationService.recordObservation({
        type: OBSERVATION_TYPES.TASK_UPDATED,
        activity: {
          name: targetTask.title,
          category: targetTask.category || targetTask.difficulty || 'General',
          duration: 0,
        },
        context: {
          page: '/dashboard',
          taskId: targetTask.id,
          previousState,
          newState,
        },
        metadata: {
          taskTitle: targetTask.title,
          updateType: 'REOPENED',
        },
      });
    }
  };

  // Add a new task via API
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const titleToAdd = newTaskTitle.trim();
    setNewTaskTitle('');
    setIsAdding(false);

    try {
      const createdTask = await api.createTask({
        title: titleToAdd,
        category: 'General',
        difficulty: 'medium',
      });
      setTasks(prev => [createdTask, ...prev]);
    } catch (err) {
      console.error('[TodayTaskCard] Error creating task:', err);
    }
  };

  // Delete a task via API
  const handleDeleteTask = async (e, id) => {
    e.stopPropagation();
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await tasksApi.deleteTask(id);
    } catch (err) {
      console.error('[TodayTaskCard] Error deleting task:', err);
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Card className="orbit-card flex flex-col justify-between h-full relative overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo size={16} className="text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100 font-heading">
              Today's Tasks
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={completedCount === totalCount && totalCount > 0 ? 'emerald' : 'indigo'} size="sm">
              {completedCount} / {totalCount} Done
            </Badge>
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 transition-all border border-slate-700/60"
              title="Add New Task"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Dynamic Completion Progress Bar */}
        <ProgressBar
          value={progressPercent}
          variant={completedCount === totalCount && totalCount > 0 ? 'emerald' : 'cyan'}
          height="sm"
          animate
        />
      </div>

      {/* Add Task Quick Form */}
      {isAdding && (
        <form onSubmit={handleAddTask} className="mt-3 flex gap-2">
          <input
            type="text"
            autoFocus
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="New task title..."
            className="flex-1 bg-[#07090e] border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all"
          >
            Add
          </button>
        </form>
      )}

      {/* Task Interactive Checklist */}
      <div className="my-4 flex flex-col gap-2 min-h-[140px]">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs font-mono">
            No tasks planned. Click '+' to add your first task.
          </div>
        ) : (
          tasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              onClick={() => toggleTask(task.id)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={`
                flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none group
                ${task.completed 
                  ? 'bg-slate-900/30 border-slate-800/40 opacity-75' 
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80 hover:bg-slate-800/40'}
              `}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Animated Custom Checkbox */}
                <div 
                  className={`
                    w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 shrink-0
                    ${task.completed 
                      ? 'bg-gradient-to-tr from-emerald-500 to-cyan-500 text-slate-950 border border-emerald-400 shadow-sm shadow-emerald-500/20' 
                      : 'border-2 border-slate-700 bg-slate-950/60 hover:border-cyan-400/60'}
                  `}
                >
                  <AnimatePresence mode="wait">
                    {task.completed && (
                      <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Check size={13} strokeWidth={3} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Task Title */}
                <span className={`text-xs font-medium truncate transition-all ${
                  task.completed ? 'line-through text-slate-400' : 'text-slate-200'
                }`}>
                  {task.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Task Category / Metadata Badge */}
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ml-2 shrink-0 ${
                  task.completed 
                    ? 'bg-slate-900/80 text-slate-400 border border-slate-800/60' 
                    : 'bg-slate-800/60 text-slate-400 border border-slate-700/50'
                }`}>
                  {task.category || task.difficulty}
                </span>

                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteTask(e, task.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-all"
                  title="Delete Task"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Task Card Footer */}
      <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60">
        <span>Click task to toggle completion</span>
        <span className="text-cyan-400/90 font-semibold">{progressPercent}% complete</span>
      </div>
    </Card>
  );
}
