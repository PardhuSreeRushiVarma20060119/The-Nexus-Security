'use client';

import { Card } from '@tremor/react';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

const threats = [
  {
    id: 1,
    name: 'SQL Injection Attempt',
    severity: 'High',
    status: 'Active',
    source: '192.168.1.100',
    timestamp: '2024-03-09T10:30:00',
  },
  {
    id: 2,
    name: 'Brute Force Attack',
    severity: 'Medium',
    status: 'Blocked',
    source: '10.0.0.15',
    timestamp: '2024-03-09T09:45:00',
  },
  {
    id: 3,
    name: 'XSS Attempt',
    severity: 'High',
    status: 'Investigating',
    source: '172.16.0.50',
    timestamp: '2024-03-09T08:15:00',
  },
];

export default function ThreatsPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <ShieldExclamationIcon className="h-8 w-8 text-red-500" />
        <h1 className="text-2xl font-semibold text-white">Active Threats</h1>
      </div>

      <div className="grid gap-6">
        {threats.map((threat) => (
          <Card key={threat.id} className="bg-gray-800 border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-white">{threat.name}</h3>
                <div className="mt-1 flex items-center gap-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    threat.severity === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {threat.severity}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    threat.status === 'Active' 
                      ? 'bg-red-500/10 text-red-500'
                      : threat.status === 'Blocked'
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    {threat.status}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Source IP</p>
                <p className="font-mono text-white">{threat.source}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {new Date(threat.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Card className="bg-gray-800 border-gray-700">
          <h2 className="text-lg font-medium text-white mb-4">Mitigation Actions</h2>
          <div className="space-y-4">
            <button className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
              Block All Suspicious IPs
            </button>
            <button className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
              Generate Threat Report
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
} 