'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ScanOptions {
  target: string;
  type: 'quick' | 'full' | 'vulnerability' | 'port';
  ports?: string;
}

export default function ScanControls() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [options, setOptions] = useState<ScanOptions>({
    target: '',
    type: 'quick',
    ports: '',
  });

  const handleStartScan = async () => {
    try {
      setIsScanning(true);

      const response = await fetch('/api/network-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error('Failed to start scan');
      }

      router.refresh();
    } catch (error) {
      console.error('Scan error:', error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-6">Scan Controls</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Target IP/Domain
          </label>
          <input
            type="text"
            value={options.target}
            onChange={(e) => setOptions({ ...options, target: e.target.value })}
            placeholder="e.g., 192.168.1.1 or example.com"
            className="w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Scan Type
          </label>
          <select
            value={options.type}
            onChange={(e) =>
              setOptions({ ...options, type: e.target.value as ScanOptions['type'] })
            }
            className="w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="quick">Quick Scan</option>
            <option value="full">Full Scan</option>
            <option value="vulnerability">Vulnerability Scan</option>
            <option value="port">Port Scan</option>
          </select>
        </div>

        {options.type === 'port' && (
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Port Range
            </label>
            <input
              type="text"
              value={options.ports}
              onChange={(e) => setOptions({ ...options, ports: e.target.value })}
              placeholder="e.g., 80,443 or 1-1000"
              className="w-full px-3 py-2 bg-gray-800 text-white rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div className="pt-4">
          <button
            onClick={handleStartScan}
            disabled={isScanning || !options.target}
            className={`w-full px-4 py-2 text-white rounded-md transition-colors ${
              isScanning || !options.target
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isScanning ? 'Scanning...' : 'Start Scan'}
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-400">
          <h3 className="font-medium mb-2">Scan Types:</h3>
          <ul className="space-y-1 list-disc list-inside">
            <li>Quick Scan: Basic port scan (common ports)</li>
            <li>Full Scan: Comprehensive network analysis</li>
            <li>Vulnerability Scan: Security vulnerability check</li>
            <li>Port Scan: Custom port range scanning</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 