'use client';

import { useSession } from 'next-auth/react';
import LogoutButton from '@/components/auth/LogoutButton';

export default function ProfileHeader() {
  const { data: session } = useSession();

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-white">Profile</h1>
      <div className="flex items-center gap-4">
        <span className="text-gray-400">
          {session?.user?.email}
        </span>
        <LogoutButton />
      </div>
    </div>
  );
} 