'use client';

import { ClockIcon, ShieldExclamationIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface SecurityLog {
  id: string;
  type: string;
  severity: string;
  description: string;
  timestamp: Date;
}

interface ScanResult {
  id: string;
  scanType: string;
  status: string;
  findings: any;
  startTime: Date;
  endTime: Date | null;
}

interface SecurityTimelineProps {
  logs: SecurityLog[];
  scans: ScanResult[];
}

type TimelineEvent = {
  id: string;
  type: 'security_log' | 'scan_result';
  title: string;
  description: string;
  severity?: string;
  timestamp: Date;
  status?: string;
};

export default function SecurityTimeline({ logs, scans }: SecurityTimelineProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'text-red-500 bg-red-500/10';
      case 'high':
        return 'text-orange-500 bg-orange-500/10';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'low':
        return 'text-green-500 bg-green-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-500 bg-green-500/10';
      case 'failed':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-yellow-500 bg-yellow-500/10';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  // Combine and sort all events
  const timelineEvents: TimelineEvent[] = [
    ...logs.map((log): TimelineEvent => ({
      id: log.id,
      type: 'security_log',
      title: log.type,
      description: log.description,
      severity: log.severity,
      timestamp: new Date(log.timestamp),
    })),
    ...scans.map((scan): TimelineEvent => ({
      id: scan.id,
      type: 'scan_result',
      title: scan.scanType,
      description: `Security scan ${scan.status.toLowerCase()}`,
      timestamp: new Date(scan.startTime),
      status: scan.status,
    })),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-6">Security Timeline</h2>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-700" />
        <div className="space-y-6">
          {timelineEvents.map((event) => (
            <div key={event.id} className="relative pl-10">
              <div className="absolute left-0 p-2 rounded-full bg-gray-800 z-10">
                {event.type === 'security_log' ? (
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                ) : (
                  <ShieldExclamationIcon className="h-5 w-5 text-blue-500" />
                )}
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-white font-medium">{event.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {event.description}
                    </p>
                  </div>
                  {event.severity && (
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(
                        event.severity
                      )}`}
                    >
                      {event.severity}
                    </span>
                  )}
                  {event.status && (
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                        event.status
                      )}`}
                    >
                      {event.status}
                    </span>
                  )}
                </div>
                <div className="flex items-center mt-2 text-xs text-gray-400">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {formatDate(event.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 