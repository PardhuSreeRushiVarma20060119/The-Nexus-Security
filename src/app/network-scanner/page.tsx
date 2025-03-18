import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import ScanControls from '@/components/network/ScanControls';
import ScanResults from '@/components/network/ScanResults';
import NetworkMap from '@/components/network/NetworkMap';
import VulnerabilityReport from '@/components/network/VulnerabilityReport';

export const metadata: Metadata = {
  title: 'Network Scanner | Nexus Security Platform',
  description: 'Scan and monitor your network for vulnerabilities',
};

export default async function NetworkScannerPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  // Fetch recent scan results and vulnerabilities
  const [scanResults, vulnerabilities] = await Promise.all([
    prisma.scanResult.findMany({
      where: { userId: session.user.id },
      orderBy: { startTime: 'desc' },
      take: 10,
    }),
    prisma.securityLog.findMany({
      where: {
        userId: session.user.id,
        event: "VULNERABILITY_DETECTED",
      },
      orderBy: { timestamp: 'desc' },
      take: 10,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Network Scanner</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scan Controls */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <ScanControls />
        </div>

        {/* Network Map */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <NetworkMap nodes={[]} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scan Results */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <ScanResults results={scanResults} />
        </div>

        {/* Vulnerability Report */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <VulnerabilityReport vulnerabilities={vulnerabilities} />
        </div>
      </div>
    </div>
  );
} 