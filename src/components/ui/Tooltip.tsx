'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import Glassmorphic from './Glassmorphic';

interface TooltipProps {
  content: string;
  icon?: LucideIcon;
  position?: 'top' | 'right' | 'bottom' | 'left';
  children: React.ReactNode;
  className?: string;
}

export default function Tooltip({
  content,
  icon: Icon,
  position = 'top',
  children,
  className = '',
}: TooltipProps) {
  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  const getArrowStyles = () => {
    switch (position) {
      case 'top':
        return 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-t-transparent border-x-transparent border-b-gray-800/20';
      case 'right':
        return 'left-0 top-1/2 -translate-y-1/2 -translate-x-full border-r-transparent border-y-transparent border-l-gray-800/20';
      case 'bottom':
        return 'top-0 left-1/2 -translate-x-1/2 -translate-y-full border-b-transparent border-x-transparent border-t-gray-800/20';
      case 'left':
        return 'right-0 top-1/2 -translate-y-1/2 translate-x-full border-l-transparent border-y-transparent border-r-gray-800/20';
      default:
        return 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-t-transparent border-x-transparent border-b-gray-800/20';
    }
  };

  return (
    <div className="relative inline-block group">
      {children}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.1 }}
          className={`
            absolute z-50
            ${getPositionStyles()}
            ${className}
          `}
        >
          <Glassmorphic
            className="relative px-3 py-2 text-sm"
            blur="sm"
            border={false}
            shadow={false}
          >
            <div className="flex items-center gap-2">
              {Icon && <Icon className="w-4 h-4 text-gray-400" />}
              <span className="text-gray-900 dark:text-white">{content}</span>
            </div>
            <div
              className={`
                absolute w-0 h-0 border-4
                ${getArrowStyles()}
              `}
            />
          </Glassmorphic>
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 