import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrbitPet({
  state = 'idle', // 'idle' | 'focused' | 'happy' | 'recovering'
  size = 'md',
  onClick,
  interactive = true,
}) {
  const [internalBlink, setInternalBlink] = useState(false);

  // Periodic subtle blink effect
  useEffect(() => {
    const interval = setInterval(() => {
      setInternalBlink(true);
      setTimeout(() => setInternalBlink(false), 200);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const sizeDimensions = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  // State-based visual configurations
  const stateConfigs = {
    idle: {
      gradient: 'from-indigo-500 via-purple-500 to-cyan-400',
      aura: 'rgba(99, 102, 241, 0.25)',
      eyeColor: 'bg-cyan-200',
      pulseDuration: 4,
      floatY: [-4, 4, -4],
      label: 'Idle',
    },
    focused: {
      gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
      aura: 'rgba(56, 189, 248, 0.4)',
      eyeColor: 'bg-white',
      pulseDuration: 2.2,
      floatY: [-2, 2, -2],
      label: 'Focused',
    },
    happy: {
      gradient: 'from-cyan-400 via-emerald-400 to-amber-300',
      aura: 'rgba(52, 211, 153, 0.35)',
      eyeColor: 'bg-white',
      pulseDuration: 3,
      floatY: [-6, 6, -6],
      label: 'Happy',
    },
    recovering: {
      gradient: 'from-purple-400 via-indigo-400 to-rose-300',
      aura: 'rgba(168, 85, 247, 0.25)',
      eyeColor: 'bg-purple-100',
      pulseDuration: 5,
      floatY: [-3, 3, -3],
      label: 'Recovering',
    },
  };

  const config = stateConfigs[state] || stateConfigs.idle;

  return (
    <motion.div
      onClick={onClick}
      whileHover={interactive ? { scale: 1.05 } : undefined}
      whileTap={interactive ? { scale: 0.95 } : undefined}
      className={`relative flex items-center justify-center select-none ${interactive ? 'cursor-pointer' : ''}`}
    >
      {/* Outer Glowing Aura Ring */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          repeat: Infinity,
          duration: config.pulseDuration,
          ease: 'easeInOut',
        }}
        className={`absolute rounded-full blur-xl ${sizeDimensions[size] || sizeDimensions.md}`}
        style={{ background: config.aura }}
      />

      {/* Floating Animated Orb Container */}
      <motion.div
        animate={{ y: config.floatY }}
        transition={{
          repeat: Infinity,
          duration: config.pulseDuration,
          ease: 'easeInOut',
        }}
        className={`relative rounded-full bg-gradient-to-tr ${config.gradient} p-[2px] shadow-xl flex items-center justify-center ${sizeDimensions[size] || sizeDimensions.md}`}
      >
        {/* Inner Glass Core */}
        <div className="w-full h-full rounded-full bg-slate-900/90 dark:bg-[#0b0e17]/85 backdrop-blur-md flex flex-col items-center justify-center relative overflow-hidden">
          {/* Subtle Ambient Core Light */}
          <div className="absolute inset-0 bg-radial from-white/15 via-transparent to-transparent opacity-60 pointer-events-none" />

          {/* Facial Eyes & Expressions Rendering */}
          <div className="relative z-10 flex items-center justify-center gap-3">
            {/* Happy State Eyes ( Arched Curves ^ ^ ) */}
            {state === 'happy' && (
              <div className="flex items-center gap-2 text-cyan-200 font-extrabold text-sm">
                <motion.span animate={{ y: [0, -1, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>^</motion.span>
                <span className="text-xs opacity-75">ᴗ</span>
                <motion.span animate={{ y: [0, -1, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>^</motion.span>
              </div>
            )}

            {/* Recovering State Eyes ( Resting Lines - - ) */}
            {state === 'recovering' && (
              <div className="flex items-center gap-2 text-purple-200 text-xs font-bold">
                <span className="w-2.5 h-[2px] bg-purple-300 rounded-full"></span>
                <span className="text-[10px] opacity-60">ᴗ</span>
                <span className="w-2.5 h-[2px] bg-purple-300 rounded-full"></span>
              </div>
            )}

            {/* Focused State Eyes ( Glowing Concentrated Reticles ) */}
            {state === 'focused' && (
              <div className="flex items-center gap-2">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ repeat: Infinity, duration: 1.8 }}
                  className="w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-md shadow-cyan-400/80 border border-white"
                />
                <div className="w-1 h-1 rounded-full bg-cyan-400/60" />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ repeat: Infinity, duration: 1.8 }}
                  className="w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-md shadow-cyan-400/80 border border-white"
                />
              </div>
            )}

            {/* Idle State Eyes ( Glowing Expressive Eyes with Blink ) */}
            {state === 'idle' && (
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scaleY: internalBlink ? 0.1 : 1 }}
                  transition={{ duration: 0.1 }}
                  className="w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-xs shadow-cyan-300/50"
                />
                <span className="text-[10px] text-cyan-200/70 font-medium -my-1">ᴗ</span>
                <motion.div
                  animate={{ scaleY: internalBlink ? 0.1 : 1 }}
                  transition={{ duration: 0.1 }}
                  className="w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-xs shadow-cyan-300/50"
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
