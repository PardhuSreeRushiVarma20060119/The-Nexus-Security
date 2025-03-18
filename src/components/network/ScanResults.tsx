'use client';

import { ClockIcon, ServerIcon } from '@heroicons/react/24/outline';

interface ScanResult {
  id: string;
  scanType: string;
  status: string;
  findings: any;
  startTime: Date;
  endTime: Date | null;
}

interface ScanResultsProps {
  results: ScanResult[];
}

export default function ScanResults({ results }: ScanResultsProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-500 bg-green-500/10';
      case 'failed':
        return 'text-red-500 bg-red-500/10';
      case 'in_progress':
        return 'text-yellow-500 bg-yellow-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getScanTypeIcon = (scanType: string) => {
    switch (scanType.toLowerCase()) {
      case 'quick_scan':
        return <ClockIcon className="h-5 w-5" />;
      case 'full_scan':
        return <ServerIcon className="h-5 w-5" />;
      default:
        return <ServerIcon className="h-5 w-5" />;
    }
  };

  const getThreatsFound = (findings: any) => {
    try {
      return typeof findings === 'string'
        ? JSON.parse(findings).threatsFound || 0
        : findings?.threatsFound || 0;
    } catch {
      return 0;
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-6">Recent Scans</h2>
      <div className="space-y-4">
        {results.length > 0 ? (
          results.map((scan) => (
            <div
              key={scan.id}
              className="p-4 bg-gray-800 rounded-lg flex items-start space-x-4"
            >
              <div className={`p-2 rounded-full ${getStatusColor(scan.status)}`}>
                {getScanTypeIcon(scan.scanType)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {scan.scanType.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Started: {formatDate(scan.startTime)}
                    </p>
                    {scan.endTime && (
                      <p className="text-xs text-gray-400">
                        Completed: {formatDate(scan.endTime)}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                        scan.status
                      )}`}
                    >
                      {scan.status}
                    </span>
                    {scan.status === 'completed' && (
                      <span className="text-xs text-gray-400 mt-1">
                        {getThreatsFound(scan.findings)} threats found
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-400">No scan results available</p>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="mt-4 flex justify-end">
          <button className="text-sm text-blue-500 hover:text-blue-400">
            View All Scans
          </button>
        </div>
      )}
    </div>
  );
} 