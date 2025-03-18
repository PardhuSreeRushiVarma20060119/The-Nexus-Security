import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';
import OsintClient from '@/components/osint/OsintClient';

export const metadata: Metadata = {
  title: 'OSINT Tools | Nexus Security Platform',
  description: 'Open Source Intelligence gathering tools and analysis',
};

export default async function OsintPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Open Source Intelligence</h1>
      </div>
      <OsintClient />
    </div>
  );
} 