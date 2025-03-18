import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { AIInsightsService } from '@/lib/services/aiInsights';
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

    // Check if AI insights are enabled
    const settings = await prisma.settings.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!settings?.aiInsightsEnabled) {
      return NextResponse.json(
        { message: 'AI insights are disabled' },
        { status: 403 }
      );
    }

    const aiService = new AIInsightsService(session.user.id);
    const insights = await aiService.generateInsights();

    return NextResponse.json({ insights }, { status: 200 });
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
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

    // Update AI insights setting
    await prisma.settings.update({
      where: {
        userId: session.user.id,
      },
      data: {
        aiInsightsEnabled: enabled,
      },
    });

    return NextResponse.json(
      { message: `AI insights ${enabled ? 'enabled' : 'disabled'}` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating AI insights setting:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 