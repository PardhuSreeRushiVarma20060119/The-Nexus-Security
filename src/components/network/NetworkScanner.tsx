'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Network } from 'vis-network/standalone';
import { Shield, Activity, AlertTriangle, Check } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface NetworkNode {
  id: string;
  label: string;
  title: string;
  color: string;
  shape: string;
}

interface NetworkEdge {
  from: string;
  to: string;
  color: string;
  width: number;
}

interface ScanResult {
  ip: string;
  ports: {
    port: number;
    state: string;
    service: string;
    version?: string;
  }[];
  os?: string;
  vulnerabilities?: string[];
}

export default function NetworkScanner() {
  const { data: session } = useSession();
  const [isScanning, setIsScanning] = useState(false);
  const [targetNetwork, setTargetNetwork] = useState('');
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstance = useRef<Network | null>(null);

  useEffect(() => {
    if (networkRef.current && scanResults.length > 0) {
      const nodes: NetworkNode[] = scanResults.map(result => ({
        id: result.ip,
        label: result.ip,
        title: `OS: ${result.os || 'Unknown'}\nOpen Ports: ${result.ports.length}`,
        color: result.vulnerabilities?.length ? '#ef4444' : '#22c55e',
        shape: 'dot'
      }));

      const edges: NetworkEdge[] = scanResults.map((result, index) => ({
        from: '192.168.1.1', // Gateway
        to: result.ip,
        color: result.vulnerabilities?.length ? '#ef4444' : '#22c55e',
        width: 2
      }));

      // Add gateway node
      nodes.unshift({
        id: '192.168.1.1',
        label: 'Gateway',
        title: 'Network Gateway',
        color: '#3b82f6',
        shape: 'diamond'
      });

      const data = {
        nodes: nodes,
        edges: edges
      };

      const options = {
        nodes: {
          size: 20,
          font: {
            size: 14,
            color: '#ffffff'
          }
        },
        edges: {
          smooth: {
            type: 'continuous'
          }
        },
        physics: {
          stabilization: false,
          barnesHut: {
            gravitationalConstant: -80000,
            springConstant: 0.001,
            springLength: 200
          }
        }
      };

      networkInstance.current = new Network(networkRef.current, data, options as any);
    }
  }, [scanResults]);

  const handleScan = async () => {
    if (!session?.user?.id) {
      setError('Please sign in to use the network scanner');
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      const response = await fetch('/api/network/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ target: targetNetwork }),
      });

      if (!response.ok) {
        throw new Error('Network scan failed');
      }

      const results = await response.json();
      setScanResults(results);

      // Log the scan
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'NETWORK_SCAN',
          severity: results.some((r: ScanResult) => r.vulnerabilities?.length ?? 0 > 0) ? 'HIGH' : 'LOW',
          description: `Network scan completed for ${targetNetwork}`,
          metadata: { results }
        }),
      });
    } catch (err) {
      setError('Failed to perform network scan. Please try again.');
      console.error('Scan failed:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const generateReport = async () => {
    if (!scanResults.length) return;

    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'network_scan',
          data: {
            timestamp: new Date().toISOString(),
            target: targetNetwork,
            results: scanResults
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `network-scan-report-${new Date().toISOString()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to generate report');
      console.error('Report generation failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-md bg-gray-900/40 p-6 rounded-xl border border-gray-200/20 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-white">Network Scanner</h2>
        
        <div className="flex space-x-4 mb-6">
          <input
            type="text"
            value={targetNetwork}
            onChange={(e) => setTargetNetwork(e.target.value)}
            placeholder="Enter target network (e.g., 192.168.1.0/24)"
            className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
          />
          <button
            onClick={handleScan}
            disabled={isScanning || !targetNetwork}
            className={`px-6 py-2 rounded-lg text-white font-medium transition-all duration-300 ${
              isScanning || !targetNetwork
                ? 'bg-gray-700/50 cursor-not-allowed'
                : 'bg-blue-500/80 hover:bg-blue-500 hover:shadow-md hover:shadow-blue-500/20'
            }`}
          >
            {isScanning ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>Scanning...</span>
              </div>
            ) : (
              'Start Scan'
            )}
          </button>
        </div>

        {error && (
          <div className="mb-6 backdrop-blur-md bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl shadow-lg">
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div ref={networkRef} className="h-[500px] bg-gray-900/50 rounded-lg border border-gray-700/50" />

        {scanResults.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-white">Scan Results</h3>
              <button
                onClick={generateReport}
                className="px-4 py-2 bg-green-500/80 hover:bg-green-500 text-white rounded-lg transition-all duration-300 hover:shadow-md hover:shadow-green-500/20"
              >
                Generate Report
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scanResults.map((result) => (
                <div
                  key={result.ip}
                  className="backdrop-blur-md bg-gray-800/50 p-4 rounded-lg border border-gray-700/50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-medium text-white">{result.ip}</h4>
                    {result.vulnerabilities?.length ? (
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                    ) : (
                      <Check className="h-5 w-5 text-green-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-2">OS: {result.os || 'Unknown'}</p>
                  <div className="space-y-2">
                    {result.ports.map((port) => (
                      <div
                        key={port.port}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-300">
                          {port.port}/{port.service}
                        </span>
                        <span className={`${
                          port.state === 'open' ? 'text-green-400' : 'text-gray-500'
                        }`}>
                          {port.state}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 