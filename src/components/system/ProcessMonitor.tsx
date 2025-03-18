'use client';

import { useState, useEffect } from 'react';
import { CpuChipIcon, ServerIcon } from '@heroicons/react/24/outline';

interface Process {
  id: string;
  name: string;
  cpuUsage: number;
  memoryUsage: number;
  status: 'running' | 'stopped' | 'suspended';
}

export default function ProcessMonitor() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [sortBy, setSortBy] = useState<'cpu' | 'memory'>('cpu');

  useEffect(() => {
    // Simulated process data - in a real app, this would fetch from an API
    const mockProcesses: Process[] = [
      {
        id: '1',
        name: 'System',
        cpuUsage: 2.5,
        memoryUsage: 1.2,
        status: 'running',
      },
      {
        id: '2',
        name: 'Chrome',
        cpuUsage: 15.2,
        memoryUsage: 2.1,
        status: 'running',
      },
      {
        id: '3',
        name: 'Node.js',
        cpuUsage: 5.8,
        memoryUsage: 1.5,
        status: 'running',
      },
      {
        id: '4',
        name: 'VS Code',
        cpuUsage: 8.3,
        memoryUsage: 1.8,
        status: 'running',
      },
    ];

    setProcesses(mockProcesses);

    // Simulate process updates
    const interval = setInterval(() => {
      setProcesses(prev =>
        prev.map(process => ({
          ...process,
          cpuUsage: Math.max(0.1, process.cpuUsage + (Math.random() - 0.5) * 2),
          memoryUsage: Math.max(0.1, process.memoryUsage + (Math.random() - 0.5) * 0.2),
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const sortedProcesses = [...processes].sort((a, b) =>
    sortBy === 'cpu' ? b.cpuUsage - a.cpuUsage : b.memoryUsage - a.memoryUsage
  );

  const getStatusColor = (status: Process['status']) => {
    switch (status) {
      case 'running':
        return 'text-green-500';
      case 'stopped':
        return 'text-red-500';
      case 'suspended':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Process Monitor</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSortBy('cpu')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              sortBy === 'cpu'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            CPU
          </button>
          <button
            onClick={() => setSortBy('memory')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              sortBy === 'memory'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Memory
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {sortedProcesses.map((process) => (
          <div
            key={process.id}
            className="p-4 bg-gray-800 rounded-lg flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                {process.name[0]}
              </div>
              <div>
                <p className="text-white font-medium">{process.name}</p>
                <p className="text-sm text-gray-400">PID: {process.id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <CpuChipIcon className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-white">
                  {process.cpuUsage.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <ServerIcon className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-white">
                  {process.memoryUsage.toFixed(1)} GB
                </span>
              </div>
              <span className={`text-sm ${getStatusColor(process.status)}`}>
                {process.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 