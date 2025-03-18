'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Server, Cpu, HardDrive, Network, AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import Glassmorphic from '@/components/ui/Glassmorphic';

interface SystemHealth {
  cpu: {
    usage: number;
    cores: number;
    temperature: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
  };
  network: {
    bytesReceived: number;
    bytesSent: number;
    connections: number;
  };
  uptime: number;
  platform: string;
  hostname: string;
}

export default function SystemHealthPage() {
  const { data: session } = useSession();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('/api/admin/system/health');
        if (!response.ok) throw new Error('Failed to fetch system health');
        const data = await response.json();
        setHealth(data);
      } catch (err) {
        setError('Failed to load system health data');
        toast.error('Failed to load system health data');
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !health) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500 flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error || 'Failed to load system health data'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Glassmorphic className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Activity className="h-6 w-6 text-blue-500" />
          <h2 className="text-xl font-semibold text-white">System Health</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* CPU Usage */}
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
            <div className="flex items-center space-x-2 mb-2">
              <Cpu className="h-5 w-5 text-blue-500" />
              <h3 className="text-sm font-medium text-gray-300">CPU Usage</h3>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Usage</span>
                <span className="text-white">{health.cpu.usage.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Cores</span>
                <span className="text-white">{health.cpu.cores}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Temperature</span>
                <span className="text-white">{health.cpu.temperature.toFixed(1)}°C</span>
              </div>
            </div>
          </div>

          {/* Memory Usage */}
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
            <div className="flex items-center space-x-2 mb-2">
              <Server className="h-5 w-5 text-green-500" />
              <h3 className="text-sm font-medium text-gray-300">Memory</h3>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total</span>
                <span className="text-white">{formatBytes(health.memory.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Used</span>
                <span className="text-white">{formatBytes(health.memory.used)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Free</span>
                <span className="text-white">{formatBytes(health.memory.free)}</span>
              </div>
            </div>
          </div>

          {/* Disk Usage */}
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
            <div className="flex items-center space-x-2 mb-2">
              <HardDrive className="h-5 w-5 text-yellow-500" />
              <h3 className="text-sm font-medium text-gray-300">Disk</h3>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total</span>
                <span className="text-white">{formatBytes(health.disk.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Used</span>
                <span className="text-white">{formatBytes(health.disk.used)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Free</span>
                <span className="text-white">{formatBytes(health.disk.free)}</span>
              </div>
            </div>
          </div>

          {/* Network Stats */}
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
            <div className="flex items-center space-x-2 mb-2">
              <Network className="h-5 w-5 text-purple-500" />
              <h3 className="text-sm font-medium text-gray-300">Network</h3>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Received</span>
                <span className="text-white">{formatBytes(health.network.bytesReceived)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Sent</span>
                <span className="text-white">{formatBytes(health.network.bytesSent)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Connections</span>
                <span className="text-white">{health.network.connections}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
            <h3 className="text-sm font-medium text-gray-300 mb-2">System Info</h3>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Platform</span>
                <span className="text-white">{health.platform}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Hostname</span>
                <span className="text-white">{health.hostname}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Uptime</h3>
            <div className="text-2xl font-semibold text-white">
              {formatUptime(health.uptime)}
            </div>
          </div>
        </div>
      </Glassmorphic>
    </div>
  );
} 