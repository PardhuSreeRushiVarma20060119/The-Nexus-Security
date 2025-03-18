import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import SecurityScore from '@/components/dashboard/SecurityScore';
import RecentActivity from '@/components/profile/RecentActivity';
import ProfileHeader from '@/components/profile/ProfileHeader';

export const metadata: Metadata = {
  title: 'Profile | Nexus Security Platform',
  description: 'View and manage your profile',
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  // Fetch user's security logs, scan results, and settings
  const [securityLogs, scanResults, userWithSettings] = await Promise.all([
    prisma.securityLog.findMany({
      where: { userId: session.user.id },
      orderBy: { timestamp: 'desc' },
      take: 5,
    }),
    prisma.scanResult.findMany({
      where: { userId: session.user.id },
      orderBy: { startTime: 'desc' },
      take: 5,
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: { settings: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      <ProfileHeader />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Info Card */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {session.user.name?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {session.user.name}
              </h2>
              <p className="text-gray-400">{session.user.email}</p>
            </div>
          </div>
        </div>

        {/* Security Score Card */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <SecurityScore />
        </div>

        {/* Account Status Card */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">
            Account Status
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-400">Member since</p>
              <p className="text-white">
                {userWithSettings?.createdAt.toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Last scan</p>
              <p className="text-white">
                {scanResults[0]?.startTime.toLocaleDateString() || 'No scans yet'}
              </p>
            </div>
            <div>
              <p className="text-gray-400">2FA Status</p>
              <p className="text-white">
                {userWithSettings?.settings?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-6">
          Recent Activity
        </h2>
        <RecentActivity
          securityLogs={securityLogs}
          scanResults={scanResults}
        />
      </div>
    </div>
  );
} 