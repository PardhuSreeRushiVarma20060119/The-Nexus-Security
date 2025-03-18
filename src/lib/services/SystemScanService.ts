import { exec } from 'child_process';
import { promisify } from 'util';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

const execAsync = promisify(exec);

export class SystemScanService {
  static async performQuickScan(userId: string) {
    try {
      // Create scan record
      const scan = await prisma.scanResult.create({
        data: {
          userId,
          scanType: 'QUICK_SCAN',
          status: 'IN_PROGRESS',
        },
      });

      // Perform basic system checks
      const checks = await Promise.all([
        this.checkRunningProcesses(),
        this.checkOpenPorts(),
        this.checkDiskUsage(),
        this.checkMemoryUsage(),
      ]);

      // Analyze results
      const findings = {
        processes: checks[0],
        ports: checks[1],
        diskUsage: checks[2],
        memoryUsage: checks[3],
        threats: [],
      };

      // Update scan record with findings
      await prisma.scanResult.update({
        where: { id: scan.id },
        data: {
          status: 'COMPLETED',
          findings,
          endTime: new Date(),
        },
      });

      // Log the scan completion
      await prisma.securityLog.create({
        data: {
          userId,
          type: 'SCAN_COMPLETED',
          severity: 'LOW',
          description: 'Quick system scan completed successfully',
          metadata: findings,
        },
      });

      return { success: true, findings };
    } catch (error) {
      console.error('Quick scan failed:', error);
      throw new Error('Failed to perform quick scan');
    }
  }

  private static async checkRunningProcesses() {
    try {
      const { stdout } = await execAsync('tasklist /FO CSV');
      const processes = stdout
        .split('\n')
        .slice(1)
        .map(line => {
          const [name, pid] = line.split(',').map(item => item.replace(/"/g, ''));
          return { name, pid };
        })
        .filter(proc => proc.name && proc.pid);
      return processes;
    } catch (error) {
      console.error('Failed to check running processes:', error);
      return [];
    }
  }

  private static async checkOpenPorts() {
    try {
      const { stdout } = await execAsync('netstat -an');
      const ports = stdout
        .split('\n')
        .slice(4)
        .map(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 2) {
            const [protocol, localAddress] = parts;
            return { protocol, localAddress };
          }
          return null;
        })
        .filter(Boolean);
      return ports;
    } catch (error) {
      console.error('Failed to check open ports:', error);
      return [];
    }
  }

  private static async checkDiskUsage() {
    try {
      const { stdout } = await execAsync('wmic logicaldisk get size,freespace,caption');
      const disks = stdout
        .split('\n')
        .slice(1)
        .map(line => {
          const [caption, freeSpace, size] = line.trim().split(/\s+/);
          if (caption && freeSpace && size) {
            return {
              drive: caption,
              freeSpace: parseInt(freeSpace),
              totalSize: parseInt(size),
              usedPercentage: ((parseInt(size) - parseInt(freeSpace)) / parseInt(size) * 100).toFixed(2)
            };
          }
          return null;
        })
        .filter(Boolean);
      return disks;
    } catch (error) {
      console.error('Failed to check disk usage:', error);
      return [];
    }
  }

  private static async checkMemoryUsage() {
    try {
      const { stdout } = await execAsync('wmic OS get FreePhysicalMemory,TotalVisibleMemorySize /Value');
      const lines = stdout.split('\n');
      const freeMemory = parseInt(lines[0].split('=')[1]);
      const totalMemory = parseInt(lines[1].split('=')[1]);
      return {
        freeMemory: freeMemory * 1024, // Convert to bytes
        totalMemory: totalMemory * 1024,
        usedPercentage: ((totalMemory - freeMemory) / totalMemory * 100).toFixed(2)
      };
    } catch (error) {
      console.error('Failed to check memory usage:', error);
      return null;
    }
  }
} 