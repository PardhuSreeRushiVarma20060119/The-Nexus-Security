import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import SystemPerformance from '@/components/system/SystemPerformance';
import ProcessMonitor from '@/components/system/ProcessMonitor';
import ResourceUsage from '@/components/system/ResourceUsage';
import SystemAlerts from '@/components/system/SystemAlerts';

export const metadata: Metadata = {
  title: 'System Health | Nexus Security Platform',
  description: 'Monitor system health and performance metrics',
};

export default async function SystemHealthPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  // Fetch system health data
  const [systemHealth, alerts] = await Promise.all([
    prisma.systemHealth.findFirst({
      where: { userId: session.user.id },
      orderBy: { timestamp: 'desc' },
    }),
    prisma.securityLog.findMany({
      where: {
        userId: session.user.id,
        event: "SYSTEM_ALERT",
      },
      orderBy: { timestamp: 'desc' },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">System Health</h1>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
          Run Diagnostics
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Performance */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <SystemPerformance data={systemHealth} />
        </div>

        {/* Resource Usage */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <ResourceUsage data={systemHealth} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Process Monitor */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <ProcessMonitor />
        </div>

        {/* System Alerts */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <SystemAlerts alerts={alerts} />
        </div>
      </div>
    </div>
  );
} 