import { NextResponse } from 'next/server';
import { getRequiredUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getRequiredUser();
    if (!user.id) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 400 }
      );
    }

    const settings = await prisma.settings.findUnique({
      where: { userId: user.id }
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve settings' },
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
    const settings = await prisma.settings.update({
      where: { userId: user.id },
      data: {
        autoScanEnabled: body.autoScanEnabled,
        scanInterval: body.scanInterval,
        notificationsEnabled: body.notificationsEnabled,
        twoFactorEnabled: body.twoFactorEnabled,
        firewallEnabled: body.firewallEnabled,
        firewallRules: body.firewallRules,
        networkMonitoring: body.networkMonitoring,
        aiInsightsEnabled: body.aiInsightsEnabled
      }
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
} 