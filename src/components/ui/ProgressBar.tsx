 'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: 'primary' | 'success' | 'error' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  color = 'primary',
  size = 'md',
  showLabel = true,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(100, (value / max) * 100);

  const getColorStyles = () => {
    switch (color) {
      case 'primary':
        return 'bg-primary';
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'h-1.5';
      case 'md':
        return 'h-2';
      case 'lg':
        return 'h-3';
    }
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between">
        {showLabel && (
          <span className="text-sm text-gray-600">
            {value} / {max}
          </span>
        )}
        {showLabel && (
          <span className="text-sm text-gray-600">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`
            ${getColorStyles()}
            ${getSizeStyles()}
            rounded-full
          `}
        />
      </div>
    </div>
  );
}