import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { exec } from 'child_process';
import { promisify } from 'util';
import { parseNmapOutput } from '@/lib/utils/nmapParser';
import { prisma } from '@/lib/prisma';

const execAsync = promisify(exec);

async function checkNmapInstallation() {
  try {
    await execAsync('nmap --version');
    return true;
  } catch (error) {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { target } = await request.json();
    if (!target) {
      return NextResponse.json({ error: 'Target network is required' }, { status: 400 });
    }

    // Validate target format (basic validation)
    const networkPattern = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
    if (!networkPattern.test(target)) {
      return NextResponse.json({ error: 'Invalid target network format' }, { status: 400 });
    }

    // Check if Nmap is installed
    const isNmapInstalled = await checkNmapInstallation();
    if (!isNmapInstalled) {
      return NextResponse.json({
        error: 'Nmap is not installed. Please install Nmap to use the network scanner.',
        installationGuide: {
          windows: 'Download and install from https://nmap.org/download.html',
          linux: 'sudo apt-get install nmap',
          macos: 'brew install nmap'
        }
      }, { status: 500 });
    }

    // Run nmap scan with sudo if on Linux/Mac
    const isWindows = process.platform === 'win32';
    const nmapCommand = isWindows 
      ? `nmap -sV -O -T4 --script vuln ${target}`
      : `sudo nmap -sV -O -T4 --script vuln ${target}`;

    try {
      const { stdout } = await execAsync(nmapCommand);
      const results = parseNmapOutput(stdout);

      // Log the scan in the database
      await prisma.securityLog.create({
        data: {
          userId: session.user.id,
          type: 'NETWORK_SCAN',
          severity: results.some(r => r.vulnerabilities?.length > 0) ? 'HIGH' : 'LOW',
          description: `Network scan completed for ${target}`,
          metadata: { target, results }
        }
      });

      return NextResponse.json(results);
    } catch (scanError) {
      console.error('Nmap scan error:', scanError);
      
      // Check for common error cases
      if (scanError.message.includes('permission denied')) {
        return NextResponse.json({
          error: 'Permission denied. Please run the application with administrator privileges.',
          details: 'Network scanning requires elevated permissions.'
        }, { status: 500 });
      }
      
      if (scanError.message.includes('command not found')) {
        return NextResponse.json({
          error: 'Nmap command not found. Please ensure Nmap is properly installed and in your system PATH.',
          installationGuide: {
            windows: 'Download and install from https://nmap.org/download.html',
            linux: 'sudo apt-get install nmap',
            macos: 'brew install nmap'
          }
        }, { status: 500 });
      }

      throw scanError;
    }
  } catch (error) {
    console.error('Network scan failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to perform network scan',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 