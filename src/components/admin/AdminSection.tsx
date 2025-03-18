'use client';

import Link from 'next/link';
import { 
  Users, 
  Database, 
  Settings, 
  Shield, 
  Activity,
} from 'lucide-react';
import Glassmorphic from '@/components/ui/Glassmorphic';

const adminOptions = [
  { name: 'User Management', href: '/admin/users', icon: Users },
  { name: 'Database', href: '/admin/database', icon: Database },
  { name: 'Server Config', href: '/admin/config', icon: Settings },
  { name: 'Security Logs', href: '/admin/security', icon: Shield },
  { name: 'System Health', href: '/admin/health', icon: Activity },
];

export default function AdminSection() {
  return (
    <Glassmorphic className="p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Administration</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Link
              key={option.name}
              href={option.href}
              className="flex items-center p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Icon className="w-6 h-6 mr-3" />
              <div className="flex-1">
                <h3 className="font-semibold">{option.name}</h3>
                <p className="text-sm text-gray-400">Manage and configure</p>
              </div>
            </Link>
          );
        })}
      </div>
    </Glassmorphic>
  );
} 