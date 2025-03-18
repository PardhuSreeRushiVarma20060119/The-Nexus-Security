import { prisma } from '@/lib/prisma';

export async function getOsintStats(userId: string) {
  const [
    totalScans,
    recentThreats,
    domainScans,
    vulnerabilities
  ] = await Promise.all([
    prisma.securityLog.count({
      where: {
        userId,
        type: { startsWith: 'OSINT_' }
      }
    }),
    prisma.securityLog.count({
      where: {
        userId,
        type: { startsWith: 'OSINT_' },
        severity: 'HIGH',
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    }),
    prisma.securityLog.count({
      where: {
        userId,
        type: 'OSINT_WHOIS'
      }
    }),
    prisma.securityLog.count({
      where: {
        userId,
        type: 'OSINT_CVE'
      }
    })
  ]);

  return {
    totalScans,
    activeThreats: recentThreats,
    domainScanned: domainScans,
    vulnerabilities
  };
} 