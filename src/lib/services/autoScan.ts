import { PrismaClient } from '@prisma/client';
import { SystemScanner } from './systemScan';

const prisma = new PrismaClient();

export class AutoScanService {
  private scanIntervals: Map<string, NodeJS.Timeout> = new Map();

  async startAutoScan(userId: string) {
    // Check if auto-scan is already running for this user
    if (this.scanIntervals.has(userId)) {
      return;
    }

    // Get user settings
    const settings = await prisma.settings.findUnique({
      where: { userId },
    });

    if (!settings?.autoScanEnabled) {
      return;
    }

    // Convert hours to milliseconds
    const interval = (settings.scanInterval || 24) * 60 * 60 * 1000;

    // Create scanner instance
    const scanner = new SystemScanner(userId);

    // Schedule periodic scan
    const intervalId = setInterval(async () => {
      try {
        // Run scan
        const results = await scanner.quickScan();

        // Check for critical or high severity findings
        if (results.severity === 'CRITICAL' || results.severity === 'HIGH') {
          // Create notification
          await prisma.securityLog.create({
            data: {
              userId,
              type: 'AUTO_SCAN_ALERT',
              severity: results.severity,
              description: `Automatic scan detected ${results.severity.toLowerCase()} severity threats`,
              metadata: { findings: results.findings },
            },
          });
        }
      } catch (error) {
        console.error('Auto-scan error:', error);
        
        // Log error
        await prisma.securityLog.create({
          data: {
            userId,
            type: 'AUTO_SCAN_ERROR',
            severity: 'HIGH',
            description: 'Automatic scan failed',
            metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
        });
      }
    }, interval);

    this.scanIntervals.set(userId, intervalId);

    // Log auto-scan start
    await prisma.securityLog.create({
      data: {
        userId,
        type: 'AUTO_SCAN_STARTED',
        severity: 'LOW',
        description: `Automatic scanning started with ${settings.scanInterval}h interval`,
      },
    });
  }

  async stopAutoScan(userId: string) {
    const intervalId = this.scanIntervals.get(userId);
    if (intervalId) {
      clearInterval(intervalId);
      this.scanIntervals.delete(userId);

      // Log auto-scan stop
      await prisma.securityLog.create({
        data: {
          userId,
          type: 'AUTO_SCAN_STOPPED',
          severity: 'LOW',
          description: 'Automatic scanning stopped',
        },
      });
    }
  }

  async updateInterval(userId: string, hours: number) {
    // Stop current auto-scan
    await this.stopAutoScan(userId);

    // Update settings
    await prisma.settings.update({
      where: { userId },
      data: { scanInterval: hours },
    });

    // Restart auto-scan with new interval
    await this.startAutoScan(userId);
  }
} 