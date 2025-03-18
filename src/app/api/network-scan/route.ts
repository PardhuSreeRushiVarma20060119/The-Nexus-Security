import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getRequiredUser } from '@/lib/session';
import { prisma } from '@/lib/prisma';

const execAsync = promisify(exec);

// Add CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:3001',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true'
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const user = await getRequiredUser().catch(() => null);
    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401, headers: corsHeaders }
      );
    }

    const { target, scanType } = await request.json();

    // Validate input
    if (!target || !scanType) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate target format (basic validation)
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$|^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
    if (!ipRegex.test(target)) {
      return NextResponse.json(
        { error: 'Invalid target format' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Create scan record
    const scan = await prisma.scanResult.create({
      data: {
        userId: user.id,
        scanType: 'NETWORK_SCAN',
        status: 'IN_PROGRESS',
        findings: { target },
        startTime: new Date(),
      },
    });

    // Define scan options based on scan type
    let nmapOptions;
    switch (scanType) {
      case 'quick':
        nmapOptions = '-F';
        break;
      case 'default':
        nmapOptions = '-sV';
        break;
      case 'intense':
        nmapOptions = '-T4 -A';
        break;
      case 'vulnscan':
        nmapOptions = '-sV --script vuln';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid scan type' },
          { status: 400, headers: corsHeaders }
        );
    }

    // Execute nmap scan
    const command = `nmap ${nmapOptions} ${target}`;
    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      console.error('Nmap scan error:', stderr);
      await prisma.scanResult.update({
        where: { id: scan.id },
        data: {
          status: 'FAILED',
          endTime: new Date(),
          findings: { error: stderr },
        },
      });
      return NextResponse.json(
        { error: 'Scan failed', details: stderr },
        { status: 500, headers: corsHeaders }
      );
    }

    // Parse nmap output
    const results = parseNmapOutput(stdout);

    // Update scan record with findings
    await prisma.scanResult.update({
      where: { id: scan.id },
      data: {
        status: 'COMPLETED',
        endTime: new Date(),
        findings: results,
      },
    });

    // Log the scan completion
    await prisma.securityLog.create({
      data: {
        userId: user.id,
        type: 'NETWORK_SCAN_COMPLETED',
        severity: results.ports.length > 0 ? 'MEDIUM' : 'LOW',
        description: `Network scan completed for ${target}`,
        metadata: results,
      },
    });

    return NextResponse.json(results, { headers: corsHeaders });
  } catch (error) {
    console.error('Error during scan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

function parseNmapOutput(output: string) {
  const results = {
    ports: [] as any[],
    summary: '',
    hostStatus: '',
    vulnerabilities: [] as any[],
  };

  const lines = output.split('\n');
  let currentPort: any = {};

  lines.forEach((line) => {
    // Parse port information
    const portMatch = line.match(/^(\d+)\/(\w+)\s+(\w+)\s+(.*)$/);
    if (portMatch) {
      currentPort = {
        port: portMatch[1],
        protocol: portMatch[2],
        state: portMatch[3],
        service: portMatch[4],
      };
      results.ports.push(currentPort);
    }

    // Parse service version
    const versionMatch = line.match(/\|_?([\w-]+):\s+(.*)$/);
    if (versionMatch && currentPort) {
      currentPort.version = versionMatch[2];
    }

    // Parse host status
    if (line.includes('Host is')) {
      results.hostStatus = line.trim();
    }

    // Parse vulnerabilities
    if (line.includes('VULNERABLE:')) {
      results.vulnerabilities.push({
        type: line.split('VULNERABLE:')[1].trim(),
        severity: 'HIGH',
      });
    }
  });

  // Add summary
  results.summary = `Scan completed. Found ${results.ports.length} open ports and ${results.vulnerabilities.length} vulnerabilities.`;

  return results;
} 