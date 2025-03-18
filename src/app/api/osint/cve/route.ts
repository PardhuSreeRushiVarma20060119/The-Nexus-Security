import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const response = await axios.get(
      `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${encodeURIComponent(query)}`
    );

    // Type check and extract vulnerabilities from response
    const results = (response.data as { vulnerabilities: any[] }).vulnerabilities;

    // Log the CVE search
    await prisma.securityLog.create({
      data: {
        userId: session.user.id,
        type: 'OSINT_CVE',
        severity: 'LOW',
        description: `CVE search performed for: ${query}`,
        metadata: { query, results }
      }
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('CVE search failed:', error);
    return NextResponse.json(
      { error: 'Failed to perform CVE search' },
      { status: 500 }
    );
  }
} 