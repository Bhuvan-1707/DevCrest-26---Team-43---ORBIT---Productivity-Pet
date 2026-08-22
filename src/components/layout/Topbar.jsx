import React from 'react';
import { Bell, Settings, Flame, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Topbar({ userName, streakDays = 7 }) {
  const { user, logout } = useAuth();
  const activeName = user?.name || userName || 'Bhuvan';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="h-16 border-b border-slate-800/40 bg-[#07090e]/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Greeting Title */}
      <div className="flex items-center gap-3 ml-10 lg:ml-0">
        <h2 className="text-sm lg:text-base font-semibold text-slate-200 font-heading">
          {getGreeting()}, <span className="text-indigo-300 font-bold">{activeName}</span>
        </h2>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Streak Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold shadow-xs">
          <Flame size={14} className="text-amber-500 fill-amber-500 animate-pulse" />
          <span className="tracking-wide">{streakDays} day streak</span>
        </div>

        {/* Notifications Icon Button */}
        <button 
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent hover:border-slate-800 transition-all relative"
          aria-label="Notifications"
        >
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
        </button>

        {/* Settings Icon Button */}
        <button 
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent hover:border-slate-800 transition-all"
          aria-label="Settings"
        >
          <Settings size={17} />
        </button>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all flex items-center gap-1 text-xs"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut size={17} />
        </button>

        {/* Profile Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 via-cyan-400 to-indigo-600 p-[1px] shadow-sm ml-1 cursor-pointer">
          <div className="w-full h-full rounded-full bg-[#0b0e17] flex items-center justify-center text-indigo-300">
            <User size={15} />
          </div>
        </div>
      </div>
    </header>
  );
}
