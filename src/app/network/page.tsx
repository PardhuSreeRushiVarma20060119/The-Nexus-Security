'use client';

import { Card, AreaChart, Title, Text } from '@tremor/react';
import { GlobeAltIcon, ServerIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const networkData = [
  { timestamp: '00:00', traffic: 42, latency: 15 },
  { timestamp: '01:00', traffic: 38, latency: 12 },
  { timestamp: '02:00', traffic: 35, latency: 14 },
  { timestamp: '03:00', traffic: 30, latency: 13 },
  { timestamp: '04:00', traffic: 32, latency: 11 },
  { timestamp: '05:00', traffic: 36, latency: 12 },
  { timestamp: '06:00', traffic: 45, latency: 16 },
  { timestamp: '07:00', traffic: 55, latency: 18 },
  { timestamp: '08:00', traffic: 70, latency: 22 },
  { timestamp: '09:00', traffic: 85, latency: 25 },
  { timestamp: '10:00', traffic: 92, latency: 28 },
  { timestamp: '11:00', traffic: 88, latency: 24 },
];

const stats = [
  {
    name: 'Active Connections',
    value: '1,284',
    icon: GlobeAltIcon,
    change: '+12.3%',
    changeType: 'positive',
  },
  {
    name: 'Average Latency',
    value: '24ms',
    icon: ServerIcon,
    change: '-3.2%',
    changeType: 'positive',
  },
  {
    name: 'Packet Loss',
    value: '0.02%',
    icon: ShieldCheckIcon,
    change: '-0.01%',
    changeType: 'positive',
  },
];

export default function NetworkPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-white mb-8">Network Monitoring</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {stats.map((stat) => (
          <Card key={stat.name} className="bg-gray-800 border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500 rounded-lg">
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">{stat.name}</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-white">{stat.value}</p>
                  <p className={`ml-2 text-sm ${
                    stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stat.change}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-gray-800 border-gray-700">
          <Title className="text-white">Network Traffic</Title>
          <Text className="text-gray-400">Packets per second</Text>
          <AreaChart
            className="h-72 mt-4"
            data={networkData}
            index="timestamp"
            categories={["traffic"]}
            colors={["purple"]}
            showLegend={false}
            valueFormatter={(value) => `${value} pps`}
            yAxisWidth={40}
          />
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <Title className="text-white">Network Latency</Title>
          <Text className="text-gray-400">Milliseconds</Text>
          <AreaChart
            className="h-72 mt-4"
            data={networkData}
            index="timestamp"
            categories={["latency"]}
            colors={["cyan"]}
            showLegend={false}
            valueFormatter={(value) => `${value}ms`}
            yAxisWidth={40}
          />
        </Card>
      </div>
    </div>
  );
} 