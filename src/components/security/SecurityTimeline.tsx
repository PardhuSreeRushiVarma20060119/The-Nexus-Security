'use client';

import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Check, Clock, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';

interface SecurityEvent {
  id: string;
  type: string;
  event: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  timestamp: string;
  metadata?: any;
  source: string;
}

interface TimelineStats {
  date: string;
  events: number;
  threats: number;
}

export default function SecurityTimeline() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState<TimelineStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    const fetchEvents = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/security/events?range=${timeRange}`);
        if (!response.ok) throw new Error('Failed to fetch security events');
        
        const data = await response.json();
        setEvents(data.events || []);
        setStats(data.stats || []);
        setError(null);
      } catch (err) {
        setError('Failed to load security events');
        console.error('Error fetching security events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [session?.user?.id, timeRange]);

  const filteredEvents = (events || []).filter(event => {
    if (!event) return false;
    const description = event.description || '';
    const type = event.type || '';
    const eventName = event.event || '';
    return (
      description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eventName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-red-500/10 text-red-500';
      case 'high':
        return 'bg-orange-500/10 text-orange-500';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'low':
        return 'bg-green-500/10 text-green-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getEventIcon = (type: string) => {
    if (type.includes('THREAT')) return <Shield className="h-5 w-5 text-red-500" />;
    if (type.includes('SCAN')) return <Search className="h-5 w-5 text-green-500" />;
    if (type.includes('AUTH')) return <Shield className="h-5 w-5 text-blue-500" />;
    return <Clock className="h-5 w-5 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-md bg-gray-900/40 p-6 rounded-xl border border-gray-200/20 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Security Timeline</h2>
          <div className="flex space-x-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>

        <div className="h-[200px] mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.8)',
                  border: '1px solid rgba(75, 85, 99, 0.2)',
                  borderRadius: '0.5rem',
                }}
              />
              <Line
                type="monotone"
                dataKey="events"
                stroke="#3B82F6"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="threats"
                stroke="#EF4444"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search security events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start space-x-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-700/50 transition-colors duration-200"
              >
                <div className="flex-shrink-0">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-white">
                      {event.event}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(
                        event.severity
                      )}`}
                    >
                      {event.severity}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-300">
                    {event.description}
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    {format(new Date(event.timestamp), 'MMM d, yyyy HH:mm:ss')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 bg-gray-800 rounded-lg">
              <p className="text-gray-400">No security events found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 