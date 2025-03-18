'use client';

import { motion } from 'framer-motion';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageContainer({
  children,
  className = '',
}: PageContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        min-h-screen
        bg-gradient-to-br from-gray-50 to-gray-100
        dark:from-gray-900 dark:to-gray-800
        ${className}
      `}
    >
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </motion.div>
  );
}