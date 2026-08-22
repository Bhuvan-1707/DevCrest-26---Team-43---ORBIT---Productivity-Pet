import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Target, 
  CheckSquare, 
  Compass, 
  Brain, 
  Sparkles, 
  Zap, 
  Activity,
  Radio,
  Menu,
  X
} from 'lucide-react';

const navigationItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Focus', path: '/session', icon: Target },
  { name: 'Observations', path: '/observations', icon: Radio },
  { name: 'Memory', path: '/memory', icon: Brain },
  { name: 'Insights', path: '/insights', icon: Sparkles },
  { name: 'Tasks', path: '/tasks', icon: CheckSquare, badge: 'Soon' },
  { name: 'Goals', path: '/goals', icon: Compass, badge: 'Soon' },
  { name: 'Experiments', path: '/experiments', icon: Zap, badge: 'Soon' },
  { name: 'Recovery', path: '/recovery', icon: Activity, badge: 'Soon' },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = () => setMobileOpen(!mobileOpen);

  return (
    <>
      {/* Mobile Toggle Floating Button */}
      <button 
        onClick={toggleMobile}
        className="lg:hidden fixed top-3.5 left-4 z-50 p-2.5 rounded-xl bg-[#0e121d]/90 border border-slate-800 text-slate-300 hover:text-white backdrop-blur-md shadow-xl transition-all"
        aria-label="Toggle Navigation"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile Overlay Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* Sidebar Navigation Panel */}
      <aside className={`
        fixed lg:static top-0 left-0 z-40 h-screen w-64 bg-[#0a0c13]/95 border-r border-slate-800/40 
        flex flex-col justify-between backdrop-blur-xl transition-transform duration-300 ease-out select-none
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-5 flex flex-col gap-6">
          {/* Logo & Brand Header */}
          <div className="flex items-center gap-3 px-1 py-1">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900 border border-indigo-500/30 shadow-md shadow-indigo-500/10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-cyan-500/20 to-transparent" />
              <div className="w-3.5 h-3.5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-widest text-slate-100 font-heading">
                ORBIT
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold -mt-0.5">
                INTELLIGENCE
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-1 mt-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `
                    group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200
                    ${isActive 
                      ? 'bg-indigo-500/10 text-cyan-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/5' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'}
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon size={17} className={`transition-colors duration-200 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                        <span className="tracking-wide">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-800">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer System Learning Pill */}
        <div className="p-3.5 m-4 rounded-xl bg-slate-900/40 border border-slate-800/50 flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium tracking-tight">
            Observation Engine Active
          </span>
        </div>
      </aside>
    </>
  );
}
