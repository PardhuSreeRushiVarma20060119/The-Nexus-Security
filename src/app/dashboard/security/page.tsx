'use client';

import SecurityTimeline from '@/components/security/SecurityTimeline';
import NetworkScanner from '@/components/network/NetworkScanner';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function SecurityDashboard() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div 
        variants={itemVariants}
        className="flex items-center space-x-4 mb-12"
      >
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-white/5 shadow-xl">
          <Shield className="h-7 w-7 text-blue-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Security Dashboard</h1>
          <p className="text-gray-400 mt-1">Monitor and manage your system security</p>
        </div>
      </motion.div>
      
      {/* Security Timeline Section */}
      <motion.section
        variants={itemVariants}
        className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <SecurityTimeline />
        </div>
      </motion.section>

      {/* Network Scanner Section */}
      <motion.section
        variants={itemVariants}
        className="rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl overflow-hidden"
      >
        <div className="p-8">
          <NetworkScanner />
        </div>
      </motion.section>
    </motion.div>
  );
} 