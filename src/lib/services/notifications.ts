import { PrismaClient } from '@prisma/client';
import { Server as SocketServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

const prisma = new PrismaClient();

export class NotificationService {
  private io: SocketServer;
  private userSockets: Map<string, string[]> = new Map();

  constructor(httpServer: HTTPServer) {
    this.io = new SocketServer(httpServer, {
      path: '/api/ws',
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL,
        methods: ['GET', 'POST'],
      },
    });

    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('authenticate', async (token: string) => {
        try {
          // Verify token and get user ID
          const userId = await this.verifyToken(token);
          if (!userId) {
            socket.disconnect();
            return;
          }

          // Store socket mapping
          const userSockets = this.userSockets.get(userId) || [];
          userSockets.push(socket.id);
          this.userSockets.set(userId, userSockets);

          // Send pending notifications
          await this.sendPendingNotifications(userId, socket);

          socket.on('disconnect', () => {
            const sockets = this.userSockets.get(userId) || [];
            this.userSockets.set(
              userId,
              sockets.filter(id => id !== socket.id)
            );
          });
        } catch (error) {
          console.error('Socket authentication error:', error);
          socket.disconnect();
        }
      });
    });
  }

  private async verifyToken(token: string): Promise<string | null> {
    try {
      // Implement token verification logic here
      // This should match your authentication system
      return 'user_id'; // Replace with actual verification
    } catch {
      return null;
    }
  }

  private async sendPendingNotifications(userId: string, socket: any) {
    try {
      const pendingNotifications = await prisma.securityLog.findMany({
        where: {
          userId,
          type: {
            in: [
              'CRITICAL_THREAT_DETECTED',
              'HIGH_SEVERITY_THREAT',
              'SUSPICIOUS_ACTIVITY',
              'AUTO_SCAN_ALERT',
            ],
          },
          // Add any other conditions for pending notifications
        },
        orderBy: {
          timestamp: 'desc',
        },
        take: 10,
      });

      if (pendingNotifications.length > 0) {
        socket.emit('notifications', pendingNotifications);
      }
    } catch (error) {
      console.error('Error sending pending notifications:', error);
    }
  }

  async sendNotification(userId: string, notification: {
    type: string;
    title: string;
    message: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    data?: any;
  }) {
    try {
      // Save notification to database
      const securityLog = await prisma.securityLog.create({
        data: {
          userId,
          type: notification.type,
          severity: notification.severity,
          description: notification.message,
          metadata: notification.data,
        },
      });

      // Send real-time notification
      const userSockets = this.userSockets.get(userId);
      if (userSockets?.length) {
        this.io.to(userSockets).emit('notification', {
          id: securityLog.id,
          ...notification,
          timestamp: securityLog.timestamp,
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  async markAsRead(userId: string, notificationId: string) {
    try {
      await prisma.securityLog.update({
        where: {
          id: notificationId,
          userId,
        },
        data: {
          metadata: {
            read: true,
          },
        },
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async getNotifications(userId: string, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const [notifications, total] = await Promise.all([
        prisma.securityLog.findMany({
          where: {
            userId,
            type: {
              in: [
                'CRITICAL_THREAT_DETECTED',
                'HIGH_SEVERITY_THREAT',
                'SUSPICIOUS_ACTIVITY',
                'AUTO_SCAN_ALERT',
              ],
            },
          },
          orderBy: {
            timestamp: 'desc',
          },
          skip,
          take: limit,
        }),
        prisma.securityLog.count({
          where: {
            userId,
            type: {
              in: [
                'CRITICAL_THREAT_DETECTED',
                'HIGH_SEVERITY_THREAT',
                'SUSPICIOUS_ACTIVITY',
                'AUTO_SCAN_ALERT',
              ],
            },
          },
        }),
      ]);

      return {
        notifications,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          current: page,
        },
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }
} 