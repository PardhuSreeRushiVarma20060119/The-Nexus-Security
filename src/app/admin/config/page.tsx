'use client';

import { useState, useEffect } from 'react';
import Glassmorphic from '@/components/ui/Glassmorphic';
import { Settings, Save, RefreshCcw, Server } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ServerConfig {
  maxUploadSize: number;
  scanTimeout: number;
  maxConcurrentScans: number;
  enableLogging: boolean;
  debugMode: boolean;
}

interface SystemStats {
  cpu: number;
  memory: {
    total: number;
    used: number;
    free: number;
  };
  uptime: number;
  platform: string;
  hostname: string;
}

export default function ServerConfigPage() {
  const [config, setConfig] = useState<ServerConfig>({
    maxUploadSize: 100,
    scanTimeout: 300,
    maxConcurrentScans: 5,
    enableLogging: true,
    debugMode: false,
  });

  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/system');
      if (!response.ok) throw new Error('Failed to fetch system data');
      const data = await response.json();
      setConfig(data.config);
      setStats(data.stats);
    } catch (error) {
      toast.error('Failed to load system data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch('/api/admin/system', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!response.ok) throw new Error('Failed to update configuration');
      
      toast.success('Configuration updated successfully');
    } catch (error) {
      toast.error('Failed to update configuration');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <Settings className="w-6 h-6 mr-2" />
          Server Configuration
        </h1>
        <button 
          className="flex items-center px-4 py-2 text-gray-400 hover:text-white"
          onClick={fetchData}
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Glassmorphic className="p-6">
          <div className="flex items-center mb-4">
            <Server className="w-6 h-6 mr-2" />
            <h2 className="text-xl font-semibold">System Settings</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Max Upload Size (MB)
              </label>
              <input
                type="number"
                value={config.maxUploadSize}
                onChange={(e) => setConfig({
                  ...config,
                  maxUploadSize: parseInt(e.target.value)
                })}
                className="w-full px-3 py-2 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Scan Timeout (seconds)
              </label>
              <input
                type="number"
                value={config.scanTimeout}
                onChange={(e) => setConfig({
                  ...config,
                  scanTimeout: parseInt(e.target.value)
                })}
                className="w-full px-3 py-2 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Max Concurrent Scans
              </label>
              <input
                type="number"
                value={config.maxConcurrentScans}
                onChange={(e) => setConfig({
                  ...config,
                  maxConcurrentScans: parseInt(e.target.value)
                })}
                className="w-full px-3 py-2 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enableLogging"
                checked={config.enableLogging}
                onChange={(e) => setConfig({
                  ...config,
                  enableLogging: e.target.checked
                })}
                className="w-4 h-4"
              />
              <label htmlFor="enableLogging" className="text-sm font-medium">
                Enable Detailed Logging
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="debugMode"
                checked={config.debugMode}
                onChange={(e) => setConfig({
                  ...config,
                  debugMode: e.target.checked
                })}
                className="w-4 h-4"
              />
              <label htmlFor="debugMode" className="text-sm font-medium">
                Debug Mode
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </form>
        </Glassmorphic>

        <Glassmorphic className="p-6">
          <div className="flex items-center mb-4">
            <Settings className="w-6 h-6 mr-2" />
            <h2 className="text-xl font-semibold">System Status</h2>
          </div>
          
          {loading ? (
            <div className="text-center py-4">Loading system stats...</div>
          ) : stats ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">System Status</span>
                <span className="text-green-400">Running</span>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-400">CPU Usage</span>
                  <span className="font-semibold">{stats.cpu.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${stats.cpu}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-400">Memory Usage</span>
                  <span className="font-semibold">
                    {formatBytes(stats.memory.used)} / {formatBytes(stats.memory.total)}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(stats.memory.used / stats.memory.total) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Platform</span>
                <span className="font-semibold">{stats.platform}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Hostname</span>
                <span className="font-semibold">{stats.hostname}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Uptime</span>
                <span className="font-semibold">{formatUptime(stats.uptime)}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-red-400">
              Failed to load system stats
            </div>
          )}
        </Glassmorphic>
      </div>
    </div>
  );
} 