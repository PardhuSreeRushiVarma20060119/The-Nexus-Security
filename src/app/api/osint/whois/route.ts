import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import whois from 'whois-json';
import { prisma } from '@/lib/prisma';

// Define WhoisData type to match the actual response structure
interface WhoisData {
  registrar?: string;
  createdDate?: string;
  created?: string;
  expirationDate?: string;
  expires?: string;
  nameServer?: string | string[];
  status?: string | string[];
  [key: string]: any;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
    }

    const whoisData: WhoisData = await whois(domain);
    
    // Transform the data to a consistent format
    const result = {
      domain,
      registrar: whoisData.registrar,
      creationDate: whoisData.createdDate || whoisData.created,
      expiryDate: whoisData.expirationDate || whoisData.expires,
      nameservers: Array.isArray(whoisData.nameServer) 
        ? whoisData.nameServer 
        : whoisData.nameServer 
          ? [whoisData.nameServer] 
          : [],
      status: whoisData.status || [],
      raw: whoisData // Keep the raw data for logging
    };

    // Log the WHOIS lookup
    await prisma.securityLog.create({
      data: {
        userId: session.user.id,
        type: 'OSINT_WHOIS',
        severity: 'LOW',
        description: `WHOIS lookup performed for domain: ${domain}`,
        metadata: { domain, result }
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('WHOIS lookup failed:', error);
    return NextResponse.json(
      { error: 'Failed to perform WHOIS lookup' },
      { status: 500 }
    );
  }
} 