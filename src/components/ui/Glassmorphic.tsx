'use client';

import { motion } from 'framer-motion';

interface GlassmorphicProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  blur?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  border?: boolean;
  shadow?: boolean;
}

export default function Glassmorphic({
  children,
  className = '',
  hover = true,
  blur = 'md',
  border = true,
  shadow = true,
}: GlassmorphicProps) {
  const getBlurClass = () => {
    switch (blur) {
      case 'sm':
        return 'backdrop-blur-sm';
      case 'md':
        return 'backdrop-blur-md';
      case 'lg':
        return 'backdrop-blur-lg';
      case 'xl':
        return 'backdrop-blur-xl';
      case '2xl':
        return 'backdrop-blur-2xl';
      default:
        return 'backdrop-blur-md';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        relative
        bg-white/10
        dark:bg-gray-900/10
        ${getBlurClass()}
        ${border ? 'border border-white/20 dark:border-gray-800/20' : ''}
        ${shadow ? 'shadow-lg shadow-black/5 dark:shadow-black/20' : ''}
        ${hover ? 'hover:bg-white/20 dark:hover:bg-gray-900/20 transition-colors duration-200' : ''}
        rounded-xl
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
} 