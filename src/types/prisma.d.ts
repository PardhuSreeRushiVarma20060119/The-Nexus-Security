import { Prisma } from '@prisma/client';

declare global {
  namespace PrismaTypes {
    interface SystemHealth {
      id: string;
      userId: string;
      cpuUsage: number;
      memoryUsage: number;
      diskUsage: number;
      networkLatency: number;
      metadata: Prisma.JsonValue | null;
      timestamp: Date;
    }
  }
} 