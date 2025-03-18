'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import Glassmorphic from './Glassmorphic';

interface SectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export default function Section({
  title,
  description,
  icon: Icon,
  children,
  className = '',
}: SectionProps) {
  return (
    <Glassmorphic className={`p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        {Icon && <Icon className="w-6 h-6 text-gray-400" />}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {description}
        </p>
      )}
      {children}
    </Glassmorphic>
  );
} 