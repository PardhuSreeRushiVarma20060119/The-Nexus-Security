'use client';

import React from 'react';
import { AlertTriangle, Server, Shield, Globe } from 'lucide-react';
import { ShodanHostInfo } from '@/lib/services/shodanService';

interface ShodanDashboardProps {
  hostInfo?: ShodanHostInfo;
}

export default function ShodanDashboard({ hostInfo }: ShodanDashboardProps) {
  if (!hostInfo) {
    return (
      <div className="p-4 text-center text-gray-400">
        No Shodan data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <Server className="w-8 h-8 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Services</p>
              <p className="text-xl font-semibold text-white">
                {hostInfo.services.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <div>
              <p className="text-sm text-gray-400">Vulnerabilities</p>
              <p className="text-xl font-semibold text-white">
                {hostInfo.vulns?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Services</h3>
        <div className="space-y-2">
          {hostInfo.services.map((service, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-700 rounded">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-white">{service.port}/{service.protocol}</span>
              </div>
              <span className="text-gray-300">
                {service.service} {service.version}
              </span>
            </div>
          ))}
        </div>
      </div>

      {hostInfo.vulns && hostInfo.vulns.length > 0 && (
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Vulnerabilities</h3>
          <div className="space-y-2">
            {hostInfo.vulns.map((vuln, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 bg-gray-700 rounded">
                <Shield className="w-4 h-4 text-red-400" />
                <span className="text-white">{vuln}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 