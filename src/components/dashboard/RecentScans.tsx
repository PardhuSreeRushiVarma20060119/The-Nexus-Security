'use client';

import { DocumentMagnifyingGlassIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface ScanResult {
  id: string;
  scanType: string;
  status: string;
  findings: any;
  startTime: Date;
  endTime: Date | null;
}

interface RecentScansProps {
  scans: ScanResult[];
}

export default function RecentScans({ scans }: RecentScansProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-500 bg-green-500/10 hover:bg-green-500/20';
      case 'in_progress':
        return 'text-blue-500 bg-blue-500/10 hover:bg-blue-500/20';
      case 'failed':
        return 'text-red-500 bg-red-500/10 hover:bg-red-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 hover:bg-gray-500/20';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const getScanIcon = (scanType: string) => {
    switch (scanType.toLowerCase()) {
      case 'malware_scan':
        return <ShieldCheckIcon className="h-5 w-5" />;
      default:
        return <DocumentMagnifyingGlassIcon className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-4">
      {scans.length > 0 ? (
        scans.map((scan) => (
          <div
            key={scan.id}
            className="relative group flex items-start space-x-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-700/50 transition-colors duration-200"
            onMouseEnter={() => setHoveredId(scan.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className={`p-2 rounded-full ${getStatusColor(scan.status)} flex-shrink-0 transition-colors duration-200`}>
              {getScanIcon(scan.scanType)}
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex flex-col space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-gray-100 transition-colors duration-200">
                      {scan.scanType.replace(/_/g, ' ').toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 truncate group-hover:text-gray-300 transition-colors duration-200">
                      Status: {scan.status}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${getStatusColor(
                      scan.status
                    )} transition-colors duration-200`}
                  >
                    {scan.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                  Started: {formatDate(scan.startTime)}
                </p>
              </div>
            </div>

            {/* Tooltip */}
            {hoveredId === scan.id && (
              <>
                {/* Backdrop blur */}
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-0" />
                
                {/* Tooltip content */}
                <div className="absolute z-10 left-0 right-0 -bottom-2 transform translate-y-full bg-gray-900/95 backdrop-blur-md text-white p-4 rounded-lg shadow-xl border border-gray-700 max-w-2xl mx-auto">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-full ${getStatusColor(scan.status)}`}>
                        {getScanIcon(scan.scanType)}
                      </div>
                      <h3 className="text-lg font-semibold">
                        {scan.scanType.replace(/_/g, ' ').toUpperCase()}
                      </h3>
                    </div>
                    
                    <div className="bg-gray-800/50 p-3 rounded-md">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">Status:</span>
                          <span className={`font-medium ${getStatusColor(scan.status)}`}>
                            {scan.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">Started:</span>
                          <span className="text-gray-200">{formatDate(scan.startTime)}</span>
                        </div>
                        {scan.endTime && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-300">Completed:</span>
                            <span className="text-gray-200">{formatDate(scan.endTime)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {scan.findings && (
                      <div className="bg-gray-800/50 p-3 rounded-md">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Findings:</h4>
                        <pre className="text-xs text-gray-200 whitespace-pre-wrap break-words">
                          {JSON.stringify(scan.findings, null, 2)}
                        </pre>
                      </div>
                    )}
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
          <p className="text-gray-400">No recent scans found</p>
        </div>
      )}
    </div>
  );
} 