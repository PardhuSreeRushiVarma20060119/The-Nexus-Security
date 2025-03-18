import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { exec } from 'child_process';
import { promisify } from 'util';
import { prisma } from '@/lib/prisma';

const execAsync = promisify(exec);

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

    // Run Sherlock
    const { stdout } = await execAsync(`python3 -m sherlock ${username} --print-found`);
    
    // Parse Sherlock output
    const results = stdout.split('\n')
      .filter(line => line.includes('[+]'))
      .map(line => {
        const platform = line.match(/\[.\] (.*?):/)?.[1] || '';
        const url = line.match(/: (https?:\/\/.*?)$/)?.[1] || '';
        return {
          platform,
          url,
          exists: true,
          username
        };
      });

    // Log the search
    await prisma.securityLog.create({
      data: {
        userId: session.user.id,
        type: 'OSINT_SHERLOCK',
        severity: 'LOW',
        description: `Sherlock search performed for username: ${username}`,
        metadata: { username, results }
      }
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Sherlock search failed:', error);
    return NextResponse.json(
      { error: 'Failed to perform Sherlock search' },
      { status: 500 }
    );
  }
} 