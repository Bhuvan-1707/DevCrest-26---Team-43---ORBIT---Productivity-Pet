import React from 'react';
import { motion } from 'framer-motion';

export default function Card({
  children,
  className = '',
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

  const baseStyles = `
    relative rounded-2xl orbit-card transition-all duration-200 select-none overflow-hidden
    ${glow ? 'shadow-lg shadow-indigo-500/10 border-indigo-500/30' : ''}
    ${hoverable ? 'orbit-card-hover cursor-pointer' : ''}
    ${paddingMap[padding] || paddingMap.default}
    ${className}
  `;

  if (hoverable || onClick) {
    return (
      <motion.div
        whileHover={hoverable ? { y: -2, transition: { duration: 0.2 } } : undefined}
        whileTap={onClick ? { scale: 0.99 } : undefined}
        onClick={onClick}
        className={baseStyles}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseStyles} {...props}>
      {children}
    </div>
  );
}
