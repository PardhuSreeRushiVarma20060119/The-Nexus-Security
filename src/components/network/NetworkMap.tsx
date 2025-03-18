'use client';

import { useEffect, useRef } from 'react';
import { ComputerDesktopIcon, ServerIcon } from '@heroicons/react/24/outline';

interface NetworkNode {
  id: string;
  type: 'server' | 'device';
  name: string;
  status: 'online' | 'offline' | 'vulnerable';
  ip: string;
}

interface NetworkMapProps {
  nodes: NetworkNode[];
}

export default function NetworkMap({ nodes = [] }: NetworkMapProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-500 bg-green-500/10';
      case 'offline':
        return 'text-red-500 bg-red-500/10';
      case 'vulnerable':
        return 'text-yellow-500 bg-yellow-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'server':
        return <ServerIcon className="h-6 w-6" />;
      case 'device':
        return <ComputerDesktopIcon className="h-6 w-6" />;
      default:
        return <ComputerDesktopIcon className="h-6 w-6" />;
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-white mb-6">Network Map</h2>
      
      {nodes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {nodes.map((node) => (
            <div
              key={node.id}
              className="p-4 bg-gray-700 rounded-lg flex items-start space-x-3"
            >
              <div className={`p-2 rounded-full ${getStatusColor(node.status)}`}>
                {getNodeIcon(node.type)}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{node.name}</p>
                <p className="text-xs text-gray-400 mt-1">{node.ip}</p>
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${getStatusColor(
                    node.status
                  )}`}
                >
                  {node.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-400">No network devices detected</p>
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Run Network Discovery
          </button>
        </div>
      )}

      {nodes.length > 0 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-400">Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-400">Offline</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-xs text-gray-400">Vulnerable</span>
            </div>
          </div>
          <button className="text-sm text-blue-500 hover:text-blue-400">
            View Details
          </button>
        </div>
      )}
    </div>
  );
} 