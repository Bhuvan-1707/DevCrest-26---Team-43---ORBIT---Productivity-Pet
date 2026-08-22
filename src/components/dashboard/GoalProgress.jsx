import React, { useState, useEffect } from 'react';
import { Compass, CheckCircle2, ArrowRight } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import ProgressBar from '../common/ProgressBar';
import { goalsApi } from '../../services/api/goalsApi';

export default function GoalProgress() {
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGoal() {
      setLoading(true);
      try {
        const res = await goalsApi.getGoals();
        const goalsList = res?.data || res || [];
        if (Array.isArray(goalsList) && goalsList.length > 0) {
          setGoal(goalsList[0]);
        } else {
          setGoal(null);
        }
      } catch (err) {
        console.error('[GoalProgress] Error loading goal:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGoal();
  }, []);

  if (loading) {
    return (
      <Card className="orbit-card flex items-center justify-center h-full min-h-[220px]">
        <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </Card>
    );
  }

  const current = goal?.current_progress || 0;
  const target = goal?.target || 10;
  const progressPercent = Math.min(Math.round((current / target) * 100), 100);

  return (
    <Card className="orbit-card flex flex-col justify-between h-full relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass size={16} className="text-cyan-400" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">
              CURRENT GOAL
            </span>
          </div>
          <Badge variant={progressPercent === 100 ? 'emerald' : 'indigo'} size="sm">
            {current}/{target} Progress
          </Badge>
        </div>

        <h3 className="text-base font-bold text-slate-100 font-heading tracking-tight mt-1 truncate">
          {goal?.title || 'No active goal set'}
        </h3>
      </div>

      {/* Progress Bar */}
      <div className="my-4 flex flex-col gap-2">
        <ProgressBar
          value={progressPercent}
          variant="gradient"
          showLabel
          label="Overall Mastery"
          height="md"
        />
      </div>

      {/* Milestones & Next Step Footer */}
      <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-800/60">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-400" />
            Milestones complete
          </span>
          <span className="font-bold text-slate-200">
            {current} / {target}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Status</span>
            <span className="text-slate-200 font-medium truncate max-w-[200px] capitalize">{goal?.status || 'active'}</span>
          </div>
          <ArrowRight size={14} className="text-slate-400 shrink-0" />
        </div>
      </div>
    </Card>
  );
}
