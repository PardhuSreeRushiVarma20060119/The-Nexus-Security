export interface BaseReport {
  id: string;
  userId: string;
  createdAt: Date;
  type: 'malware' | 'network' | 'osint' | 'vulnerability';
  title: string;
  summary: string;
  severity: 'high' | 'medium' | 'low' | 'info';
}

export interface MalwareReport extends BaseReport {
  type: 'malware';
  findings: {
    malwareType: string;
    threat: string;
    detection: string;
  }[];
}

export interface NetworkReport extends BaseReport {
  type: 'network';
  findings: {
    ip: string;
    ports: number[];
    services: string[];
    vulnerabilities?: string[];
  }[];
}

export interface OsintReport extends BaseReport {
  type: 'osint';
  findings: {
    tool: string;
    target: string;
    results: {
      type: string;
      finding: string;
      details: string;
      severity: string;
    }[];
  }[];
}

export interface VulnerabilityReport extends BaseReport {
  type: 'vulnerability';
  findings: {
    cve?: string;
    description: string;
    severity: string;
    recommendation: string;
  }[];
}

export type Report = MalwareReport | NetworkReport | OsintReport | VulnerabilityReport; 