import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';

interface SecurityEvent {
  id: string;
  type: string;
  event: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details: string;
  timestamp: Date;
  source: string;
  userId: string;
}

interface TimelineStat {
  date: string;
  events: number;
  threats: number;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '24h';

    // Calculate the start time based on the range
    const now = new Date();
    let startTime = new Date();
    switch (range) {
      case '1h':
        startTime.setHours(now.getHours() - 1);
        break;
      case '24h':
        startTime.setHours(now.getHours() - 24);
        break;
      case '7d':
        startTime.setDate(now.getDate() - 7);
        break;
      case '30d':
        startTime.setDate(now.getDate() - 30);
        break;
    }

    // Fetch events and stats
    const [events, stats] = await Promise.all([
      prisma.securityLog.findMany({
        where: {
          userId: session.user.id,
          timestamp: {
            gte: startTime
          }
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: 50
      }),
      prisma.securityLog.groupBy({
        by: ['timestamp'],
        where: {
          userId: session.user.id,
          timestamp: {
            gte: startTime
          }
        },
        _count: {
          _all: true,
          severity: {
            where: {
              severity: 'HIGH'
            }
          }
        }
      })
    ]);

    // Format stats for the chart
    const formattedStats = stats.map((stat: { timestamp: Date; _count: { _all: number; severity: number } }) => ({
      date: format(stat.timestamp, 'MMM d, yyyy'),
      events: stat._count._all,
      threats: stat._count.severity
    }));

    // Format events for the timeline
    const formattedEvents = events.map((event: SecurityEvent) => ({
      id: event.id,
      type: event.type,
      event: event.event,
      severity: event.severity,
      description: event.details,
      timestamp: event.timestamp.toISOString(),
      source: event.source
    }));

    return NextResponse.json({
      events: formattedEvents,
      stats: formattedStats
    });
  } catch (error) {
    console.error('Error fetching security events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security events' },
      { status: 500 }
    );
  }
}

async function generateTimelineStats(events: SecurityEvent[], range: string) {
  const stats: any[] = [];
  const now = new Date();
  let interval: number;
  let steps: number;

  switch (range) {
    case '1h':
      interval = 5 * 60 * 1000; // 5 minutes
      steps = 12;
      break;
    case '7d':
      interval = 24 * 60 * 60 * 1000; // 1 day
      steps = 7;
      break;
    case '30d':
      interval = 24 * 60 * 60 * 1000; // 1 day
      steps = 30;
      break;
    default: // 24h
      interval = 60 * 60 * 1000; // 1 hour
      steps = 24;
  }

  for (let i = steps - 1; i >= 0; i--) {
    const endTime = new Date(now.getTime() - (i * interval));
    const startTime = new Date(endTime.getTime() - interval);

    const periodEvents = events.filter(event => {
      const eventTime = new Date(event.timestamp);
      return eventTime >= startTime && eventTime < endTime;
    });

    const threats = periodEvents.filter(event =>
      event.severity === 'HIGH' || event.severity === 'CRITICAL'
    ).length;

    stats.push({
      date: formatDate(startTime, range),
      events: periodEvents.length,
      threats,
    });
  }

  return stats;
}

function formatDate(date: Date, range: string): string {
  switch (range) {
    case '1h':
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    case '24h':
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    default:
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
} 