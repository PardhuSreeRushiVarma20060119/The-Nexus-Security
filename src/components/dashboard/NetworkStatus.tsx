'use client';

import { WifiIcon, ServerIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

export default function NetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState({
    uptime: '99.9%',
    activeConnections: 12,
    bandwidth: '1.2 GB/s',
    latency: '25ms',
  });

  const metrics = [
    {
      name: 'Network Uptime',
      value: networkStatus.uptime,
      icon: WifiIcon,
      color: 'text-green-500',
    },
    {
      name: 'Active Connections',
      value: networkStatus.activeConnections,
      icon: ServerIcon,
      color: 'text-blue-500',
    },
    {
      name: 'Bandwidth',
      value: networkStatus.bandwidth,
      icon: GlobeAltIcon,
      color: 'text-purple-500',
    },
  ];

  // Simulated network monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      // In a real application, this would fetch real-time network data
      setNetworkStatus(prev => ({
        ...prev,
        activeConnections: Math.floor(Math.random() * 20) + 10,
        latency: `${Math.floor(Math.random() * 30) + 15}ms`,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4">Network Status</h2>
      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.name} className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-opacity-10 ${metric.color} bg-current`}>
              <metric.icon className={`h-5 w-5 ${metric.color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-400">{metric.name}</p>
              <p className={`text-base font-medium ${metric.color}`}>
                {metric.value}
              </p>
            </div>
          </div>
        ))}

        {/* Network Latency Indicator */}
        <div className="mt-4 p-3 bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Current Latency</span>
            <span className="text-sm font-medium text-green-500">
              {networkStatus.latency}
            </span>
          </div>
          <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{
                width: `${Math.min(
                  (parseInt(networkStatus.latency) / 100) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 