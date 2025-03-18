'use client';

import { Shield, LayoutDashboard } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

const navItems = [
  {
    path: '/dashboard',
    label: 'Overview',
    icon: LayoutDashboard
  },
  {
    path: '/dashboard/security',
    label: 'Security',
    icon: Shield
  }
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-grid-white/[0.02] -z-[1]" />
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 backdrop-blur-sm -z-[1]" />

      {/* Sidebar */}
      <motion.nav 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-72 backdrop-blur-xl bg-gray-800/30 p-8 border-r border-white/5 shadow-2xl"
      >
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="text-white font-semibold text-2xl tracking-tight">
              Nexus Dashboard
            </div>
            <div className="h-0.5 bg-gradient-to-r from-blue-500/50 to-transparent mt-3" />
          </motion.div>
          
          {/* Navigation Links */}
          <ul className="space-y-3">
            {navItems.map((item, index) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              
              return (
                <motion.li
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * (index + 1) }}
                >
                  <Link href={item.path}>
                    <div className={`
                      relative group flex items-center space-x-4 px-6 py-4 rounded-xl
                      transition-all duration-300 ease-in-out
                      ${isActive 
                        ? 'text-white bg-white/10 shadow-lg' 
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }
                    `}>
                      <Icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 
                        ${isActive ? 'text-blue-400' : ''}`} />
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="active-nav"
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 -z-10"
                        />
                      )}
                    </div>
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </motion.nav>

      {/* Main Content */}
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 overflow-y-auto"
      >
        <div className="min-h-full backdrop-blur-sm bg-gray-900/30 p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </motion.main>
    </div>
  );
} 