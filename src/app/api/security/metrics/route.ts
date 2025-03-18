import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get recent scan results
    const recentScans = await prisma.scanResult.findMany({
      where: {
        userId: session.user.id,
        status: 'COMPLETED',
      },
      orderBy: {
        startTime: 'desc',
      },
      take: 10,
    });

    // Get recent security logs
    const recentLogs = await prisma.securityLog.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 100,
    });

    // Calculate security score
    const securityScore = calculateSecurityScore(recentScans, recentLogs);

    // Calculate threats by type
    const threatsByType = calculateThreatsByType(recentScans);

    // Calculate trend data
    const trendData = calculateTrendData(recentScans, recentLogs);

    return NextResponse.json({
      securityScore,
      threatsByType,
      trendData,
      summary: {
        totalScans: recentScans.length,
        totalThreats: threatsByType.reduce((acc, curr) => acc + curr.value, 0),
        lastScanTime: recentScans[0]?.startTime || null,
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateSecurityScore(scans: any[], logs: any[]): number {
  let score = 100;

  // Deduct points for recent threats
  const recentThreats = scans.flatMap(scan => scan.findings || []);
  const criticalThreats = recentThreats.filter(threat => threat.severity === 'CRITICAL').length;
  const highThreats = recentThreats.filter(threat => threat.severity === 'HIGH').length;
  const mediumThreats = recentThreats.filter(threat => threat.severity === 'MEDIUM').length;

  score -= criticalThreats * 15; // -15 points per critical threat
  score -= highThreats * 10;     // -10 points per high threat
  score -= mediumThreats * 5;    // -5 points per medium threat

  // Deduct points for suspicious activities
  const suspiciousActivities = logs.filter(log => 
    log.type === 'SUSPICIOUS_NETWORK_ACTIVITY' ||
    log.type === 'FAILED_LOGIN_ATTEMPT'
  ).length;

  score -= suspiciousActivities * 2; // -2 points per suspicious activity

  // Ensure score stays between 0 and 100
  return Math.max(0, Math.min(100, score));
}

function calculateThreatsByType(scans: any[]): { name: string; value: number }[] {
  const threatCounts = new Map<string, number>();

  scans.forEach(scan => {
    (scan.findings || []).forEach((finding: any) => {
      const count = threatCounts.get(finding.type) || 0;
      threatCounts.set(finding.type, count + 1);
    });
  });

  return Array.from(threatCounts.entries()).map(([name, value]) => ({
    name,
    value,
  }));
}

function calculateTrendData(scans: any[], logs: any[]) {
  const last30Days = new Array(30).fill(0).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  return {
    scanTrend: last30Days.map(date => ({
      date,
      threats: scans.filter(scan => 
        scan.startTime.toISOString().startsWith(date)
      ).reduce((acc, scan) => acc + (scan.findings?.length || 0), 0),
    })),
    activityTrend: last30Days.map(date => ({
      date,
      suspicious: logs.filter(log =>
        log.timestamp.toISOString().startsWith(date) &&
        log.type === 'SUSPICIOUS_NETWORK_ACTIVITY'
      ).length,
      normal: logs.filter(log =>
        log.timestamp.toISOString().startsWith(date) &&
        log.type === 'NETWORK_ACTIVITY'
      ).length,
    })),
  };
} 