import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import VirusTotalResults from '@/components/malware/VirusTotalResults';

export const metadata: Metadata = {
  title: 'Reports | Nexus Security Platform',
  description: 'Security reports and analysis results',
};

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  // Fetch recent malware scans
  const malwareScans = await prisma.scanResult.findMany({
    where: {
      userId: session.user.id,
      scanType: 'MALWARE_SCAN',
    },
    orderBy: {
      startTime: 'desc',
    },
    take: 5, // Get last 5 scans
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Security Reports</h1>
      </div>

      {/* Malware Analysis Reports */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Recent Malware Analysis Reports</h2>
        <div className="space-y-6">
          {malwareScans.length > 0 ? (
            malwareScans.map((scan) => (
              <div key={scan.id} className="bg-gray-900 rounded-lg p-6">
                <VirusTotalResults
                  findings={scan.findings as any}
                  scanDate={scan.startTime}
                />
              </div>
            ))
          ) : (
            <div className="bg-gray-900 rounded-lg p-6 text-gray-400 text-center">
              No malware analysis reports available
            </div>
          )}
        </div>
      </div>

      {/* Add other report sections here */}
    </div>
  );
} 