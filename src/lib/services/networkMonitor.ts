import { exec } from 'child_process';
import { promisify } from 'util';
import { PrismaClient } from '@prisma/client';
import { EventEmitter } from 'events';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

export interface NetworkActivity {
  timestamp: Date;
  protocol: string;
  localAddress: string;
  remoteAddress: string;
  state: string;
  processId?: string;
  processName?: string;
}

interface ProcessInfo {
  name: string;
  pid: string;
}

export class NetworkMonitor extends EventEmitter {
  private userId: string;
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private processCache: Map<string, string> = new Map();

  constructor(userId: string) {
    super();
    this.userId = userId;
  }

  async startMonitoring() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    // Log monitoring start
    await prisma.securityLog.create({
      data: {
        userId: this.userId,
        type: 'NETWORK_MONITORING_STARTED',
        severity: 'LOW',
        description: 'Network monitoring started',
      },
    });

    this.monitoringInterval = setInterval(async () => {
      try {
        const connections = await this.getNetworkConnections();
        this.emit('activity', connections);

        // Analyze for suspicious activity
        const suspiciousActivities = this.analyzeSuspiciousActivity(connections);
        if (suspiciousActivities.length > 0) {
          await this.logSuspiciousActivity(suspiciousActivities);
        }
      } catch (error) {
        console.error('Network monitoring error:', error);
      }
    }, 5000); // Check every 5 seconds
  }

  async stopMonitoring() {
    if (!this.isMonitoring) return;
    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    // Log monitoring stop
    await prisma.securityLog.create({
      data: {
        userId: this.userId,
        type: 'NETWORK_MONITORING_STOPPED',
        severity: 'LOW',
        description: 'Network monitoring stopped',
      },
    });
  }

  private async getNetworkConnections(): Promise<NetworkActivity[]> {
    try {
      // Use netstat to get network connections
      const { stdout } = await execAsync('netstat -ano');
      const lines = stdout.split('\n').slice(4); // Skip header lines
      const activities: NetworkActivity[] = [];

      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length < 5) continue;

        const [protocol, localAddress, remoteAddress, state, pid] = parts;
        const processName = await this.getCachedProcessName(pid);

        activities.push({
          timestamp: new Date(),
          protocol,
          localAddress,
          remoteAddress,
          state,
          processId: pid,
          processName,
        });
      }

      return activities;
    } catch (error) {
      console.error('Error getting network connections:', error);
      return [];
    }
  }

  private async getCachedProcessName(pid: string): Promise<string> {
    if (this.processCache.has(pid)) {
      return this.processCache.get(pid) || 'Unknown';
    }

    const name = await this.getProcessName(pid);
    this.processCache.set(pid, name);
    return name;
  }

  private async getProcessName(pid: string): Promise<string> {
    try {
      const { stdout } = await execAsync(`tasklist /FI "PID eq ${pid}"`);
      const lines = stdout.split('\n');
      if (lines.length > 3) {
        return lines[3].split(/\s+/)[0];
      }
      return 'Unknown';
    } catch {
      return 'Unknown';
    }
  }

  private analyzeSuspiciousActivity(connections: NetworkActivity[]): NetworkActivity[] {
    return connections.filter(conn => {
      // Check for suspicious ports
      const suspiciousPorts = ['6667', '4444', '31337']; // Common malware ports
      const localPort = conn.localAddress.split(':')[1];
      const remotePort = conn.remoteAddress.split(':')[1];

      if (suspiciousPorts.includes(localPort) || suspiciousPorts.includes(remotePort)) {
        return true;
      }

      // Check for suspicious states
      if (conn.state === 'LISTENING' && conn.processName?.toLowerCase().includes('suspicious')) {
        return true;
      }

      // Add more detection rules as needed
      return false;
    });
  }

  private async logSuspiciousActivity(activities: NetworkActivity[]) {
    const simplifiedActivities = activities.map(activity => ({
      timestamp: activity.timestamp.toISOString(),
      protocol: activity.protocol,
      localAddress: activity.localAddress,
      remoteAddress: activity.remoteAddress,
      state: activity.state,
      processId: activity.processId || 'unknown',
      processName: activity.processName || 'unknown',
    }));

    await prisma.securityLog.create({
      data: {
        userId: this.userId,
        type: 'SUSPICIOUS_NETWORK_ACTIVITY',
        severity: 'HIGH',
        description: 'Suspicious network activity detected',
        metadata: { activities: simplifiedActivities },
      },
    });
  }
} 