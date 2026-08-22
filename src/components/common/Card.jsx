import React from 'react';
import { motion } from 'framer-motion';

export default function Card({
  children,
  className = '',
  variant = 'primary', // 'primary' | 'secondary' | 'elevated'
  hoverable = false,
  glow = false,
  padding = 'default',
  onClick,
  ...props
}) {
  const paddingMap = {
    none: 'p-0',
    compact: 'p-4',
    default: 'p-5 lg:p-6',
    spacious: 'p-6 lg:p-8',
  };

  const variantMap = {
    primary: 'orbit-card bg-white/65 dark:bg-[#111827]/65 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/70 shadow-md shadow-slate-900/5 text-slate-800 dark:text-slate-100',
    secondary: 'bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/50 text-slate-700 dark:text-slate-200',
    elevated: 'bg-white/85 dark:bg-slate-900/80 backdrop-blur-3xl border border-indigo-300/80 dark:border-indigo-500/40 shadow-xl shadow-indigo-500/15 text-slate-900 dark:text-slate-100',
  };

  const selectedVariant = glow ? variantMap.elevated : (variantMap[variant] || variantMap.primary);

  const baseStyles = `
    relative rounded-2xl transition-all duration-300 ease-out select-none overflow-hidden
    ${selectedVariant}
    ${hoverable || onClick ? 'hover:border-indigo-500/50 dark:hover:border-cyan-400/50 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer' : ''}
    ${paddingMap[padding] || paddingMap.default}
    ${className}
  `;

  if (hoverable || onClick) {
    return (
      <motion.div
        whileHover={{ y: -5, scale: 1.018, transition: { type: 'spring', stiffness: 350, damping: 22 } }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={baseStyles}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div 
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={baseStyles} 
      {...props}
    >
      {children}
    </motion.div>
  );
}
