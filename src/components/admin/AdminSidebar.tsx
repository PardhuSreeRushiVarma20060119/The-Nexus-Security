'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  Database, 
  Settings, 
  Shield, 
  Activity, 
  LogOut 
} from 'lucide-react';
import LogoutButton from '@/components/auth/LogoutButton';

const navigation = [
  { name: 'User Management', href: '/admin/users', icon: Users },
  { name: 'Database', href: '/admin/database', icon: Database },
  { name: 'Server Config', href: '/admin/config', icon: Settings },
  { name: 'Security Logs', href: '/admin/security', icon: Shield },
  { name: 'System Health', href: '/admin/health', icon: Activity },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-800 min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white">Admin Panel</h2>
        <p className="text-xs text-red-400 mt-1">ONLY FOR AUTHORIZED ADMINISTRATORS</p>
      </div>

      <nav className="space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <LogoutButton />
      </div>
    </div>
  );
} 