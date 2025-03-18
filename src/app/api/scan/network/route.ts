import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { scanPorts } from '@/lib/network';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { target } = await req.json();
    if (!target) {
      return NextResponse.json({ error: 'Target is required' }, { status: 400 });
    }

    const startTime = Date.now();
    const openPorts = await scanPorts(target);

    // Create security log for the scan
    await prisma.securityLog.create({
      data: {
        userId: session.user.id,
        type: 'NETWORK_SCAN',
        level: 'INFO',
        severity: 'LOW',
        description: `Network scan completed for ${target}. Found ${openPorts.length} open ports.`,
        metadata: {
          target,
          openPorts,
          scanDate: new Date().toISOString(),
          scanDuration: Date.now() - startTime
        }
      }
    });

    return NextResponse.json({
      target,
      openPorts,
      scanDuration: Date.now() - startTime
    });
  } catch (error) {
    console.error('Network scan error:', error);
    return NextResponse.json(
      { error: 'Failed to perform network scan' },
      { status: 500 }
    );
  }
} 