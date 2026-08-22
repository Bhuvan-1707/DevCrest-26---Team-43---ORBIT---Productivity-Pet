import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Flame, Sparkles } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { tasksApi } from '../../services/api/tasksApi';

export default function WelcomeHeader() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function loadTasksCount() {
      try {
        const res = await tasksApi.getTasks();
        const tasks = res?.data || res || [];
        if (Array.isArray(tasks)) {
          setTotalCount(tasks.length);
          setCompletedCount(tasks.filter(t => t.status === 'completed').length);
        }
      } catch (err) {
        console.error('[WelcomeHeader] Error loading tasks count:', err);
      }
    }
    loadTasksCount();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';

  return (
    <Card className="orbit-card bg-gradient-to-r from-[#0d1222]/90 via-[#0a0f1d]/80 to-[#10172a]/90 border-indigo-500/20 relative overflow-hidden">
      {/* Background Decorative Ambient Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Welcome Info */}
        <div className="flex flex-col gap-2.5 max-w-2xl">
          <div className="flex items-center gap-3">
            <Badge variant="indigo" icon={Sparkles} pulse>
              ORBIT Intelligence
            </Badge>
            <Badge variant="amber" icon={Flame}>
              3 day streak
            </Badge>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-100 font-heading tracking-tight">
            {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-cyan-300 to-indigo-200">{displayName}</span>
          </h1>

          <p className="text-sm lg:text-base text-slate-300 leading-relaxed font-sans">
            Your focus is trending upward today. You have completed <span className="font-semibold text-cyan-300">{completedCount} of {totalCount}</span> planned tasks in your active rhythm.
          </p>
        </div>

        {/* Right Call To Action */}
        <div className="flex items-center gap-3 self-start md:self-center shrink-0">
          <Button
            variant="primary"
            size="lg"
            icon={Target}
            onClick={() => navigate('/session')}
            className="shadow-lg shadow-indigo-600/25"
          >
            Start Focus Session
          </Button>
        </div>
      </div>
    </Card>
  );
}
