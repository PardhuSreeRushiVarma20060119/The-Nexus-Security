'use client';

import { motion } from 'framer-motion';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export default function Spinner({
  size = 'md',
  color = 'primary',
  className = '',
}: SpinnerProps) {
  const getSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-6 h-6';
      case 'lg':
        return 'w-8 h-8';
    }
  };

  const getColor = () => {
    switch (color) {
      case 'primary':
        return 'border-primary border-t-transparent';
      case 'secondary':
        return 'border-secondary border-t-transparent';
      case 'white':
        return 'border-white border-t-transparent';
      default:
        return `border-${color} border-t-transparent`;
    }
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`
        rounded-full border-2
        ${getSize()}
        ${getColor()}
        ${className}
      `}
    />
  );
} 