'use client';

import { ClockIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface SecurityLog {
  id: string;
  userId: string;
  type: string;
  severity: string;
  description: string;
  metadata: any;
  timestamp: Date;
}

interface ScanResult {
  id: string;
  userId: string;
  scanType: string;
  status: string;
  findings: any;
  startTime: Date;
  endTime: Date | null;
}

type SecurityLogActivity = SecurityLog & { activityType: 'security_log' };
type ScanResultActivity = ScanResult & { activityType: 'scan_result' };
type Activity = SecurityLogActivity | ScanResultActivity;

interface RecentActivityProps {
  securityLogs: SecurityLog[];
  scanResults: ScanResult[];
}

export default function RecentActivity({ securityLogs, scanResults }: RecentActivityProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'text-red-500';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
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

  const getActivityDate = (activity: Activity) => {
    if (activity.activityType === 'security_log') {
      return activity.timestamp;
    }
    return activity.startTime;
  };

  const combinedActivities: Activity[] = [
    ...securityLogs.map((log): SecurityLogActivity => ({
      ...log,
      activityType: 'security_log'
    })),
    ...scanResults.map((scan): ScanResultActivity => ({
      ...scan,
      activityType: 'scan_result'
    }))
  ].sort((a, b) => getActivityDate(b).getTime() - getActivityDate(a).getTime());

  return (
    <div className="space-y-4">
      {combinedActivities.map((activity) => (
        <div
          key={activity.id}
          className="bg-gray-800 p-4 rounded-lg flex items-start space-x-4"
        >
          <div className="flex-shrink-0">
            {activity.activityType === 'security_log' ? (
              <div className={`p-2 rounded-full ${getSeverityColor(activity.severity)} bg-opacity-10`}>
                <ExclamationTriangleIcon className="h-5 w-5" />
              </div>
            ) : (
              <div className={`p-2 rounded-full ${activity.status.toLowerCase() === 'completed' ? 'text-green-500' : 'text-red-500'} bg-opacity-10`}>
                <ShieldCheckIcon className="h-5 w-5" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white truncate">
                {activity.activityType === 'security_log'
                  ? activity.description
                  : `Security Scan - ${activity.scanType}`}
              </p>
              <div className="flex items-center text-xs text-gray-400">
                <ClockIcon className="h-4 w-4 mr-1" />
                {formatDate(getActivityDate(activity))}
              </div>
            </div>
            {activity.activityType === 'scan_result' && (
              <p className="mt-1 text-sm text-gray-400">
                {getThreatsFound(activity.findings)} threats found
              </p>
            )}
          </div>
        </div>
      ))}

      {combinedActivities.length === 0 && (
        <div className="text-center py-6">
          <p className="text-gray-400">No recent activity</p>
        </div>
      )}
    </div>
  );
} 