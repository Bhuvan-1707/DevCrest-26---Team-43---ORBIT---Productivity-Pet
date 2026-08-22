import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Clock, AlertCircle } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import ProgressBar from '../common/ProgressBar';
import { tasksApi } from '../../services/api/tasksApi';

export default function FocusCard() {
  const navigate = useNavigate();
  const [activeTask, setActiveTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFocusTarget() {
      setLoading(true);
      try {
        const res = await tasksApi.getTasks();
        const tasks = res?.data || res || [];
        const pending = tasks.filter(t => t.status !== 'completed');
        if (pending.length > 0) {
          setActiveTask(pending[0]);
        } else if (tasks.length > 0) {
          setActiveTask(tasks[0]);
        }
      } catch (err) {
        console.error('[FocusCard] Error loading focus target:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFocusTarget();
  }, []);

  if (loading) {
    return (
      <Card className="orbit-card flex items-center justify-center h-full min-h-[220px]">
        <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </Card>
    );
  }

  const title = activeTask?.title || 'No active target set';
  const difficulty = activeTask ? (activeTask.difficulty || 'medium') : 'None';
  const isCompleted = activeTask?.status === 'completed';
  const estTime = activeTask ? `${activeTask.estimated_minutes || activeTask.estimatedMinutes || 25} min` : '0 min';

  return (
    <Card className="orbit-card flex flex-col justify-between h-full relative overflow-hidden">
      {/* Card Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            TODAY'S FOCUS
          </span>
          <Badge variant={!activeTask ? 'default' : isCompleted ? 'emerald' : 'indigo'} size="sm">
            {!activeTask ? 'No Target' : isCompleted ? 'Target Achieved' : 'Active Target'}
          </Badge>
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-heading tracking-tight mt-1 truncate">
          {title}
        </h3>
      </div>

      {/* Progress Bar Section */}
      <div className="my-5 flex flex-col gap-2">
        <ProgressBar
          value={!activeTask ? 0 : isCompleted ? 100 : 0}
          variant="gradient"
          showLabel
          label="Target Progress"
          height="md"
        />
      </div>

      {/* Details Meta Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Clock size={15} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">Estimated Time</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{estTime}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
            <AlertCircle size={15} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">Difficulty</span>
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300 capitalize">{difficulty}</span>
          </div>
        </div>
      </div>

      {/* Call to Action Button */}
      <Button
        variant="primary"
        size="md"
        icon={Target}
        fullWidth
        onClick={() => navigate(activeTask ? '/session' : '/tasks')}
      >
        {activeTask ? 'Start Focus Session' : 'Create Target Task'}
      </Button>
    </Card>
  );
}
