'use client';

import { useEffect, useState } from 'react';
import { CpuChipIcon, ServerIcon } from '@heroicons/react/24/outline';

interface SystemHealthData {
  id: string;
  userId: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  timestamp: Date;
}

interface SystemPerformanceProps {
  data: SystemHealthData | null;
}

interface PerformanceMetric {
  name: string;
  value: number;
  icon: any;
  color: string;
  unit: string;
}

export default function SystemPerformance({ data }: SystemPerformanceProps) {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);

  useEffect(() => {
    setMetrics([
      {
        name: 'CPU Usage',
        value: data?.cpuUsage || 0,
        icon: CpuChipIcon,
        color: 'text-blue-500',
        unit: '%',
      },
      {
        name: 'Memory Usage',
        value: data?.memoryUsage || 0,
        icon: ServerIcon,
        color: 'text-purple-500',
        unit: '%',
      },
    ]);
  }, [data]);

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-6">System Performance</h2>
      <div className="space-y-6">
        {metrics.map((metric) => (
          <div key={metric.name} className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-opacity-10 ${metric.color} bg-current`}>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400">{metric.name}</p>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${metric.color} bg-current transition-all duration-500`}
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                  <span className="text-sm text-white">
                    {metric.value.toFixed(1)}
                    {metric.unit}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Performance History */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <h3 className="text-sm font-medium text-white mb-4">Performance History</h3>
          <div className="h-48 bg-gray-800 rounded-lg flex items-end p-4">
            {/* Placeholder for performance graph */}
            <div className="w-full h-full flex items-end justify-between">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="w-4 bg-blue-500 rounded-t"
                  style={{
                    height: `${Math.random() * 100}%`,
                    opacity: 0.2 + (i / 12) * 0.8,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 