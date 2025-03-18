import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { OsintLogService } from '@/lib/services/osintLogService';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await OsintLogService.getStats(session.user.id);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to fetch OSINT stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch OSINT stats' },
      { status: 500 }
    );
  }
} 