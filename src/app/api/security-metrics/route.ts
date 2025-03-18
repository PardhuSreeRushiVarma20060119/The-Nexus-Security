import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import { getRequiredUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

const execAsync = promisify(exec);

async function getSystemMetrics() {
  const cpuUsage = os.loadavg()[0];
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const memUsage = ((totalMem - freeMem) / totalMem) * 100;

  return {
    cpu: Math.round(cpuUsage * 10),
    memory: Math.round(memUsage),
    disk: 57, // TODO: Implement actual disk usage calculation
  };
}

async function getNetworkMetrics() {
  try {
    // Get network connections using netstat
    const { stdout: netstatOutput } = await execAsync('netstat -n | find "ESTABLISHED" /c');
    const activeConnections = parseInt(netstatOutput.trim()) || 0;

    return {
      activeConnections,
      throughput: '2.5 MB/s', // TODO: Implement actual network throughput calculation
      blockedAttempts: 128, // TODO: Implement actual firewall log analysis
    };
  } catch (error) {
    console.error('Error getting network metrics:', error);
    return {
      activeConnections: 0,
      throughput: '0 MB/s',
      blockedAttempts: 0,
    };
  }
}

async function getSecurityEvents() {
  // TODO: Implement actual security event collection from logs
  return {
    failedLogins: 145,
    suspiciousActivity: 23,
    malwareDetected: 2,
    systemModifications: 17,
    policyViolations: 9,
  };
}

async function getVulnerabilities() {
  // TODO: Implement actual vulnerability scanning
  return {
    critical: 2,
    high: 5,
    medium: 8,
    low: 15,
  };
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

    // Get recent security logs
    const [
      criticalThreats,
      highSeverityThreats,
      mediumSeverityThreats,
      lowSeverityThreats,
      recentScans
    ] = await Promise.all([
      prisma.securityLog.count({
        where: {
          userId: user.id,
          severity: 'CRITICAL',
          timestamp: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      }),
      prisma.securityLog.count({
        where: {
          userId: user.id,
          severity: 'HIGH',
          timestamp: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.securityLog.count({
        where: {
          userId: user.id,
          severity: 'MEDIUM',
          timestamp: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.securityLog.count({
        where: {
          userId: user.id,
          severity: 'LOW',
          timestamp: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      prisma.scanResult.findMany({
        where: {
          userId: user.id,
          status: 'COMPLETED',
          startTime: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: {
          startTime: 'desc'
        },
        take: 5
      })
    ]);

    // Calculate security score
    const totalThreats = criticalThreats + highSeverityThreats + mediumSeverityThreats + lowSeverityThreats;
    const weightedScore = Math.max(0, 100 - (
      (criticalThreats * 25) +
      (highSeverityThreats * 15) +
      (mediumSeverityThreats * 10) +
      (lowSeverityThreats * 5)
    ));

    const securityScore = Math.min(100, Math.max(0, weightedScore));

    return NextResponse.json({
      metrics: {
        securityScore,
        threatCounts: {
          critical: criticalThreats,
          high: highSeverityThreats,
          medium: mediumSeverityThreats,
          low: lowSeverityThreats,
          total: totalThreats
        },
        recentScans
      }
    });
  } catch (error) {
    console.error('Get security metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve security metrics' },
      { status: 500 }
    );
  }
} 