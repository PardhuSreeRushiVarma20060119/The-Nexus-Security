import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function getCpuUsage(): Promise<number> {
  try {
    const { stdout } = await execAsync('wmic cpu get loadpercentage');
    const lines = stdout.split('\n');
    const usage = parseInt(lines[1]);
    return isNaN(usage) ? 0 : usage;
  } catch (error) {
    console.error('Error getting CPU usage:', error);
    return 0;
  }
}

async function getCpuTemperature(): Promise<number> {
  try {
    const { stdout } = await execAsync('wmic /namespace:\\\\root\\wmi PATH MSAcpi_ThermalZoneTemperature -get CurrentTemperature');
    const lines = stdout.split('\n');
    const temp = parseInt(lines[1]);
    return isNaN(temp) ? 0 : (temp - 2732) / 10; // Convert from Kelvin to Celsius
  } catch (error) {
    console.error('Error getting CPU temperature:', error);
    return 0;
  }
}

async function getNetworkStats() {
  try {
    const { stdout } = await execAsync('netstat -e');
    const lines = stdout.split('\n');
    const stats = lines[2].trim().split(/\s+/);
    return {
      bytesReceived: parseInt(stats[1]) || 0,
      bytesSent: parseInt(stats[2]) || 0,
      connections: parseInt(stats[3]) || 0
    };
  } catch (error) {
    console.error('Error getting network stats:', error);
    return {
      bytesReceived: 0,
      bytesSent: 0,
      connections: 0
    };
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [cpuUsage, cpuTemp, networkStats] = await Promise.all([
      getCpuUsage(),
      getCpuTemperature(),
      getNetworkStats()
    ]);

    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;

    const diskStats = {
      total: 0,
      used: 0,
      free: 0
    };

    try {
      const { stdout } = await execAsync('wmic logicaldisk get size,freespace,caption');
      const lines = stdout.split('\n');
      for (let i = 1; i < lines.length; i++) {
        const [caption, freeSpace, size] = lines[i].trim().split(/\s+/);
        if (size && freeSpace) {
          diskStats.total += parseInt(size);
          diskStats.free += parseInt(freeSpace);
        }
      }
      diskStats.used = diskStats.total - diskStats.free;
    } catch (error) {
      console.error('Error getting disk stats:', error);
    }

    const health = {
      cpu: {
        usage: cpuUsage,
        cores: os.cpus().length,
        temperature: cpuTemp
      },
      memory: {
        total: totalMemory,
        used: usedMemory,
        free: freeMemory
      },
      disk: diskStats,
      network: networkStats,
      uptime: os.uptime(),
      platform: os.platform(),
      hostname: os.hostname()
    };

    return NextResponse.json(health);
  } catch (error) {
    console.error('Error fetching system health:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system health' },
      { status: 500 }
    );
  }
} 