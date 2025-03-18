'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import Glassmorphic from './Glassmorphic';

interface CardProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export default function Card({
  title,
  description,
  icon: Icon,
  children,
  className = '',
  onClick,
  interactive = false,
}: CardProps) {
  return (
    <Glassmorphic
      className={`
        p-6
        ${interactive ? 'cursor-pointer' : ''}
        ${className}
      `}
      hover={interactive}
      {...(onClick ? { onClick } : {})}
    >
      {(title || Icon) && (
        <div className="flex items-center gap-3 mb-4">
          {Icon && <Icon className="w-5 h-5 text-gray-400" />}
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
        </div>
      )}
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {description}
        </p>
      )}
      {children}
    </Glassmorphic>
  );
} 