import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import os from 'os';

interface SystemStats {
  cpu: number;
  memory: {
    total: number;
    used: number;
    free: number;
  };
  uptime: number;
  platform: string;
  hostname: string;
}

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get system stats
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    // Calculate CPU usage
    const cpus = os.cpus();
    const cpuUsage = cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b);
      const idle = cpu.times.idle;
      return acc + ((total - idle) / total) * 100;
    }, 0) / cpus.length;

    const stats: SystemStats = {
      cpu: Math.round(cpuUsage * 100) / 100,
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
      },
      uptime: os.uptime(),
      platform: os.platform(),
      hostname: os.hostname(),
    };

    // Get active scans
    const activeScans = await prisma.scanResult.count({
      where: {
        status: 'SCANNING',
      },
    });

    // Get system configuration
    const config = await prisma.systemConfig.findFirst({
      where: {
        active: true,
      },
    }) || {
      maxUploadSize: 100,
      scanTimeout: 300,
      maxConcurrentScans: 5,
      enableLogging: true,
      debugMode: false,
    };

    return NextResponse.json({
      stats,
      activeScans,
      config,
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system stats' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();

    // Update system configuration
    const config = await prisma.systemConfig.upsert({
      where: {
        active: true,
      },
      update: data,
      create: {
        ...data,
        active: true,
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error updating system config:', error);
    return NextResponse.json(
      { error: 'Failed to update system configuration' },
      { status: 500 }
    );
  }
} 