import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import os from 'os';
import { SystemHealth } from '@prisma/client';
import { execSync } from 'child_process';
import dns from 'dns';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

// Convert dns.resolve to promise-based
const dnsResolve = promisify(dns.resolve);

interface SystemTools {
  antivirus: {
    installed: boolean;
    status: string;
    lastUpdate: string;
  };
  firewall: {
    enabled: boolean;
    rules: number;
  };
  updates: {
    available: number;
    critical: number;
  };
}

interface LogAnalysis {
  errorCount: number;
  warningCount: number;
  criticalIssues: number;
  recentErrors: string[];
}

// Function to get disk usage
async function getDiskUsage(): Promise<number> {
  try {
    if (process.platform === 'win32') {
      // Windows implementation
      const drive = process.cwd().split(':')[0] || 'C';
      const output = execSync(`wmic logical disk where "DeviceID='${drive}:'" get size,freespace /value`).toString();
      
      const size = parseInt(output.match(/Size=(\d+)/)?.[1] || '0');
      const freeSpace = parseInt(output.match(/FreeSpace=(\d+)/)?.[1] || '0');
      
      if (size === 0) return 0;
      return ((size - freeSpace) / size) * 100;
    } else {
      // Linux/Unix implementation
      const output = execSync('df -k / | tail -1').toString();
      const [, , , , usage] = output.split(/\s+/);
      return parseInt(usage.replace('%', ''));
    }
  } catch (error) {
    console.error('Error getting disk usage:', error);
    return 0;
  }
}

// Function to check network latency
async function getNetworkLatency(): Promise<number> {
  try {
    const domains = ['google.com', 'amazon.com', 'microsoft.com'];
    const latencies: number[] = [];

    for (const domain of domains) {
      const startTime = Date.now();
      await dnsResolve(domain);
      const endTime = Date.now();
      latencies.push(endTime - startTime);
    }

    // Return average latency
    return latencies.reduce((a, b) => a + b, 0) / latencies.length;
  } catch (error) {
    console.error('Error checking network latency:', error);
    return 0;
  }
}

// Function to check system tools status
async function getSystemTools(): Promise<SystemTools> {
  try {
    if (process.platform === 'win32') {
      // Windows implementation
      const antivirusStatus = execSync('powershell "Get-MpComputerStatus | Select-Object AntivirusEnabled, RealTimeProtectionEnabled, NISEnabled, QuickScanSignatureVersion"').toString();
      const firewallStatus = execSync('powershell "Get-NetFirewallProfile | Select-Object Enabled, LogFileName"').toString();
      const updatesStatus = execSync('powershell "Get-HotFix | Select-Object -First 5"').toString();

      return {
        antivirus: {
          installed: antivirusStatus.includes('True'),
          status: antivirusStatus.includes('True') ? 'Active' : 'Inactive',
          lastUpdate: new Date().toISOString(),
        },
        firewall: {
          enabled: firewallStatus.includes('True'),
          rules: firewallStatus.split('\n').length - 1,
        },
        updates: {
          available: 0, // Would need Windows Update API to get actual count
          critical: 0, // Would need Windows Update API to get actual count
        },
      };
    } else {
      // Linux implementation
      const antivirusStatus = execSync('systemctl status clamav-daemon || echo "ClamAV not installed"').toString();
      const firewallStatus = execSync('ufw status || echo "UFW not installed"').toString();
      const updatesStatus = execSync('apt list --upgradable 2>/dev/null || echo "No updates available"').toString();

      return {
        antivirus: {
          installed: antivirusStatus.includes('active (running)'),
          status: antivirusStatus.includes('active (running)') ? 'Active' : 'Inactive',
          lastUpdate: new Date().toISOString(),
        },
        firewall: {
          enabled: firewallStatus.includes('Status: active'),
          rules: firewallStatus.split('\n').length - 1,
        },
        updates: {
          available: updatesStatus.split('\n').length - 1,
          critical: 0, // Would need to parse security updates
        },
      };
    }
  } catch (error) {
    console.error('Error checking system tools:', error);
    return {
      antivirus: { installed: false, status: 'Unknown', lastUpdate: new Date().toISOString() },
      firewall: { enabled: false, rules: 0 },
      updates: { available: 0, critical: 0 },
    };
  }
}

// Function to analyze system logs
async function analyzeLogs(): Promise<LogAnalysis> {
  try {
    const logDir = process.platform === 'win32' 
      ? 'C:\\Windows\\System32\\winevt\\Logs'
      : '/var/log';
    
    const logFiles = process.platform === 'win32'
      ? ['Application.evtx', 'System.evtx', 'Security.evtx']
      : ['syslog', 'auth.log', 'kern.log'];

    let errorCount = 0;
    let warningCount = 0;
    let criticalIssues = 0;
    const recentErrors: string[] = [];

    for (const file of logFiles) {
      const logPath = path.join(logDir, file);
      if (fs.existsSync(logPath)) {
        try {
          const content = fs.readFileSync(logPath, 'utf-8');
          const lines = content.split('\n').slice(-100); // Get last 100 lines

          for (const line of lines) {
            if (line.toLowerCase().includes('error')) errorCount++;
            if (line.toLowerCase().includes('warning')) warningCount++;
            if (line.toLowerCase().includes('critical')) criticalIssues++;
            
            if (line.toLowerCase().includes('error') || line.toLowerCase().includes('critical')) {
              recentErrors.push(line.slice(0, 100) + '...'); // Truncate long lines
            }
          }
        } catch (error) {
          console.error(`Error reading log file ${file}:`, error);
        }
      }
    }

    return {
      errorCount,
      warningCount,
      criticalIssues,
      recentErrors: recentErrors.slice(0, 5), // Keep only 5 most recent errors
    };
  } catch (error) {
    console.error('Error analyzing logs:', error);
    return {
      errorCount: 0,
      warningCount: 0,
      criticalIssues: 0,
      recentErrors: [],
    };
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const latestHealth = await prisma.$queryRaw<SystemHealth[]>`
      SELECT * FROM "SystemHealth"
      WHERE "userId" = ${session.user.id}
      ORDER BY "timestamp" DESC
      LIMIT 1
    `;

    return NextResponse.json(latestHealth[0] || null);
  } catch (error) {
    console.error('Get system health error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve system health data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get real system metrics
    const cpuUsage = os.loadavg()[0] * 100 / os.cpus().length;
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;

    // Get all system metrics concurrently
    const [diskUsage, networkLatency, systemTools, logAnalysis] = await Promise.all([
      getDiskUsage(),
      getNetworkLatency(),
      getSystemTools(),
      analyzeLogs()
    ]);

    // Create new system health record using raw SQL
    const newHealth = await prisma.$queryRaw<SystemHealth[]>`
      INSERT INTO "SystemHealth" (
        "id", 
        "userId", 
        "cpuUsage", 
        "memoryUsage", 
        "diskUsage", 
        "networkLatency", 
        "timestamp",
        "metadata"
      )
      VALUES (
        gen_random_uuid(),
        ${session.user.id},
        ${cpuUsage},
        ${memoryUsage},
        ${diskUsage},
        ${networkLatency},
        NOW(),
        ${JSON.stringify({
          systemTools,
          logAnalysis
        })}
      )
      RETURNING *
    `;

    return NextResponse.json(newHealth[0]);
  } catch (error) {
    console.error('Create system health error:', error);
    return NextResponse.json(
      { error: 'Failed to create system health data' },
      { status: 500 }
    );
  }
} 