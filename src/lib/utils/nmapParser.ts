interface Port {
  port: number;
  state: string;
  service: string;
  version?: string;
}

interface ScanResult {
  ip: string;
  ports: Port[];
  os?: string;
  vulnerabilities?: string[];
}

export function parseNmapOutput(output: string): ScanResult[] {
  const results: ScanResult[] = [];
  let currentHost: ScanResult | null = null;

  const lines = output.split('\n');
  
  for (const line of lines) {
    // New host
    if (line.match(/^Nmap scan report for/)) {
      if (currentHost) {
        results.push(currentHost);
      }
      const ip = line.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/)?.[1];
      if (ip) {
        currentHost = {
          ip,
          ports: [],
          vulnerabilities: []
        };
      }
      continue;
    }

    // OS Detection
    if (currentHost && line.includes('OS details:')) {
      currentHost.os = line.split('OS details:')[1].trim();
      continue;
    }

    // Port information
    if (currentHost) {
      const portMatch = line.match(/^(\d+)\/(\w+)\s+(\w+)\s+(.*)$/);
      if (portMatch) {
        const [_, port, protocol, state, service] = portMatch;
        currentHost.ports.push({
          port: parseInt(port),
          state,
          service: service.trim()
        });
        continue;
      }
    }

    // Vulnerability information
    if (currentHost && line.includes('VULNERABLE:')) {
      const vulnName = line.split('VULNERABLE:')[1].trim();
      if (vulnName && !currentHost.vulnerabilities?.includes(vulnName)) {
        currentHost.vulnerabilities?.push(vulnName);
      }
      continue;
    }
  }

  // Add the last host
  if (currentHost) {
    results.push(currentHost);
  }

  return results;
} 