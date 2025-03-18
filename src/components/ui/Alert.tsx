'use client';

import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';
import Glassmorphic from './Glassmorphic';

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  icon?: React.ReactNode;
  className?: string;
}

export default function Alert({
  type = 'info',
  title,
  message,
  icon,
  className = '',
}: AlertProps) {
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
    <Glassmorphic className={`p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${getTypeStyles()}`}>
          {getIcon()}
        </div>
        <div>
          {title && (
            <h3 className={`text-sm font-medium ${getTypeStyles()}`}>
              {title}
            </h3>
          )}
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {message}
          </p>
        </div>
      </div>
    </Glassmorphic>
  );
} 