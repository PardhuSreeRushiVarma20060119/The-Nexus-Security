import { prisma } from '@/lib/prisma';

export interface OsintLogEntry {
  userId: string;
  event: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  source?: string;
  metadata?: any;
}

export class OsintLogService {
  static async log(entry: OsintLogEntry) {
    try {
      await prisma.securityLog.create({
        data: {
          userId: entry.userId,
          event: entry.event,
          type: entry.type,
          severity: entry.severity,
          level: entry.severity === 'CRITICAL' ? 'CRITICAL' : 
                 entry.severity === 'HIGH' ? 'ERROR' :
                 entry.severity === 'MEDIUM' ? 'WARNING' : 'INFO',
          details: entry.description,
          source: entry.source || 'OSINT_SERVICE'
        }
      });
    } catch (error) {
      console.error('Failed to log OSINT activity:', error);
    }
  }

  static async getStats(userId: string) {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [totalEvents, highSeverityEvents, domainEvents, vulnerabilityEvents] = await Promise.all([
      prisma.securityLog.count({
        where: {
          userId,
          event: {
            startsWith: 'OSINT_'
          },
          timestamp: {
            gte: last24Hours
          }
        }
      }),
      prisma.securityLog.count({
        where: {
          userId,
          event: {
            startsWith: 'OSINT_'
          },
          severity: 'HIGH',
          timestamp: {
            gte: last24Hours
          }
        }
      }),
      prisma.securityLog.count({
        where: {
          userId,
          event: 'OSINT_WHOIS',
          timestamp: {
            gte: last24Hours
          }
        }
      }),
      prisma.securityLog.count({
        where: {
          userId,
          event: 'OSINT_CVE',
          timestamp: {
            gte: last24Hours
          }
        }
      })
    ]);

    return {
      totalScans: totalEvents,
      activeThreats: highSeverityEvents,
      domainScanned: domainEvents,
      vulnerabilities: vulnerabilityEvents
    };
  }
} 