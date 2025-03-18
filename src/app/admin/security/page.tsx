'use client';

import { useState } from 'react';
import Glassmorphic from '@/components/ui/Glassmorphic';
import { Shield, AlertTriangle, Download, Filter } from 'lucide-react';

interface SecurityLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  event: string;
  details: string;
  source: string;
}

export default function SecurityLogsPage() {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      default:
        return 'text-blue-400';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Shield className="w-6 h-6 mr-2" />
          Security Logs
        </h1>
        <div className="flex space-x-4">
          <button className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </button>
        </div>
      </div>

      <Glassmorphic className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-4">
            <button
              className={`px-3 py-1 rounded-full ${
                filter === 'all' ? 'bg-blue-600 text-white' : 'text-gray-400'
              }`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`px-3 py-1 rounded-full ${
                filter === 'errors' ? 'bg-red-600 text-white' : 'text-gray-400'
              }`}
              onClick={() => setFilter('errors')}
            >
              Errors
            </button>
            <button
              className={`px-3 py-1 rounded-full ${
                filter === 'warnings' ? 'bg-yellow-600 text-white' : 'text-gray-400'
              }`}
              onClick={() => setFilter('warnings')}
            >
              Warnings
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Level</th>
                <th className="pb-3">Event</th>
                <th className="pb-3">Source</th>
                <th className="pb-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    Loading security logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    No security logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-700/50">
                    <td className="py-3">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3">
                      <span className={`flex items-center ${getLevelColor(log.level)}`}>
                        {log.level === 'error' && <AlertTriangle className="w-4 h-4 mr-1" />}
                        {log.level.charAt(0).toUpperCase() + log.level.slice(1)}
                      </span>
                    </td>
                    <td className="py-3">{log.event}</td>
                    <td className="py-3">{log.source}</td>
                    <td className="py-3 max-w-xs truncate">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Glassmorphic>
    </div>
  );
} 