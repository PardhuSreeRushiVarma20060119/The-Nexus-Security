'use client';

import { motion } from 'framer-motion';

interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
  className?: string;
}

export default function Grid({
  children,
  cols = 3,
  gap = 4,
  className = '',
}: GridProps) {
  const getColsClass = () => {
    switch (cols) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      case 5:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5';
      case 6:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6';
      case 12:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6';
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  const getGapClass = () => {
    switch (gap) {
      case 0:
        return 'gap-0';
      case 1:
        return 'gap-1';
      case 2:
        return 'gap-2';
      case 3:
        return 'gap-3';
      case 4:
        return 'gap-4';
      case 5:
        return 'gap-5';
      case 6:
        return 'gap-6';
      case 8:
        return 'gap-8';
      case 10:
        return 'gap-10';
      case 12:
        return 'gap-12';
      default:
        return 'gap-4';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`
        grid
        ${getColsClass()}
        ${getGapClass()}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
} 