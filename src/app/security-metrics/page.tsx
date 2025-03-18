import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import SecurityScore from '@/components/dashboard/SecurityScore';
import ThreatDistribution from '@/components/metrics/ThreatDistribution';
import SecurityTimeline from '@/components/metrics/SecurityTimeline';
import RiskAssessment from '@/components/metrics/RiskAssessment';

export const metadata: Metadata = {
  title: 'Security Metrics | Nexus Security Platform',
  description: 'Detailed security metrics and analytics',
};

export default async function SecurityMetricsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  // Fetch security metrics data
  const [securityLogs, scanResults] = await Promise.all([
    prisma.securityLog.findMany({
      where: { userId: session.user.id },
      orderBy: { timestamp: 'desc' },
      take: 100, // Get more data for analytics
    }),
    prisma.scanResult.findMany({
      where: { userId: session.user.id },
      orderBy: { startTime: 'desc' },
      take: 50,
    }),
  ]);

  // Calculate threat distribution
  const threatDistribution = securityLogs.reduce<Record<string, number>>((acc, log) => {
    acc[log.severity] = (acc[log.severity] || 0) + 1;
    return acc;
  }, {});

  // Calculate risk score based on threat severity
  const riskScore = securityLogs.reduce((score, log) => {
    const severityWeights: Record<string, number> = {
      critical: 10,
      high: 7,
      medium: 4,
      low: 1,
    };
    return score + (severityWeights[log.severity.toLowerCase()] || 0);
  }, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Security Metrics</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Security Score */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <SecurityScore />
        </div>

        {/* Risk Assessment */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <RiskAssessment score={riskScore} />
        </div>

        {/* Threat Distribution */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <ThreatDistribution distribution={threatDistribution} />
        </div>
      </div>

      {/* Security Timeline */}
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
        <SecurityTimeline logs={securityLogs} scans={scanResults} />
      </div>
    </div>
  );
} 