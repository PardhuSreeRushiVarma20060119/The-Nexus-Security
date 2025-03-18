import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import SecurityScore from '@/components/dashboard/SecurityScore';
import SystemHealth from '@/components/dashboard/SystemHealth';
import RecentThreats from '@/components/dashboard/RecentThreats';
import NetworkStatus from '@/components/dashboard/NetworkStatus';
import AdminSection from '@/components/admin/AdminSection';

interface ScanResult {
  id: string;
  scanType: string;
  status: string;
  startTime: Date;
}

export const metadata: Metadata = {
  title: 'Dashboard | Nexus Security Platform',
  description: 'Nexus Security Command Center',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  // Fetch security metrics, system health, and recent threats
  const [securityLogs, scanResults] = await Promise.all([
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
  ]);

  // Fetch system health separately to handle potential model issues
  let systemHealth = null;
  try {
    systemHealth = await prisma.systemHealth.findFirst({
      where: { userId: session.user.id },
      orderBy: { timestamp: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching system health:', error);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Security Score */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <SecurityScore />
        </div>

        {/* System Health */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <SystemHealth data={systemHealth} />
        </div>

        {/* Network Status */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <NetworkStatus />
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
              Run Quick Scan
            </button>
            <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors">
              View Reports
            </button>
            <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors">
              System Backup
            </button>
          </div>
        </div>
      </div>

      {/* Recent Threats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Threats</h2>
          <RecentThreats threats={securityLogs} />
        </div>

        {/* Recent Scans */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Scans</h2>
          <div className="space-y-4">
            {scanResults.map((scan: ScanResult) => (
              <div
                key={scan.id}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-md"
              >
                <div>
                  <p className="text-white font-medium">{scan.scanType}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(scan.startTime).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    scan.status === 'COMPLETED'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {scan.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AdminSection />
    </div>
  );
} 