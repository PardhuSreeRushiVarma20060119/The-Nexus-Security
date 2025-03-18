import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const settings = await prisma.settings.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ settings }, { status: 200 });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const updates = await request.json();

    // Validate updates
    const allowedFields = [
      'autoScanEnabled',
      'scanInterval',
      'notificationsEnabled',
      'twoFactorEnabled',
      'firewallEnabled',
      'networkMonitoring',
      'aiInsightsEnabled',
    ];

    const invalidFields = Object.keys(updates).filter(
      key => !allowedFields.includes(key)
    );

    if (invalidFields.length > 0) {
      return NextResponse.json(
        { message: `Invalid fields: ${invalidFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Update settings
    const settings = await prisma.settings.update({
      where: {
        userId: session.user.id,
      },
      data: updates,
    });

    // Log the settings change
    await prisma.securityLog.create({
      data: {
        userId: session.user.id,
        type: 'SETTINGS_UPDATED',
        severity: 'LOW',
        description: 'Security settings updated',
        metadata: { updates },
      },
    });

    return NextResponse.json({ settings }, { status: 200 });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 