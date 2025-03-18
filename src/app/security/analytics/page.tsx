'use client';

import { useState, useEffect } from 'react';
import { Card, Title, Text, AreaChart, DonutChart, BarChart, Grid, Metric, Flex } from '@tremor/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface SecurityMetrics {
  threatsByType: { name: string; value: number }[];
  securityScore: number;
  scanResults: {
    date: string;
    threats: number;
    resolved: number;
  }[];
  networkActivity: {
    date: string;
    suspicious: number;
    normal: number;
  }[];
}

export default function SecurityAnalytics() {
  const { data: session } = useSession();
  const router = useRouter();
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    threatsByType: [],
    securityScore: 0,
    scanResults: [],
    networkActivity: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch security metrics
    Promise.all([
      fetch('/api/security/metrics').then(res => res.json()),
      fetch('/api/security/scan?limit=30').then(res => res.json()),
      fetch('/api/security/network?limit=30').then(res => res.json()),
    ])
      .then(([metricsData, scanData, networkData]) => {
        setMetrics({
          threatsByType: metricsData.threatsByType || [],
          securityScore: metricsData.securityScore || 0,
          scanResults: scanData.scans.map((scan: any) => ({
            date: new Date(scan.startTime).toLocaleDateString(),
            threats: scan.findings?.length || 0,
            resolved: scan.findings?.filter((f: any) => f.resolved)?.length || 0,
          })),
          networkActivity: networkData.logs.map((log: any) => ({
            date: new Date(log.timestamp).toLocaleDateString(),
            suspicious: log.metadata?.suspicious || 0,
            normal: log.metadata?.normal || 0,
          })),
        });
      })
      .catch(err => {
        console.error('Error fetching metrics:', err);
        setError('Failed to load security metrics');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (!session) {
    router.push('/auth/login');
    return null;
  }

  if (loading) {
    return (
      <div className="p-6">
        <Text>Loading security analytics...</Text>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[var(--background)]">
      <div className="mb-6">
        <Title>Security Analytics</Title>
        <Text>Comprehensive analysis of your system's security status</Text>
      </div>

      <Grid numItems={1} numItemsLg={2} className="gap-6 mb-6">
        {/* Security Score Card */}
        <Card className="p-6">
          <Title>Security Score</Title>
          <Flex className="mt-4">
            <Metric>{metrics.securityScore}%</Metric>
            <DonutChart
              data={[
                { name: 'Secure', value: metrics.securityScore },
                { name: 'At Risk', value: 100 - metrics.securityScore },
              ]}
              category="value"
              index="name"
              colors={['emerald', 'rose']}
              className="w-32 h-32"
            />
          </Flex>
        </Card>

        {/* Threats by Type Card */}
        <Card className="p-6">
          <Title>Threats by Type</Title>
          <BarChart
            data={metrics.threatsByType}
            index="name"
            categories={['value']}
            colors={['red']}
            className="mt-4"
          />
        </Card>
      </Grid>

      <Grid numItems={1} numItemsLg={2} className="gap-6">
        {/* Scan Results Trend */}
        <Card className="p-6">
          <Title>Scan Results Trend</Title>
          <AreaChart
            data={metrics.scanResults}
            index="date"
            categories={['threats', 'resolved']}
            colors={['red', 'green']}
            className="mt-4"
          />
        </Card>

        {/* Network Activity */}
        <Card className="p-6">
          <Title>Network Activity</Title>
          <AreaChart
            data={metrics.networkActivity}
            index="date"
            categories={['suspicious', 'normal']}
            colors={['red', 'blue']}
            className="mt-4"
          />
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