'use client';

import { useState, useEffect } from 'react';
import { Card, Title, Text, Button, Badge, Grid } from '@tremor/react';
import { ShieldCheckIcon, WifiIcon, LockClosedIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SecurityTools() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if network monitoring is enabled
    fetch('/api/security/network')
      .then(res => res.json())
      .then(data => {
        setIsMonitoring(data.isActive || false);
      })
      .catch(console.error);
  }, []);

  const handleQuickScan = async () => {
    try {
      setIsScanning(true);
      setError('');

      const response = await fetch('/api/security/scan', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Scan failed');
      }

      setScanResults(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Scan failed');
    } finally {
      setIsScanning(false);
    }
  };

  const toggleNetworkMonitoring = async () => {
    try {
      setError('');

      const response = await fetch('/api/security/network', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: isMonitoring ? 'stop' : 'start',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to toggle network monitoring');
      }

      setIsMonitoring(!isMonitoring);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Operation failed');
    }
  };

  if (!session) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="p-6 bg-[var(--background)]">
      <div className="mb-6">
        <Title>Security Tools</Title>
        <Text>Protect your system with our comprehensive security suite</Text>
      </div>

      <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
        {/* Quick Scan Card */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-green-500" />
            <div>
              <Title className="text-xl">Quick Scan</Title>
              <Text>Scan your system for potential threats</Text>
            </div>
          </div>

          <Button
            className="w-full mb-4"
            loading={isScanning}
            onClick={handleQuickScan}
          >
            {isScanning ? 'Scanning...' : 'Start Scan'}
          </Button>

          {scanResults && (
            <div className="mt-4">
              <Badge color={scanResults.severity === 'HIGH' ? 'red' : 'green'}>
                {scanResults.findings.length} findings
              </Badge>
              <div className="mt-2">
                {scanResults.findings.map((finding: any, index: number) => (
                  <Text key={index} className="text-sm">
                    • {finding.type}: {finding.description}
                  </Text>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Network Monitoring Card */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <WifiIcon className="w-8 h-8 text-blue-500" />
            <div>
              <Title className="text-xl">Network Monitoring</Title>
              <Text>Monitor network activity in real-time</Text>
            </div>
          </div>

          <Button
            className="w-full mb-4"
            color={isMonitoring ? 'red' : 'blue'}
            onClick={toggleNetworkMonitoring}
          >
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>

          <Badge color={isMonitoring ? 'green' : 'gray'}>
            {isMonitoring ? 'Active' : 'Inactive'}
          </Badge>
        </Card>

        {/* Security Settings Card */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <LockClosedIcon className="w-8 h-8 text-purple-500" />
            <div>
              <Title className="text-xl">Security Settings</Title>
              <Text>Configure your security preferences</Text>
            </div>
          </div>

          <Button
            className="w-full"
            variant="secondary"
            onClick={() => router.push('/settings/security')}
          >
            Manage Settings
          </Button>
        </Card>

        {/* Security Analytics Card */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <ChartBarIcon className="w-8 h-8 text-yellow-500" />
            <div>
              <Title className="text-xl">Security Analytics</Title>
              <Text>View detailed security reports and insights</Text>
            </div>
          </div>

          <Button
            className="w-full"
            variant="secondary"
            onClick={() => router.push('/security/analytics')}
          >
            View Analytics
          </Button>
        </Card>
      </Grid>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
} 