'use client';

import { useEffect, useState } from 'react';
import { CircleStackIcon, ServerIcon, WifiIcon } from '@heroicons/react/24/outline';

interface SystemHealthData {
  id: string;
  userId: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  timestamp: Date;
}

interface ResourceUsageProps {
  data: SystemHealthData | null;
}

interface ResourceMetric {
  name: string;
  value: number;
  total: number;
  icon: any;
  color: string;
  unit: string;
}

export default function ResourceUsage({ data }: ResourceUsageProps) {
  const [metrics, setMetrics] = useState<ResourceMetric[]>([]);

  useEffect(() => {
    setMetrics([
      {
        name: 'Memory',
        value: (data?.memoryUsage || 0) * 16, // Assuming 16GB total memory
        total: 16,
        icon: ServerIcon,
        color: 'text-purple-500',
        unit: 'GB',
      },
      {
        name: 'Disk Space',
        value: (data?.diskUsage || 0) * 5, // Assuming 500GB total disk space
        total: 500,
        icon: CircleStackIcon,
        color: 'text-blue-500',
        unit: 'GB',
      },
      {
        name: 'Network',
        value: data?.networkLatency || 0,
        total: 100,
        icon: WifiIcon,
        color: 'text-green-500',
        unit: 'ms',
      },
    ]);
  }, [data]);

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-6">Resource Usage</h2>
      <div className="space-y-6">
        {metrics.map((metric) => (
          <div key={metric.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-opacity-10 ${metric.color} bg-current`}>
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <span className="text-sm text-gray-400">{metric.name}</span>
              </div>
              <span className="text-sm text-white">
                {metric.value.toFixed(1)} / {metric.total} {metric.unit}
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${metric.color} bg-current transition-all duration-500`}
                style={{ width: `${(metric.value / metric.total) * 100}%` }}
              />
            </div>
          </div>
        ))}

        {/* Resource Alerts */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <h3 className="text-sm font-medium text-white mb-4">Resource Alerts</h3>
          <div className="space-y-3">
            {metrics.map((metric) => {
              const usage = (metric.value / metric.total) * 100;
              if (usage > 80) {
                return (
                  <div
                    key={`${metric.name}-alert`}
                    className="p-3 bg-red-500/10 text-red-400 rounded-lg text-sm"
                  >
                    High {metric.name.toLowerCase()} usage detected ({usage.toFixed(1)}%)
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 