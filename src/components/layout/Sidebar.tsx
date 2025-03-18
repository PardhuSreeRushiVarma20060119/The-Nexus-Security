'use client';

import { motion } from 'framer-motion';
import { useSidebar } from '@/contexts/SidebarContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ChartBarIcon,
  ShieldCheckIcon,
  ComputerDesktopIcon,
  WrenchScrewdriverIcon,
  DocumentTextIcon,
  BugAntIcon,
  CloudIcon,
  BeakerIcon,
  ArrowLeftOnRectangleIcon,
  Cog6ToothIcon,
  ServerIcon,
  UserGroupIcon,
  KeyIcon,
  ClockIcon,
  ChartPieIcon,
  CommandLineIcon,
  CircleStackIcon,
  ArrowTrendingUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { 
  Search,
  Globe,
  Shield,
  Terminal,
  BarChart2,
  FileText,
  Settings,
  Activity
} from 'lucide-react';

const navigation = [
  { 
    category: 'Overview',
    items: [
      { 
        name: 'Dashboard', 
        href: '/', 
        icon: ChartBarIcon,
        badge: { text: 'Live', color: 'green' }
      },
      { 
        name: 'Security Metrics', 
        href: '/security-metrics', 
        icon: ChartPieIcon,
        badge: { text: '3', color: 'orange' }
      },
      { 
        name: 'System Health', 
        href: '/system-health', 
        icon: ArrowTrendingUpIcon 
      },
    ]
  },
  {
    category: 'Security Tools',
    items: [
      { 
        name: 'Network Scanner', 
        href: '/network-scanner', 
        icon: ComputerDesktopIcon,
        badge: { text: 'Active', color: 'blue' }
      },
      { 
        name: 'System Tools', 
        href: '/system-tools', 
        icon: WrenchScrewdriverIcon 
      },
      { 
        name: 'Malware Analysis', 
        href: '/malware-analysis', 
        icon: BugAntIcon,
        badge: { text: 'New', color: 'purple' }
      },
      { 
        name: 'Log Analysis', 
        href: '/log-analysis', 
        icon: CommandLineIcon 
      },
    ]
  },
  {
    category: 'Intelligence',
    items: [
      { 
        name: 'Reports', 
        href: '/reports', 
        icon: DocumentTextIcon 
      },
      { 
        name: 'AI Diagnostics', 
        href: '/ai-diagnostics', 
        icon: CloudIcon,
        badge: { text: 'Beta', color: 'pink' }
      },
      { 
        name: 'OSINT Tools',
        href: '/osint',
        icon: Globe
      },
      { 
        name: 'Sandbox', 
        href: '/sandbox', 
        icon: BeakerIcon 
      },
    ]
  },
  {
    category: 'Administration',
    items: [
      { 
        name: 'User Management', 
        href: '/users', 
        icon: UserGroupIcon 
      },
      { 
        name: 'Server Config', 
        href: '/server-config', 
        icon: ServerIcon 
      },
      { 
        name: 'Database', 
        href: '/database', 
        icon: CircleStackIcon 
      },
    ]
  },
];

const quickStats = [
  { label: 'Security Score', value: '94%', trend: 'up' },
  { label: 'Active Threats', value: '0', trend: 'neutral' },
  { label: 'System Load', value: '42%', trend: 'down' },
];

export default function Sidebar() {
  const { isOpen, toggleSidebar } = useSidebar();
  const pathname = usePathname();

  return (
    <motion.div
      initial={false}
      animate={{ width: isOpen ? 280 : 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`relative bg-gray-900 border-r border-gray-800 overflow-hidden`}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-4 top-6 p-1.5 bg-gray-900 border border-gray-800 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors z-10"
      >
        {isOpen ? (
          <ChevronLeftIcon className="h-4 w-4" />
        ) : (
          <ChevronRightIcon className="h-4 w-4" />
        )}
      </button>

      <div className="flex flex-col flex-grow bg-[var(--card-background)] border-r border-[var(--border)]">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          {/* Logo Section */}
          <div className="flex items-center px-6 mb-6">
            <div className="flex items-center">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--success)] flex items-center justify-center">
                <ShieldCheckIcon className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <h2 className="text-base font-semibold bg-gradient-to-r from-[var(--accent)] to-[var(--success)] bg-clip-text text-transparent">Nexus Enterprise</h2>
                <p className="text-xs text-[var(--text-secondary)]">Security Command Center</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="px-6 mb-6">
            <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
              Quick Stats
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {quickStats.map((stat) => (
                <div key={stat.label} className="bg-[var(--background)] rounded-lg p-2">
                  <div className="text-xs text-[var(--text-secondary)]">{stat.label}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{stat.value}</span>
                    {stat.trend === 'up' && (
                      <ArrowTrendingUpIcon className="h-3 w-3 text-green-500 rotate-45" />
                    )}
                    {stat.trend === 'down' && (
                      <ArrowTrendingUpIcon className="h-3 w-3 text-red-500 -rotate-45" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-6">
            {navigation.map((group) => (
              <div key={group.category}>
                <h3 className="px-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  {group.category}
                </h3>
                <div className="mt-2 space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`${
                          isActive
                            ? 'bg-[var(--background)] bg-opacity-10 text-[var(--accent)] shadow-sm'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--background)] hover:text-[var(--text-primary)]'
                        } group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200`}
                      >
                        <div className="flex items-center">
                          <item.icon
                            className={`${
                              isActive
                                ? 'text-[var(--accent)]'
                                : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                            } mr-3 flex-shrink-0 h-5 w-5 transition-all duration-200`}
                            aria-hidden="true"
                          />
                          {item.name}
                        </div>
                        {item.badge && (
                          <span className={`
                            inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium
                            ${item.badge.color === 'green' ? 'bg-green-500 bg-opacity-10 text-green-500' :
                              item.badge.color === 'orange' ? 'bg-orange-500 bg-opacity-10 text-orange-500' :
                              item.badge.color === 'blue' ? 'bg-blue-500 bg-opacity-10 text-blue-500' :
                              item.badge.color === 'purple' ? 'bg-purple-500 bg-opacity-10 text-purple-500' :
                              'bg-pink-500 bg-opacity-10 text-pink-500'
                            }
                          `}>
                            {item.badge.text}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Status Section */}
          <div className="flex-shrink-0 p-4">
            <div className="rounded-lg bg-gradient-to-br from-[var(--error)] to-[var(--success)] p-4">
              <div className="flex items-center">
                <ShieldCheckIcon className="h-5 w-5 text-white" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">System Protected</p>
                  <div className="flex items-center mt-1">
                    <ClockIcon className="h-3 w-3 text-white/80 mr-1" />
                    <p className="text-xs text-white/80">Last scan: 5 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <button className="w-full group flex items-center px-3 py-2 text-sm font-medium text-[var(--text-secondary)] rounded-lg hover:bg-[var(--background)] hover:text-[var(--text-primary)] transition-all duration-200">
                <Cog6ToothIcon className="mr-3 h-5 w-5" />
                Settings
              </button>
              <button className="w-full group flex items-center px-3 py-2 text-sm font-medium text-[var(--text-secondary)] rounded-lg hover:bg-[var(--background)] hover:text-[var(--text-primary)] transition-all duration-200">
                <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 