import { exec } from 'child_process';
import { promisify } from 'util';
import { platform } from 'os';
import { parseNmapOutput } from '../utils/nmapParser';

const execAsync = promisify(exec);

export interface NmapScanResult {
  ip: string;
  ports: {
    port: number;
    state: string;
    service: string;
  }[];
  os?: string;
  vulnerabilities?: string[];
}

export class NmapService {
  async scanNetwork(ipRange: string, scanType: 'quick' | 'full' = 'quick'): Promise<NmapScanResult[]> {
    try {
      const flags = scanType === 'quick' ? '-sT -F' : '-sT -sV -O';
      const sudoPrefix = platform() === 'win32' ? '' : 'sudo ';
      const { stdout } = await execAsync(`${sudoPrefix}nmap ${flags} ${ipRange}`);
      return parseNmapOutput(stdout);
    } catch (error) {
      console.error('Nmap scan failed:', error);
      return [];
    }
  }

  async scanHost(ip: string): Promise<NmapScanResult> {
    try {
      const sudoPrefix = platform() === 'win32' ? '' : 'sudo ';
      const { stdout } = await execAsync(`${sudoPrefix}nmap -sS -sV -O ${ip}`);
      const results = parseNmapOutput(stdout);
      return results[0];
    } catch (error) {
      console.error('Host scan failed:', error);
      throw new Error('Host scan failed');
    }
  }
} 