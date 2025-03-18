import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import ErrorSummary from '@/components/logs/ErrorSummary';
import LogTimeline from '@/components/logs/LogTimeline';
import CriticalIssues from '@/components/logs/CriticalIssues';

export const metadata: Metadata = {
  title: 'Log Analysis | Nexus Security Platform',
  description: 'System log analysis and error tracking',
};

interface LogAnalysisData {
  errorCount: number;
  warningCount: number;
  criticalIssues: number;
  recentErrors: string[];
}

export default async function LogAnalysisPage() {
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

    // Default values for log analysis data
    const defaultLogAnalysis: LogAnalysisData = {
      errorCount: 0,
      warningCount: 0,
      criticalIssues: 0,
      recentErrors: [],
    };

    // Parse metadata if it exists, otherwise use default values
    let logAnalysis = defaultLogAnalysis;
    
    if (systemHealth?.[0]?.metadata) {
      try {
        const parsedMetadata = JSON.parse(systemHealth[0].metadata);
        if (parsedMetadata.logAnalysis) {
          logAnalysis = parsedMetadata.logAnalysis as LogAnalysisData;
        }
      } catch (error) {
        console.error('Error parsing log analysis metadata:', error);
      }
    }

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Log Analysis</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Error Summary */}
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
            <ErrorSummary
              errorCount={logAnalysis.errorCount}
              warningCount={logAnalysis.warningCount}
            />
          </div>

          {/* Critical Issues */}
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
            <CriticalIssues
              count={logAnalysis.criticalIssues}
              recentErrors={logAnalysis.recentErrors}
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
                Export Log Report
              </button>
              <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors">
                Clear Error Logs
              </button>
              <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors">
                Configure Alerts
              </button>
            </div>
          </div>
        </div>

        {/* Log Timeline */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <LogTimeline errors={logAnalysis.recentErrors} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading log analysis:', error);
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Log Analysis</h1>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
          <p className="text-red-400">Error loading log analysis data. Please try again later.</p>
        </div>
      </div>
    );
  }
} 