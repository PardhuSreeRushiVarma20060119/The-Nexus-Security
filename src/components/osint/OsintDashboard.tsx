'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Globe, Search, Shield } from 'lucide-react';
import axios from 'axios';

interface OsintStats {
  totalScans: number;
  activeThreats: number;
  domainScanned: number;
  vulnerabilities: number;
}

export default function OsintDashboard() {
  const [stats, setStats] = useState<OsintStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get<OsintStats>('/api/osint/stats');
        if (response.data && typeof response.data === 'object') {
          const { totalScans, activeThreats, domainScanned, vulnerabilities } = response.data;
          if (
            typeof totalScans === 'number' &&
            typeof activeThreats === 'number' &&
            typeof domainScanned === 'number' &&
            typeof vulnerabilities === 'number'
          ) {
            setStats(response.data);
            setError(null);
          } else {
            setError('Invalid data format received from server');
          }
        }
      } catch (error: any) {
        if (error?.response?.status === 401) {
          setError('Please sign in to view OSINT stats');
        } else {
          setError('Failed to fetch OSINT stats. Please try again later.');
        }
        console.error('Failed to fetch OSINT stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="backdrop-blur-sm bg-red-50/30 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg" role="alert">
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="backdrop-blur-sm bg-yellow-50/30 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg shadow-lg" role="alert">
        <p className="font-medium">No stats available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">OSINT Overview</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="backdrop-blur-md bg-gray-800/70 p-6 rounded-xl border border-gray-700/50 shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-gray-800/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Scans</p>
              <p className="text-3xl font-semibold text-white tracking-tight">{stats.totalScans}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-500/10">
              <Activity className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </div>
        <div className="backdrop-blur-md bg-gray-800/70 p-6 rounded-xl border border-gray-700/50 shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-gray-800/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Active Threats</p>
              <p className="text-3xl font-semibold text-red-400 tracking-tight">{stats.activeThreats}</p>
            </div>
            <div className="p-3 rounded-full bg-red-500/10">
              <Shield className="h-8 w-8 text-red-400" />
            </div>
          </div>
        </div>
        <div className="backdrop-blur-md bg-gray-800/70 p-6 rounded-xl border border-gray-700/50 shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-gray-800/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Domains Scanned</p>
              <p className="text-3xl font-semibold text-green-400 tracking-tight">{stats.domainScanned}</p>
            </div>
            <div className="p-3 rounded-full bg-green-500/10">
              <Globe className="h-8 w-8 text-green-400" />
            </div>
          </div>
        </div>
        <div className="backdrop-blur-md bg-gray-800/70 p-6 rounded-xl border border-gray-700/50 shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-gray-800/80">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Vulnerabilities</p>
              <p className="text-3xl font-semibold text-yellow-400 tracking-tight">{stats.vulnerabilities}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-500/10">
              <Search className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 