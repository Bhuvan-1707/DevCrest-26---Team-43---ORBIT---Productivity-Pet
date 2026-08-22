import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CheckSquare, ListTodo, Plus } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import ProgressBar from '../common/ProgressBar';
import { mockTasks } from '../../data/mockData';

export default function TodayTaskCard() {
  const [tasks, setTasks] = useState(mockTasks);

  const toggleTask = (id) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

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
          <Badge variant={completedCount === totalCount ? 'emerald' : 'indigo'} size="sm">
            {completedCount} / {totalCount} Done
          </Badge>
        </div>

        {/* Dynamic Completion Progress Bar */}
        <ProgressBar
          value={progressPercent}
          variant={completedCount === totalCount ? 'emerald' : 'cyan'}
          height="sm"
          animate
        />
      </div>

      {/* Task Interactive Checklist */}
      <div className="my-4 flex flex-col gap-2">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            layout
            onClick={() => toggleTask(task.id)}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            className={`
              flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none
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

            {/* Task Category / Metadata Badge */}
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ml-2 shrink-0 ${
              task.completed 
                ? 'bg-slate-900/80 text-slate-400 border border-slate-800/60' 
                : 'bg-slate-800/60 text-slate-400 border border-slate-700/50'
            }`}>
              {task.category || task.difficulty}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Task Card Footer */}
      <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60">
        <span>Click task to toggle completion</span>
        <span className="text-cyan-400/90 font-semibold">{progressPercent}% complete</span>
      </div>
    </Card>
  );
}
