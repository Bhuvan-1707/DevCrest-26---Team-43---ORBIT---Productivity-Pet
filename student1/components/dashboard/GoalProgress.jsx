import React from 'react';
import { Compass, CheckCircle2, ArrowRight } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import ProgressBar from '../common/ProgressBar';
import { mockGoal } from '../../data/mockData';

export default function GoalProgress() {
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
          <Badge variant="indigo" size="sm">
            {mockGoal.completedMilestones}/{mockGoal.totalMilestones} Milestones
          </Badge>
        </div>

        <h3 className="text-base font-bold text-slate-100 font-heading tracking-tight mt-1">
          {mockGoal.title}
        </h3>
      </div>

      {/* Progress Bar */}
      <div className="my-4 flex flex-col gap-2">
        <ProgressBar
          value={mockGoal.progress}
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
            {mockGoal.completedMilestones} / {mockGoal.totalMilestones}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">Next Step</span>
            <span className="text-slate-200 font-medium truncate max-w-[200px]">{mockGoal.nextMilestone}</span>
          </div>
          <ArrowRight size={14} className="text-slate-400 shrink-0" />
        </div>
      </div>
    </Card>
  );
}
