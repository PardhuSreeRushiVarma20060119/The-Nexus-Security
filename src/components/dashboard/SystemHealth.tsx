'use client';

import { CpuChipIcon, ServerIcon, WifiIcon } from '@heroicons/react/24/outline';

interface SystemHealthData {
  id: string;
  userId: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  timestamp: Date;
}

interface SystemHealthProps {
  data: SystemHealthData | null;
}

export default function SystemHealth({ data }: SystemHealthProps) {
  const metrics = [
    {
      name: 'CPU Usage',
      value: data?.cpuUsage || 0,
      icon: CpuChipIcon,
      color: 'text-blue-500',
    },
    {
      name: 'Memory',
      value: data?.memoryUsage || 0,
      icon: ServerIcon,
      color: 'text-purple-500',
    },
    {
      name: 'Network',
      value: data?.networkLatency || 0,
      icon: WifiIcon,
      color: 'text-green-500',
      unit: 'ms',
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4">System Health</h2>
      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.name} className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-opacity-10 ${metric.color} bg-current`}>
              <metric.icon className={`h-5 w-5 ${metric.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-400">{metric.name}</p>
              <div className="flex items-center space-x-2">
                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${metric.color} bg-current`}
                    style={{
                      width: `${metric.value}%`,
                    }}
                  />
                </div>
                <span className="text-sm text-white">
                  {metric.value}
                  {metric.unit || '%'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 