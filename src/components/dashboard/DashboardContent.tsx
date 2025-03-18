'use client';

import { Card, Text, Metric, AreaChart, DonutChart, Title, TabGroup, TabList, Tab, TabPanels, TabPanel, Color } from '@tremor/react';

const securityScore = 94;
const systemMetrics = [
  { name: 'Open Ports', value: '12' },
  { name: 'Active Services', value: '24' },
  { name: 'Security Updates', value: '3' },
  { name: 'Vulnerabilities', value: '2' },
];

const threatHistory = [
  { date: "Jan 1", threats: 12 },
  { date: "Jan 2", threats: 8 },
  { date: "Jan 3", threats: 15 },
  { date: "Jan 4", threats: 3 },
  { date: "Jan 5", threats: 5 },
  { date: "Jan 6", threats: 2 },
  { date: "Jan 7", threats: 0 },
];

const threatCategories = [
  { name: "Malware", count: 15, color: "#ef4444" },  // Red
  { name: "Network", count: 8, color: "#f97316" },   // Orange
  { name: "Access", count: 5, color: "#22c55e" },    // Green
];

// Define chart colors
const chartColors: Color[] = ["green", "red"];

// Define formatters outside component to avoid recreation
const formatPercentage = (value: number) => `${value}%`;
const formatThreats = (value: number) => `${value} threats`;

export default function DashboardContent() {
  return (
    <div className="container py-6 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Security Score Panel */}
        <Card className="p-6 bg-[var(--background)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Security Score</h2>
            <span className={`px-2.5 py-1 rounded-full text-sm font-medium ${
              securityScore >= 90 ? 'bg-green-500/10 text-green-500' :
              securityScore >= 70 ? 'bg-orange-500/10 text-orange-500' :
              'bg-red-500/10 text-red-500'
            }`}>
              {securityScore}% Secure
            </span>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="relative">
              <div className="w-full h-40">
                <DonutChart
                  data={[
                    { name: "Secure", value: securityScore },
                    { name: "At Risk", value: 100 - securityScore }
                  ]}
                  category="value"
                  index="name"
                  valueFormatter={formatPercentage}
                  showAnimation={true}
                  className="mt-2"
                  colors={["teal", "rose"]}
                  variant="donut"
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-2xl font-bold text-[var(--text-primary)]">{securityScore}%</span>
                  <span className="block text-xs text-[var(--text-secondary)]">Protected</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[var(--text-secondary)]">Critical Issues</span>
                  <span className="text-sm font-medium" style={{ color: chartColors[1] }}>2</span>
                </div>
                <div className={`h-2 bg-red-500/10 rounded-full overflow-hidden`}>
                  <div className="h-full rounded-full" style={{ width: '20%', backgroundColor: chartColors[1] }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[var(--text-secondary)]">Warnings</span>
                  <span className="text-sm font-medium text-orange-500">5</span>
                </div>
                <div className={`h-2 bg-orange-500/10 rounded-full overflow-hidden`}>
                  <div className="h-full rounded-full bg-orange-500" style={{ width: '50%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[var(--text-secondary)]">Passed Checks</span>
                  <span className="text-sm font-medium" style={{ color: chartColors[0] }}>43</span>
                </div>
                <div className={`h-2 bg-green-500/10 rounded-full overflow-hidden`}>
                  <div className="h-full rounded-full" style={{ width: '90%', backgroundColor: chartColors[0] }} />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Threat Detection Panel */}
        <Card className="p-6 bg-[var(--background)]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Threat Detection History</h2>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                {threatHistory[threatHistory.length - 1].threats} Active Threats
              </span>
            </div>
          </div>
          <div className="h-40">
            <AreaChart
              data={threatHistory}
              index="date"
              categories={["threats"]}
              colors={["#ef4444"]}  // Red for threats
              showAnimation={true}
              showLegend={false}
              valueFormatter={formatThreats}
              curveType="monotone"
            />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            {threatCategories.map((category) => (
              <div key={category.name} className="text-center">
                <div className="text-2xl font-semibold" style={{ color: category.color }}>
                  {category.count}
                </div>
                <div className="text-xs text-[var(--text-secondary)]">{category.name}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {systemMetrics.map((metric) => (
          <Card key={metric.name} className="bg-[var(--background)] border border-[var(--border)] ring-0">
            <Text className="text-[var(--text-secondary)]">{metric.name}</Text>
            <Metric className="text-[var(--text-primary)]">{metric.value}</Metric>
          </Card>
        ))}
      </div>

      <Card className="bg-[var(--background)] border border-[var(--border)] ring-0">
        <Title className="text-[var(--text-primary)]">System Analysis</Title>
        <TabGroup>
          <TabList className="mt-6">
            <Tab className="text-[var(--text-secondary)] data-[state=active]:text-[var(--text-primary)] data-[state=active]:bg-[var(--background)] border-b-2 border-transparent data-[state=active]:border-[var(--primary)]">
              Network Status
            </Tab>
            <Tab className="text-[var(--text-secondary)] data-[state=active]:text-[var(--text-primary)] data-[state=active]:bg-[var(--background)] border-b-2 border-transparent data-[state=active]:border-[var(--primary)]">
              Security Alerts
            </Tab>
            <Tab className="text-[var(--text-secondary)] data-[state=active]:text-[var(--text-primary)] data-[state=active]:bg-[var(--background)] border-b-2 border-transparent data-[state=active]:border-[var(--primary)]">
              System Health
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <div className="mt-4 space-y-2">
                <Text className="text-[var(--text-secondary)]">Active Network Connections: 45</Text>
                <Text className="text-[var(--text-secondary)]">Bandwidth Usage: 2.5 MB/s</Text>
                <Text className="text-[var(--text-secondary)]">Firewall Status: Active</Text>
              </div>
            </TabPanel>
            <TabPanel>
              <div className="mt-4 space-y-2">
                <Text className="text-[var(--text-secondary)]">Critical Alerts: 0</Text>
                <Text className="text-[var(--text-secondary)]">Warning Alerts: 2</Text>
                <Text className="text-[var(--text-secondary)]">Info Alerts: 5</Text>
              </div>
            </TabPanel>
            <TabPanel>
              <div className="mt-4 space-y-2">
                <Text className="text-[var(--text-secondary)]">CPU Usage: 45%</Text>
                <Text className="text-[var(--text-secondary)]">Memory Usage: 60%</Text>
                <Text className="text-[var(--text-secondary)]">Disk Usage: 55%</Text>
              </div>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </Card>

      <Card className="bg-[var(--background)] border border-[var(--border)] ring-0">
        <Title className="text-[var(--text-primary)]">AI Security Recommendations</Title>
        <div className="mt-4 space-y-4">
          <div className="p-4 bg-[var(--background)] border border-[var(--error)] border-opacity-20 rounded-lg">
            <Text className="text-[var(--text-secondary)]">⚠️ Consider enabling two-factor authentication for all admin accounts</Text>
          </div>
          <div className="p-4 bg-[var(--background)] border border-[var(--warning)] border-opacity-20 rounded-lg">
            <Text className="text-[var(--text-secondary)]">💡 Update system packages to patch recently discovered vulnerabilities</Text>
          </div>
          <div className="p-4 bg-[var(--background)] border border-[var(--success)] border-opacity-20 rounded-lg">
            <Text className="text-[var(--text-secondary)]">✅ Firewall rules are properly configured</Text>
          </div>
        </div>
      </Card>
    </div>
  );
} 