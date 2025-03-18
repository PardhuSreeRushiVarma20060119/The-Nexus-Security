'use client';

import { ExclamationTriangleIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface SecurityLog {
  id: string;
  event: string;
  severity: string;
  details: string;
  timestamp: Date;
}

interface RecentThreatsProps {
  threats: SecurityLog[];
}

export default function RecentThreats({ threats }: RecentThreatsProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'text-red-500 bg-red-500/10 hover:bg-red-500/20';
      case 'high':
        return 'text-orange-500 bg-orange-500/10 hover:bg-orange-500/20';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20';
      case 'low':
        return 'text-green-500 bg-green-500/10 hover:bg-green-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 hover:bg-gray-500/20';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="space-y-4">
      {threats.length > 0 ? (
        threats.map((threat) => (
          <div
            key={threat.id}
            className="relative group flex items-start space-x-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-700/50 transition-colors duration-200"
            onMouseEnter={() => setHoveredId(threat.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className={`p-2 rounded-full ${getSeverityColor(threat.severity)} flex-shrink-0 transition-colors duration-200`}>
              {threat.event.toLowerCase().includes('malware') ? (
                <ShieldExclamationIcon className="h-5 w-5" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex flex-col space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-gray-100 transition-colors duration-200">
                      {threat.details}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 truncate group-hover:text-gray-300 transition-colors duration-200">
                      Event: {threat.event}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${getSeverityColor(
                      threat.severity
                    )} transition-colors duration-200`}
                  >
                    {threat.severity}
                  </span>
                </div>
                <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                  Detected: {formatDate(threat.timestamp)}
                </p>
              </div>
            </div>

            {/* Tooltip */}
            {hoveredId === threat.id && (
              <>
                {/* Backdrop blur */}
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-0" />
                
                {/* Tooltip content */}
                <div className="absolute z-10 left-0 right-0 -bottom-2 transform translate-y-full bg-gray-900/95 backdrop-blur-md text-white p-4 rounded-lg shadow-xl border border-gray-700 max-w-2xl mx-auto">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-full ${getSeverityColor(threat.severity)}`}>
                        {threat.event.toLowerCase().includes('malware') ? (
                          <ShieldExclamationIcon className="h-5 w-5" />
                        ) : (
                          <ExclamationTriangleIcon className="h-5 w-5" />
                        )}
                      </div>
                      <h3 className="text-lg font-semibold">{threat.event}</h3>
                    </div>
                    
                    <div className="bg-gray-800/50 p-3 rounded-md">
                      <p className="text-sm text-gray-200 whitespace-pre-wrap break-words">
                        {threat.details}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-300">
                      <span>Severity: {threat.severity}</span>
                      <span>Detected: {formatDate(threat.timestamp)}</span>
                    </div>
                  </div>
                  
                  {/* Tooltip arrow */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-900/95 backdrop-blur-md rotate-45 border-t border-l border-gray-700"></div>
                </div>
              </>
            )}
          </div>
        ))
      ) : (
        <div className="text-center py-6 bg-gray-800 rounded-lg">
          <p className="text-gray-400">No recent threats detected</p>
        </div>
      )}
    </div>
  );
} 