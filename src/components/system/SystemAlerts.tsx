'use client';

import { ExclamationTriangleIcon, XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface SecurityLog {
  id: string;
  type: string;
  severity: string;
  description: string;
  timestamp: Date;
}

interface SystemAlertsProps {
  alerts: SecurityLog[];
}

export default function SystemAlerts({ alerts }: SystemAlertsProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'high':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
      case 'medium':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'high':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-6">System Alerts</h2>
      <div className="space-y-4">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${getSeverityColor(
                alert.severity
              )}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getSeverityIcon(alert.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {alert.description}
                    </p>
                    <span className="text-xs">
                      {formatDate(alert.timestamp)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs opacity-70">
                    Type: {alert.type}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-400">No system alerts</p>
          </div>
        )}
      </div>

      {alerts.length > 0 && (
        <div className="mt-4 flex justify-end">
          <button className="text-sm text-blue-500 hover:text-blue-400">
            View All Alerts
          </button>
        </div>
      )}
    </div>
  );
} 