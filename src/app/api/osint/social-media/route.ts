import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const PLATFORMS = [
  'twitter',
  'github',
  'linkedin',
  'instagram',
  'facebook',
  'reddit'
];

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    // For now, return mock data
    const results = PLATFORMS.map(platform => ({
      platform,
      username,
      exists: Math.random() > 0.5,
      url: `https://${platform}.com/${username}`,
      lastActive: new Date().toISOString()
    }));

    // Log the social media search
    await prisma.securityLog.create({
      data: {
        userId: session.user.id,
        type: 'OSINT_SOCIAL_MEDIA',
        severity: 'LOW',
        description: `Social media search performed for username: ${username}`,
        metadata: { username, results }
      }
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Social media search failed:', error);
    return NextResponse.json(
      { error: 'Failed to perform social media search' },
      { status: 500 }
    );
  }
} 