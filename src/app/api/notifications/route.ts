import { NextResponse } from 'next/server';
import { getRequiredUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

interface NotificationMetadata {
  read?: boolean;
  readAt?: Date;
  [key: string]: any;
}

export async function GET(request: Request) {
  try {
    const user = await getRequiredUser();
    if (!user.id) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      prisma.securityLog.findMany({
        where: { userId: user.id },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip
      }),
      prisma.securityLog.count({
        where: { userId: user.id }
      })
    ]);

    return NextResponse.json({
      notifications,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: page
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getRequiredUser();
    if (!user.id) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { notificationIds } = body;

    if (!Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: 'Invalid notification IDs' },
        { status: 400 }
      );
    }

    // Get existing notifications to preserve their metadata
    const notifications = await prisma.securityLog.findMany({
      where: {
        id: { in: notificationIds },
        userId: user.id
      },
      select: {
        id: true,
        metadata: true
      }
    });

    // Update each notification with its preserved metadata
    await Promise.all(
      notifications.map(notification => 
        prisma.securityLog.update({
          where: { id: notification.id },
          data: {
            metadata: {
              ...(notification.metadata as NotificationMetadata || {}),
              read: true,
              readAt: new Date()
            }
          }
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update notifications error:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { enabled } = await request.json();

    await prisma.settings.update({
      where: {
        userId: session.user.id,
      },
      data: {
        notificationsEnabled: enabled,
      },
    });

    return NextResponse.json(
      { message: `Notifications ${enabled ? 'enabled' : 'disabled'}` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 