import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { NetworkMonitor } from '@/lib/services/networkMonitor';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const monitors = new Map<string, NetworkMonitor>();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action } = await request.json();

    if (!['start', 'stop'].includes(action)) {
      return NextResponse.json(
        { message: 'Invalid action' },
        { status: 400 }
      );
    }

    let monitor = monitors.get(session.user.id);

    if (action === 'start') {
      if (!monitor) {
        monitor = new NetworkMonitor(session.user.id);
        monitors.set(session.user.id, monitor);
      }
      await monitor.startMonitoring();
      
      // Update user settings
      await prisma.settings.update({
        where: { userId: session.user.id },
        data: { networkMonitoring: true },
      });

      return NextResponse.json(
        { message: 'Network monitoring started' },
        { status: 200 }
      );
    } else {
      if (monitor) {
        await monitor.stopMonitoring();
        monitors.delete(session.user.id);

        // Update user settings
        await prisma.settings.update({
          where: { userId: session.user.id },
          data: { networkMonitoring: false },
        });
      }

      return NextResponse.json(
        { message: 'Network monitoring stopped' },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Network monitoring error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    const logs = await prisma.securityLog.findMany({
      where: {
        userId: session.user.id,
        type: {
          in: [
            'NETWORK_MONITORING_STARTED',
            'NETWORK_MONITORING_STOPPED',
            'SUSPICIOUS_NETWORK_ACTIVITY',
          ],
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
      skip,
    });

    const total = await prisma.securityLog.count({
      where: {
        userId: session.user.id,
        type: {
          in: [
            'NETWORK_MONITORING_STARTED',
            'NETWORK_MONITORING_STOPPED',
            'SUSPICIOUS_NETWORK_ACTIVITY',
          ],
        },
      },
    });

    return NextResponse.json({
      logs,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching network logs:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 