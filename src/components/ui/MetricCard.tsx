'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import Glassmorphic from './Glassmorphic';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon?: LucideIcon;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export default function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  description,
  trend = 'neutral',
}: MetricCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Glassmorphic className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </h3>
        {Icon && <Icon className="w-5 h-5 text-gray-400" />}
      </div>
      <div className="flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
          {value}
        </p>
        {change && (
          <p className={`ml-2 text-sm font-medium ${getTrendColor()}`}>
            {change}
          </p>
        )}
      </div>
      {description && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
    </Glassmorphic>
  );
}