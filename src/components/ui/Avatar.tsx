'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { LucideIcon } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: LucideIcon;
  className?: string;
}

export default function Avatar({
  src,
  alt = '',
  size = 'md',
  icon: Icon,
  className = '',
}: AvatarProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8';
      case 'md':
        return 'w-10 h-10';
      case 'lg':
        return 'w-12 h-12';
      case 'xl':
        return 'w-16 h-16';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-5 h-5';
      case 'lg':
        return 'w-6 h-6';
      case 'xl':
        return 'w-8 h-8';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        relative rounded-full overflow-hidden
        bg-gray-100 flex items-center justify-center
        ${getSizeStyles()}
        ${className}
      `}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
        />
      ) : Icon ? (
        <Icon className={`text-gray-500 ${getIconSize()}`} />
      ) : (
        <svg
          className={`text-gray-400 ${getIconSize()}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      )}
    </motion.div>
  );
} 