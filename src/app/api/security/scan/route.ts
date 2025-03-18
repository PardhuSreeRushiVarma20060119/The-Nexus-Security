import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { SystemScanner } from '@/lib/services/systemScan';
import { PrismaClient } from '@prisma/client';
import { getRequiredUser } from '@/lib/session';
import { SystemScanService } from '@/lib/services/SystemScanService';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const user = await getRequiredUser();
    if (!user.id) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 400 }
      );
    }
    
    const result = await SystemScanService.performQuickScan(user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Scan API error:', error);
    return NextResponse.json(
      { error: 'Failed to perform system scan' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getRequiredUser();
    if (!user.id) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 400 }
      );
    }
    
    // Get recent scan results
    const recentScans = await prisma.scanResult.findMany({
      where: { userId: user.id },
      orderBy: { startTime: 'desc' },
      take: 5,
    });

    return NextResponse.json({ scans: recentScans });
  } catch (error) {
    console.error('Get scans API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve scan results' },
      { status: 500 }
    );
  }
} 