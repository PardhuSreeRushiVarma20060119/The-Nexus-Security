'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useEffect } from 'react';
import Glassmorphic from './Glassmorphic';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  icon?: React.ReactNode;
  duration?: number;
  onClose: () => void;
  className?: string;
}

export default function Toast({
  message,
  type = 'info',
  icon,
  duration = 5000,
  onClose,
  className = '',
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'text-green-500 dark:text-green-400';
      case 'error':
        return 'text-red-500 dark:text-red-400';
      case 'warning':
        return 'text-yellow-500 dark:text-yellow-400';
      default:
        return 'text-blue-500 dark:text-blue-400';
    }
  };

  const getIcon = () => {
    if (icon) return icon;
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Glassmorphic className={`flex items-center gap-3 px-4 py-3 ${className}`}>
          <div className={getTypeStyles()}>
            {getIcon()}
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {message}
          </p>
          <button
            onClick={onClose}
            className="ml-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </Glassmorphic>
      </motion.div>
    </AnimatePresence>
  );
} 