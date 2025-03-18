import { exec } from 'child_process';
import { promisify } from 'util';
import { PrismaClient } from '@prisma/client';
import os from 'os';
import { networkInterfaces } from 'os';

const execAsync = promisify(exec);
const prisma = new PrismaClient();

export interface ScanResult {
  type: string;
  findings: any[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class SystemScanner {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async quickScan(): Promise<ScanResult> {
    const scanId = await this.initiateScan('QUICK_SCAN');
    const findings = [];

    try {
      // Check system resources
      const cpuUsage = os.loadavg()[0];
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;

      if (cpuUsage > 80) {
        findings.push({
          type: 'HIGH_CPU_USAGE',
          value: cpuUsage,
          severity: 'MEDIUM',
        });
      }

      if (memoryUsage > 90) {
        findings.push({
          type: 'HIGH_MEMORY_USAGE',
          value: memoryUsage,
          severity: 'MEDIUM',
        });
      }

      // Check network interfaces
      const interfaces = networkInterfaces();
      Object.keys(interfaces).forEach((iface) => {
        interfaces[iface]?.forEach((details) => {
          if (details.family === 'IPv4' && !details.internal) {
            findings.push({
              type: 'ACTIVE_NETWORK_INTERFACE',
              interface: iface,
              address: details.address,
              severity: 'LOW',
            });
          }
        });
      });

      // Check running processes
      const { stdout: processes } = await execAsync('tasklist');
      const suspiciousProcesses = processes
        .split('\n')
        .filter(process => 
          process.toLowerCase().includes('backdoor') ||
          process.toLowerCase().includes('trojan') ||
          process.toLowerCase().includes('keylog')
        );

      if (suspiciousProcesses.length > 0) {
        findings.push({
          type: 'SUSPICIOUS_PROCESSES',
          processes: suspiciousProcesses,
          severity: 'HIGH',
        });
      }

      // Check open ports
      const { stdout: ports } = await execAsync('netstat -an');
      const openPorts = ports
        .split('\n')
        .filter(line => line.includes('LISTENING'))
        .map(line => {
          const parts = line.trim().split(/\s+/);
          return parts[1]?.split(':')[1];
        })
        .filter(Boolean);

      findings.push({
        type: 'OPEN_PORTS',
        ports: openPorts,
        severity: 'LOW',
      });

      await this.completeScan(scanId, findings);

      return {
        type: 'QUICK_SCAN',
        findings,
        severity: this.calculateOverallSeverity(findings),
      };
    } catch (error) {
      console.error('Scan error:', error);
      await this.failScan(scanId, error);
      throw error;
    }
  }

  private async initiateScan(scanType: string): Promise<string> {
    const scan = await prisma.scanResult.create({
      data: {
        userId: this.userId,
        scanType,
        status: 'IN_PROGRESS',
      },
    });

    await prisma.securityLog.create({
      data: {
        userId: this.userId,
        type: 'SCAN_STARTED',
        severity: 'LOW',
        description: `Started ${scanType}`,
      },
    });

    return scan.id;
  }

  private async completeScan(scanId: string, findings: any[]): Promise<void> {
    await prisma.scanResult.update({
      where: { id: scanId },
      data: {
        status: 'COMPLETED',
        findings: findings,
        endTime: new Date(),
      },
    });

    const severity = this.calculateOverallSeverity(findings);

    await prisma.securityLog.create({
      data: {
        userId: this.userId,
        type: 'SCAN_COMPLETED',
        severity,
        description: `Scan completed with ${severity} severity`,
        metadata: { findings },
      },
    });
  }

  private async failScan(scanId: string, error: any): Promise<void> {
    await prisma.scanResult.update({
      where: { id: scanId },
      data: {
        status: 'FAILED',
        endTime: new Date(),
      },
    });

    await prisma.securityLog.create({
      data: {
        userId: this.userId,
        type: 'SCAN_FAILED',
        severity: 'HIGH',
        description: 'Scan failed',
        metadata: { error: error.message },
      },
    });
  }

  private calculateOverallSeverity(findings: any[]): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const severityScores = {
      'LOW': 1,
      'MEDIUM': 2,
      'HIGH': 3,
      'CRITICAL': 4,
    };

    const maxSeverity = findings.reduce((max, finding) => {
      const score = severityScores[finding.severity as keyof typeof severityScores] || 0;
      return Math.max(max, score);
    }, 0);

    return Object.entries(severityScores).find(([_, score]) => score === maxSeverity)?.[0] as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' || 'LOW';
  }
} 