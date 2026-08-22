import React, { useState, useEffect } from 'react';
import { Bell, Settings, Flame, User, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { sessionsApi } from '../../services/api/sessionsApi';
import { tasksApi } from '../../services/api/tasksApi';

export default function Topbar({ userName, streakDays }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const activeName = user?.name || userName || 'User';
  const [dynamicStreak, setDynamicStreak] = useState(streakDays !== undefined ? streakDays : 0);

  useEffect(() => {
    async function calculateStreak() {
      try {
        const [sessRes, taskRes] = await Promise.allSettled([
          sessionsApi.getSessions(),
          tasksApi.getTasks(),
        ]);
        const sessions = sessRes.status === 'fulfilled' ? (sessRes.value?.data || sessRes.value || []) : [];
        const tasks = taskRes.status === 'fulfilled' ? (taskRes.value?.data || taskRes.value || []) : [];

        const activeDates = new Set();
        sessions.forEach(s => {
          if (s.created_at || s.createdAt) {
            activeDates.add(new Date(s.created_at || s.createdAt).toDateString());
          }
        });
        tasks.forEach(t => {
          if (t.completed && (t.updated_at || t.updatedAt)) {
            activeDates.add(new Date(t.updated_at || t.updatedAt).toDateString());
          }
        });

        setDynamicStreak(activeDates.size);
      } catch (err) {
        console.warn('[Topbar] Error calculating streak:', err);
      }
    }
    if (streakDays === undefined) {
      calculateStreak();
    }
  }, [streakDays]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="h-16 border-b border-slate-200/80 dark:border-slate-800/60 bg-white/70 dark:bg-[#0c101b]/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-30 select-none shadow-xs shadow-slate-900/2">
      {/* Greeting Title */}
      <div className="flex items-center gap-3 ml-10 lg:ml-0">
        <h2 className="text-sm lg:text-base font-semibold text-slate-800 dark:text-slate-200 font-heading">
          {getGreeting()}, <span className="text-indigo-600 dark:text-indigo-300 font-bold">{activeName}</span>
        </h2>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Streak Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-semibold shadow-xs">
          <Flame size={14} className="text-amber-500 fill-amber-500 animate-pulse" />
          <span className="tracking-wide">{dynamicStreak} day streak</span>
        </div>

        {/* Notifications Icon Button */}
        <button 
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all relative cursor-pointer"
          aria-label="Notifications"
        >
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-sky-500 dark:bg-cyan-400"></span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all cursor-pointer"
          title={`Switch to ${theme === 'light' ? 'Night' : 'Light'} Mode`}
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={17} className="text-indigo-600" /> : <Sun size={17} className="text-amber-400" />}
        </button>

        {/* Settings Icon Button */}
        <button 
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all cursor-pointer"
          aria-label="Settings"
        >
          <Settings size={17} />
        </button>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/20 transition-all flex items-center gap-1 text-xs cursor-pointer"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut size={17} />
        </button>

        {/* Profile Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 via-sky-400 to-indigo-600 p-[1px] shadow-sm ml-1 cursor-pointer">
          <div className="w-full h-full rounded-full bg-white dark:bg-[#0b0e17] flex items-center justify-center text-indigo-600 dark:text-indigo-300">
            <User size={15} />
          </div>
        </div>
      </div>
    </header>
  );
}
