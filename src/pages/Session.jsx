import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, ArrowLeft, CheckCircle2, Sparkles, Clock } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import OrbitPet from '../components/pet/OrbitPet';
import { tasksApi } from '../services/api/tasksApi';
import { OBSERVATION_TYPES } from '../data/observationData';
import { observationService } from '../services/observationService';
import { sessionsApi } from '../services/api/sessionsApi';
import { useSession } from '../hooks/useSession';

const ACTIVE_SESSION_STORAGE_KEY = 'orbit_active_focus_session';
const DURATION_PRESETS = [15, 25, 45, 60, 90];

export default function Session() {
  const navigate = useNavigate();
  const { finishSession } = useSession();

  // Session duration configuration state (defaults to 45 minutes)
  const [plannedDurationMinutes, setPlannedDurationMinutes] = useState(45);
  const [presetMode, setPresetMode] = useState('45'); // '15' | '25' | '45' | '60' | '90' | 'custom'
  const [customMinutesInput, setCustomMinutesInput] = useState('');
  const [validationError, setValidationError] = useState('');

  // Countdown timer & session state
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [status, setStatus] = useState('idle'); // 'idle' | 'running' | 'paused' | 'completed'
  const [completedDuration, setCompletedDuration] = useState(0);
  const [activeTask, setActiveTask] = useState({ title: 'Deep Work Focus Block', difficulty: 'high' });

  // Persistent Session ID for telemetry tracking across lifecycle
  const sessionIdRef = useRef(`sess_${Date.now()}`);
  const backendSessionIdRef = useRef(null);

  // Restore active session state (if leaving and returning to page) on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.status === 'running' || parsed.status === 'paused')) {
          const targetMins = Number(parsed.plannedDurationMinutes) || 45;
          let remainingSecs = Number(parsed.timeLeft);

          if (parsed.status === 'running' && parsed.lastUpdated) {
            const elapsedSinceSave = Math.floor((Date.now() - parsed.lastUpdated) / 1000);
            remainingSecs = Math.max(0, remainingSecs - elapsedSinceSave);
          }

          setPlannedDurationMinutes(targetMins);
          setTimeLeft(remainingSecs);
          setStatus(remainingSecs <= 0 ? 'completed' : parsed.status);
          if (parsed.activeTask) setActiveTask(parsed.activeTask);
          if (parsed.backendSessionId) backendSessionIdRef.current = parsed.backendSessionId;
          if (parsed.presetMode) setPresetMode(parsed.presetMode);
          if (parsed.customMinutesInput) setCustomMinutesInput(parsed.customMinutesInput);
          return;
        }
      }
    } catch (err) {
      console.warn('[Session] Failed to restore active session state:', err);
    }
  }, []);

  // Sync active session state to localStorage while running or paused
  useEffect(() => {
    if (status === 'running' || status === 'paused') {
      localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify({
        status,
        timeLeft,
        plannedDurationMinutes,
        backendSessionId: backendSessionIdRef.current,
        activeTask,
        presetMode,
        customMinutesInput,
        lastUpdated: Date.now(),
      }));
    } else if (status === 'completed' || status === 'idle') {
      localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
    }
  }, [status, timeLeft, plannedDurationMinutes, activeTask, presetMode, customMinutesInput]);

  // Load first active task from tasksApi if available
  useEffect(() => {
    async function loadTask() {
      try {
        const res = await tasksApi.getTasks();
        const pending = (res?.data || res || []).find(t => !t.completed);
        if (pending) {
          setActiveTask({
            title: pending.title,
            difficulty: pending.difficulty || 'medium',
          });
        }
      } catch (err) {
        console.warn('[Session] Failed to fetch active task from API:', err);
      }
    }
    loadTask();
  }, []);

  // Timer interval effect
  useEffect(() => {
    let timer = null;
    if (status === 'running' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleComplete(plannedDurationMinutes);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [status, timeLeft, plannedDurationMinutes]);

  // Format seconds into MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Duration preset / custom selection handlers
  const handlePresetSelect = (mode, minutesVal) => {
    if (status !== 'idle') return; // Cannot change duration mid-session
    setPresetMode(mode);
    setValidationError('');

    if (mode !== 'custom') {
      const mins = Number(minutesVal);
      setPlannedDurationMinutes(mins);
      setTimeLeft(mins * 60);
    } else {
      const parsed = parseInt(customMinutesInput, 10);
      if (!isNaN(parsed) && parsed > 0 && parsed <= 720) {
        setPlannedDurationMinutes(parsed);
        setTimeLeft(parsed * 60);
      } else if (customMinutesInput === '') {
        setValidationError('Enter custom duration');
      } else {
        setValidationError('Duration must be 1 - 720 min');
      }
    }
  };

  const handleCustomInputChange = (e) => {
    const val = e.target.value;
    setCustomMinutesInput(val);
    setPresetMode('custom');

    const parsed = parseInt(val, 10);
    if (val === '') {
      setValidationError('Enter custom duration in minutes');
    } else if (isNaN(parsed) || parsed <= 0) {
      setValidationError('Duration must be greater than 0');
    } else if (parsed > 720) {
      setValidationError('Maximum duration is 720 minutes');
    } else {
      setValidationError('');
      setPlannedDurationMinutes(parsed);
      setTimeLeft(parsed * 60);
    }
  };

  // Progress percentage calculation
  const totalDurationSeconds = plannedDurationMinutes * 60;
  const elapsedSeconds = Math.max(0, totalDurationSeconds - timeLeft);
  const progressPercent = totalDurationSeconds > 0 ? Math.min(Math.round((elapsedSeconds / totalDurationSeconds) * 100), 100) : 0;

  const handleStart = async () => {
    if (validationError && presetMode === 'custom') return;

    let targetMins = plannedDurationMinutes;
    if (presetMode === 'custom') {
      const parsed = parseInt(customMinutesInput, 10);
      if (isNaN(parsed) || parsed <= 0 || parsed > 720) {
        setValidationError('Please specify a valid duration between 1 and 720 minutes');
        return;
      }
      targetMins = parsed;
      setPlannedDurationMinutes(targetMins);
      setTimeLeft(targetMins * 60);
    }

    setStatus('running');

    // 1. Persist Focus Session via sessionsApi
    try {
      const res = await sessionsApi.createSession({
        taskTitle: activeTask.title,
        plannedDurationMinutes: targetMins,
        actualDurationMinutes: 0,
        status: 'running',
      });
      if (res?.data?.id) {
        backendSessionIdRef.current = res.data.id;
      }
    } catch (err) {
      console.warn('[Session] Backend session start error:', err.message);
    }
    
    // 2. Record SESSION_STARTED Observation Telemetry via observationService
    observationService.recordObservation({
      type: OBSERVATION_TYPES.SESSION_STARTED,
      activity: {
        name: activeTask.title,
        category: 'Practice',
        duration: 0,
      },
      context: {
        page: '/session',
        taskId: activeTask?.id || null,
        sessionId: backendSessionIdRef.current || sessionIdRef.current,
        sessionStatus: 'running',
      },
      metadata: {
        plannedDurationMinutes: targetMins,
        targetDifficulty: activeTask.difficulty,
      },
    });
  };

  const handlePause = async () => {
    setStatus('paused');

    const minutesSpent = Math.max(1, Math.round(elapsedSeconds / 60));

    if (backendSessionIdRef.current) {
      try {
        await sessionsApi.updateSession(backendSessionIdRef.current, {
          status: 'paused',
          actualDurationMinutes: minutesSpent,
        });
      } catch (err) {
        console.warn('[Session] Backend session pause error:', err.message);
      }
    }

    observationService.recordObservation({
      type: OBSERVATION_TYPES.SESSION_PAUSED,
      activity: {
        name: activeTask.title,
        category: 'Practice',
        duration: minutesSpent,
      },
      context: {
        page: '/session',
        taskId: activeTask?.id || null,
        sessionId: backendSessionIdRef.current || sessionIdRef.current,
        sessionStatus: 'paused',
      },
      metadata: {
        elapsedDurationSeconds: elapsedSeconds,
        remainingSeconds: timeLeft,
        plannedDurationMinutes,
      },
    });
  };

  const handleResume = async () => {
    setStatus('running');

    const minutesSpent = Math.max(1, Math.round(elapsedSeconds / 60));

    if (backendSessionIdRef.current) {
      try {
        await sessionsApi.updateSession(backendSessionIdRef.current, {
          status: 'running',
        });
      } catch (err) {
        console.warn('[Session] Backend session resume error:', err.message);
      }
    }

    observationService.recordObservation({
      type: OBSERVATION_TYPES.SESSION_RESUMED,
      activity: {
        name: activeTask.title,
        category: 'Practice',
        duration: minutesSpent,
      },
      context: {
        page: '/session',
        taskId: activeTask?.id || null,
        sessionId: backendSessionIdRef.current || sessionIdRef.current,
        sessionStatus: 'running',
      },
      metadata: {
        elapsedDurationSeconds: elapsedSeconds,
        remainingSeconds: timeLeft,
        plannedDurationMinutes,
      },
    });
  };

  const handleComplete = async (mins) => {
    const minutesSpent = mins || Math.max(1, Math.round(elapsedSeconds / 60));
    setCompletedDuration(minutesSpent);
    setStatus('completed');

    if (backendSessionIdRef.current) {
      try {
        await sessionsApi.updateSession(backendSessionIdRef.current, {
          status: 'completed',
          actualDurationMinutes: minutesSpent,
          focusScore: 85,
        });
      } catch (err) {
        console.warn('[Session] Backend session complete error:', err.message);
      }
    }
    
    observationService.recordObservation({
      type: OBSERVATION_TYPES.SESSION_COMPLETED,
      activity: {
        name: activeTask.title,
        category: 'Practice',
        duration: minutesSpent,
      },
      context: {
        page: '/session',
        taskId: activeTask?.id || null,
        sessionId: backendSessionIdRef.current || sessionIdRef.current,
        sessionStatus: 'completed',
      },
      metadata: {
        plannedDurationMinutes,
        actualDurationMinutes: minutesSpent,
        focusScoreRating: 85,
        completionStatus: 'successful',
      },
    });

    finishSession({
      duration: minutesSpent,
      plannedDurationMinutes,
      focusScore: 85,
      taskTitle: activeTask.title
    });
  };

  const handleEnd = () => {
    const minutesSpent = Math.max(1, Math.round(elapsedSeconds / 60));
    handleComplete(minutesSpent);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full select-none">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
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
              {/* Background Glow Effect */}
              <div className={`absolute inset-0 bg-radial transition-all duration-500 pointer-events-none ${
                status === 'running' ? 'from-indigo-500/10 via-sky-500/5 to-transparent' : 'from-indigo-500/5 via-transparent to-transparent'
              }`} />

              {/* Selected Task Details Header */}
              <div className="flex flex-col items-center gap-2 mb-4 relative z-10">
                <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-cyan-400 font-heading">
                  ACTIVE TASK TARGET
                </span>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-heading tracking-tight">
                  {activeTask.title}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="indigo" size="sm">Difficulty: {activeTask.difficulty}</Badge>
                  <Badge variant="cyan" size="sm">Target: {plannedDurationMinutes} min</Badge>
                </div>
              </div>

              {/* Duration Selector UI (Available only in Idle state) */}
              {status === 'idle' && (
                <div className="w-full max-w-md my-4 p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 relative z-10 flex flex-col items-center gap-3 backdrop-blur-md shadow-sm">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 font-heading">
                    <Clock size={14} className="text-indigo-600 dark:text-cyan-400" />
                    <span>Select Focus Duration</span>
                  </div>

                  {/* Preset Pills */}
                  <div className="grid grid-cols-6 gap-1.5 w-full">
                    {DURATION_PRESETS.map((mins) => {
                      const isSelected = presetMode === String(mins);
                      return (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => handlePresetSelect(String(mins), mins)}
                          className={`py-2 px-1 rounded-xl text-xs font-bold font-heading transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-md shadow-indigo-500/20 scale-105'
                              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {mins}m
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => handlePresetSelect('custom', customMinutesInput || '30')}
                      className={`py-2 px-1 rounded-xl text-xs font-bold font-heading transition-all ${
                        presetMode === 'custom'
                          ? 'bg-indigo-600 text-white dark:bg-cyan-500 dark:text-slate-950 shadow-md shadow-indigo-500/20 scale-105'
                          : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Custom
                    </button>
                  </div>

                  {/* Custom Duration Input */}
                  {presetMode === 'custom' && (
                    <div className="flex flex-col items-center gap-1.5 w-full mt-1">
                      <div className="flex items-center gap-2 max-w-[220px] w-full">
                        <input
                          type="number"
                          min="1"
                          max="720"
                          value={customMinutesInput}
                          onChange={handleCustomInputChange}
                          placeholder="Minutes"
                          className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-center text-sm font-bold font-heading focus:outline-none focus:border-indigo-500 dark:focus:border-cyan-500 transition-colors"
                        />
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">min</span>
                      </div>
                      {validationError && (
                        <span className="text-[11px] font-medium text-rose-500 dark:text-rose-400">
                          {validationError}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ORBIT Pet Companion Layer */}
              <div className="my-3 relative z-10">
                <OrbitPet 
                  state={status === 'running' ? 'focused' : status === 'paused' ? 'recovering' : 'idle'} 
                  size="lg" 
                  interactive={false}
                />
              </div>

              {/* Countdown Display - Primary Focus */}
              <div className="my-4 flex flex-col items-center relative z-10">
                <motion.div 
                  key={formatTime(timeLeft)}
                  initial={{ scale: 0.98 }}
                  animate={{ scale: 1 }}
                  className="text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-slate-100 font-heading tracking-tighter"
                >
                  {formatTime(timeLeft)}
                </motion.div>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
                  {status === 'running' 
                    ? `Deep focus window (${plannedDurationMinutes} min target) in progress...` 
                    : status === 'paused' 
                    ? 'Timer paused' 
                    : 'Select duration and click start to begin session'}
                </span>
              </div>

              {/* Session Progress Bar */}
              <div className="w-full max-w-md my-3 relative z-10">
                <ProgressBar
                  value={progressPercent}
                  variant={status === 'running' ? 'cyan' : 'indigo'}
                  height="md"
                  showLabel
                  label="Session Telemetry Progress"
                />
              </div>

              {/* Session Action Controls */}
              <div className="flex items-center gap-4 mt-4 relative z-10">
                {status === 'idle' && (
                  <Button
                    variant="primary"
                    size="lg"
                    icon={Play}
                    onClick={handleStart}
                    disabled={Boolean(validationError && presetMode === 'custom')}
                    className="px-8 py-3 text-base shadow-lg shadow-indigo-500/20"
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
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 size={36} />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-amber-500 dark:text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-heading">
                  EVIDENCE RECORDED & SAVED
                </span>
              </div>
              
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-heading tracking-tight mb-2">
                SESSION COMPLETE
              </h1>

              <div className="my-6 grid grid-cols-2 gap-4 w-full max-w-sm p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400">Target / Completed</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100 font-heading">{plannedDurationMinutes}m / {completedDuration}m</span>
                </div>
                <div className="flex flex-col items-center border-l border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400">Focus Score</span>
                  <span className="text-xl font-bold text-indigo-600 dark:text-cyan-300 font-heading">85 / 100</span>
                </div>
              </div>

              {/* Celebrating Pet */}
              <div className="my-2 max-w-md">
                <OrbitPet state="happy" size="md" interactive={false} />
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md my-4 leading-relaxed font-sans">
                Nice work! ORBIT recorded this {completedDuration}-minute session into database memory as evidence for future protocol adaptation.
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
