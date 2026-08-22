import React from 'react';
import { motion } from 'framer-motion';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  className = '',
  type = 'button',
  ...props
}) {
  const sizeMap = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5 font-medium',
    md: 'px-4 py-2 text-xs font-semibold rounded-xl gap-2',
    lg: 'px-5 py-2.5 text-sm font-semibold rounded-xl gap-2.5',
  };

  const variantMap = {
    primary: 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-600/20 border border-indigo-400/20 hover:from-indigo-500 hover:to-cyan-500 hover:shadow-cyan-500/25',
    secondary: 'bg-slate-900/80 border border-slate-800 text-slate-200 hover:bg-slate-800/80 hover:border-slate-700 hover:text-white shadow-xs',
    outline: 'bg-transparent border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-400',
    ghost: 'bg-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent',
    accent: 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50',
    danger: 'bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 hover:border-rose-400/50',
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.02 } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center font-heading transition-all duration-200 select-none outline-hidden cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${sizeMap[size] || sizeMap.md}
        ${variantMap[variant] || variantMap.primary}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={iconSizes[size]} />}
          {children && <span>{children}</span>}
          {Icon && iconPosition === 'right' && <Icon size={iconSizes[size]} />}
        </>
      )}
    </motion.button>
  );
}
