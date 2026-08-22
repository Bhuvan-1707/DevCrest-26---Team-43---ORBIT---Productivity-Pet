import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, ArrowLeft, CheckCircle2, Target, Sparkles } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import OrbitPet from '../components/pet/OrbitPet';
import { mockFocus } from '../data/mockData';
import { useSession } from '../hooks/useSession';

export default function Session() {
  const navigate = useNavigate();
  const { finishSession } = useSession();

  const INITIAL_SECONDS = 45 * 60; // 45 minutes = 2700 seconds
  const [timeLeft, setTimeLeft] = useState(INITIAL_SECONDS);
  const [status, setStatus] = useState('idle'); // 'idle' | 'running' | 'paused' | 'completed'
  const [completedDuration, setCompletedDuration] = useState(0);

  // Timer interval effect
  useEffect(() => {
    let timer = null;
    if (status === 'running' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleComplete(45);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [status, timeLeft]);

  // Format seconds into MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress percentage
  const elapsedSeconds = INITIAL_SECONDS - timeLeft;
  const progressPercent = Math.min(Math.round((elapsedSeconds / INITIAL_SECONDS) * 100), 100);

  const handleStart = () => setStatus('running');
  const handlePause = () => setStatus('paused');
  const handleResume = () => setStatus('running');

  const handleComplete = (mins) => {
    const minutesSpent = mins || Math.max(1, Math.round(elapsedSeconds / 60));
    setCompletedDuration(minutesSpent);
    setStatus('completed');
    
    // Save session to localStorage & update state via API/hook
    finishSession({
      duration: minutesSpent,
      focusScore: 85,
      taskTitle: mockFocus.activeFocusItem.title
    });
  };

  const handleEnd = () => {
    handleComplete(Math.max(1, Math.round(elapsedSeconds / 60)) || 43);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full select-none">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        <Badge 
          variant={status === 'running' ? 'cyan' : status === 'paused' ? 'amber' : status === 'completed' ? 'emerald' : 'indigo'} 
          pulse={status === 'running'}
        >
          {status === 'running' ? 'Focus Active' : status === 'paused' ? 'Session Paused' : status === 'completed' ? 'Session Completed' : 'Ready'}
        </Badge>
      </div>

      {/* Main Focus Experience Container */}
      <AnimatePresence mode="wait">
        {status !== 'completed' ? (
          <motion.div
            key="active-session"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="orbit-card p-8 lg:p-12 flex flex-col items-center justify-center text-center relative overflow-hidden">
              {/* Background Glow */}
              <div className={`absolute inset-0 bg-radial transition-all duration-500 pointer-events-none ${
                status === 'running' ? 'from-cyan-500/10 via-indigo-500/5 to-transparent' : 'from-indigo-500/5 via-transparent to-transparent'
              }`} />

              {/* Selected Task Details Header */}
              <div className="flex flex-col items-center gap-2 mb-6 relative z-10">
                <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 font-heading">
                  ACTIVE TASK TARGET
                </span>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-100 font-heading tracking-tight">
                  {mockFocus.activeFocusItem.title}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="indigo" size="sm">Difficulty: {mockFocus.activeFocusItem.difficulty}</Badge>
                  <Badge variant="default" size="sm">Target: 45 min</Badge>
                </div>
              </div>

              {/* ORBIT Pet Companion Layer */}
              <div className="my-4 relative z-10">
                <OrbitPet 
                  state={status === 'running' ? 'focused' : status === 'paused' ? 'recovering' : 'idle'} 
                  size="lg" 
                  interactive={false}
                />
              </div>

              {/* 45-Minute Countdown Display */}
              <div className="my-6 flex flex-col items-center relative z-10">
                <motion.div 
                  key={formatTime(timeLeft)}
                  initial={{ scale: 0.98 }}
                  animate={{ scale: 1 }}
                  className="text-6xl lg:text-7xl font-extrabold text-slate-100 font-heading tracking-tighter"
                >
                  {formatTime(timeLeft)}
                </motion.div>
                <span className="text-xs text-slate-400 mt-2 font-medium">
                  {status === 'running' ? 'Deep focus window in progress...' : status === 'paused' ? 'Timer paused' : 'Click start to begin session'}
                </span>
              </div>

              {/* Session Progress Bar */}
              <div className="w-full max-w-md my-4 relative z-10">
                <ProgressBar
                  value={progressPercent}
                  variant={status === 'running' ? 'cyan' : 'indigo'}
                  height="md"
                  showLabel
                  label="Session Telemetry Progress"
                />
              </div>

              {/* Session Action Controls */}
              <div className="flex items-center gap-4 mt-6 relative z-10">
                {status === 'idle' && (
                  <Button
                    variant="primary"
                    size="lg"
                    icon={Play}
                    onClick={handleStart}
                    className="px-8 py-3 text-base shadow-xl shadow-cyan-500/20"
                  >
                    Start Focus Session
                  </Button>
                )}

                {status === 'running' && (
                  <>
                    <Button
                      variant="secondary"
                      size="lg"
                      icon={Pause}
                      onClick={handlePause}
                      className="px-6"
                    >
                      Pause
                    </Button>
                    <Button
                      variant="danger"
                      size="lg"
                      icon={Square}
                      onClick={handleEnd}
                      className="px-6"
                    >
                      End Session
                    </Button>
                  </>
                )}

                {status === 'paused' && (
                  <>
                    <Button
                      variant="primary"
                      size="lg"
                      icon={Play}
                      onClick={handleResume}
                      className="px-6"
                    >
                      Resume
                    </Button>
                    <Button
                      variant="danger"
                      size="lg"
                      icon={Square}
                      onClick={handleEnd}
                      className="px-6"
                    >
                      End Session
                    </Button>
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        ) : (
          /* Post Session Completion Summary View */
          <motion.div
            key="completed-session"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card glow className="orbit-card p-8 lg:p-12 flex flex-col items-center justify-center text-center relative overflow-hidden border-emerald-500/30">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 size={36} />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-heading">
                  EVIDENCE RECORDED & SAVED
                </span>
              </div>
              
              <h1 className="text-3xl font-extrabold text-slate-100 font-heading tracking-tight mb-2">
                SESSION COMPLETE
              </h1>

              <div className="my-6 grid grid-cols-2 gap-4 w-full max-w-sm p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Duration</span>
                  <span className="text-xl font-bold text-slate-100 font-heading">{completedDuration} min</span>
                </div>
                <div className="flex flex-col items-center border-l border-slate-800">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Focus Score</span>
                  <span className="text-xl font-bold text-cyan-300 font-heading">85 / 100</span>
                </div>
              </div>

              {/* Celebrating Pet */}
              <div className="my-2 max-w-md">
                <OrbitPet state="happy" size="md" interactive={false} />
              </div>

              <p className="text-sm text-slate-300 max-w-md my-4 leading-relaxed font-sans">
                Nice work! ORBIT recorded this session into local memory as evidence for future protocol adaptation.
              </p>

              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/dashboard')}
                className="mt-2 px-8"
              >
                Back to Dashboard
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
