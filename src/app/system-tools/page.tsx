import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import AntivirusStatus from '@/components/system/AntivirusStatus';
import FirewallStatus from '@/components/system/FirewallStatus';
import SystemUpdates from '@/components/system/SystemUpdates';

export const metadata: Metadata = {
  title: 'System Tools | Nexus Security Platform',
  description: 'System security tools and status monitoring',
};

interface SystemToolsData {
  antivirus: {
    installed: boolean;
    status: string;
    lastUpdate: string;
  };
  firewall: {
    enabled: boolean;
    rules: number;
  };
  updates: {
    available: number;
    critical: number;
  };
}

export default async function SystemToolsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  try {
    // Fetch latest system health data using raw SQL to handle JSON metadata
    const systemHealth = await prisma.$queryRaw<Array<{ metadata: string | null }>>`
      SELECT metadata FROM "SystemHealth"
      WHERE "userId" = ${session.user.id}
      ORDER BY "timestamp" DESC
      LIMIT 1
    `;

    // Default values for system tools data
    const defaultSystemTools: SystemToolsData = {
      antivirus: {
        installed: false,
        status: 'Unknown',
        lastUpdate: new Date().toISOString(),
      },
      firewall: {
        enabled: false,
        rules: 0,
      },
      updates: {
        available: 0,
        critical: 0,
      },
    };

    // Parse metadata if it exists, otherwise use default values
    let systemTools = defaultSystemTools;
    
    if (systemHealth?.[0]?.metadata) {
      try {
        const parsedMetadata = JSON.parse(systemHealth[0].metadata);
        if (parsedMetadata.systemTools) {
          systemTools = parsedMetadata.systemTools as SystemToolsData;
        }
      } catch (error) {
        console.error('Error parsing system tools metadata:', error);
      }
    }

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">System Tools</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Antivirus Status */}
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
            <AntivirusStatus data={systemTools.antivirus} />
          </div>

          {/* Firewall Status */}
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
            <FirewallStatus data={systemTools.firewall} />
          </div>

          {/* System Updates */}
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
            <SystemUpdates data={systemTools.updates} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
              Run Antivirus Scan
            </button>
            <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors">
              Update Firewall Rules
            </button>
            <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors">
              Check for Updates
            </button>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading system tools:', error);
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">System Tools</h1>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
          <p className="text-red-400">Error loading system tools. Please try again later.</p>
        </div>
      </div>
    );
  }
} 