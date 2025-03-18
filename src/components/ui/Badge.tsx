'use client';

import { motion } from 'framer-motion';
import Glassmorphic from './Glassmorphic';

interface BadgeProps {
  label: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  className?: string;
}

export default function Badge({
  label,
  type = 'info',
  className = '',
}: BadgeProps) {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'text-green-500 dark:text-green-400 bg-green-500/10 dark:bg-green-400/10';
      case 'error':
        return 'text-red-500 dark:text-red-400 bg-red-500/10 dark:bg-red-400/10';
      case 'warning':
        return 'text-yellow-500 dark:text-yellow-400 bg-yellow-500/10 dark:bg-yellow-400/10';
      default:
        return 'text-blue-500 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-400/10';
    }
  };

  return (
    <Glassmorphic
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${getTypeStyles()}
        ${className}
      `}
      blur="sm"
      border={false}
      shadow={false}
    >
      {label}
    </Glassmorphic>
  );
} 