import axios from 'axios';
import { OsintLogService } from './osintLogService';

export interface DomainInfo {
  domain: string;
  registrar?: string;
  creationDate?: string;
  expiryDate?: string;
  nameservers?: string[];
  status?: string | string[];
}

export interface EmailInfo {
  email: string;
  breaches?: {
    name: string;
    date: string;
    description: string;
  }[];
  socialProfiles?: string[];
}

export interface CompanyInfo {
  name: string;
  domain?: string;
  employees?: number;
  founded?: string;
  socialMedia?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
}

export interface SocialMediaPlatform {
  platform: string;
  url: string;
  exists: boolean;
  username: string;
}

export interface SocialMediaInfo {
  username: string;
  platforms: SocialMediaPlatform[];
}

export interface NetworkPort {
  port: number;
  service: string;
  version?: string;
  state: string;
}

export interface NetworkInfo {
  target: string;
  operatingSystem?: string;
  openPorts: NetworkPort[];
}

export interface CertificateInfo {
  domain: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  subjectAltNames: string[];
}

export interface SocialMediaResult {
  platform: string;
  url: string;
  exists: boolean;
  username: string;
}

export class OsintService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async getDomainInfo(domain: string): Promise<DomainInfo> {
    try {
      const response = await axios.get(`/api/osint/whois?domain=${domain}`);
      const data = response.data as DomainInfo;
      
      await OsintLogService.log({
        userId: this.userId,
        event: 'OSINT_WHOIS',
        type: 'OSINT_WHOIS',
        severity: 'LOW',
        description: `WHOIS lookup performed for domain: ${domain}`,
        metadata: { domain, result: data }
      });

      return data;
    } catch (error) {
      console.error('WHOIS lookup failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await OsintLogService.log({
        userId: this.userId,
        event: 'OSINT_WHOIS_ERROR',
        type: 'OSINT_WHOIS',
        severity: 'LOW',
        description: `WHOIS lookup failed for domain: ${domain}`,
        metadata: { domain, error: errorMessage }
      });
      return { domain, nameservers: [], status: [] };
    }
  }

  async getEmailInfo(email: string): Promise<EmailInfo> {
    // Implement email investigation (using HaveIBeenPwned or similar)
    try {
      const response = await axios.get(`https://haveibeenpwned.com/api/v3/breachedaccount/${email}`, {
        headers: { 'hibp-api-key': process.env.HIBP_API_KEY }
      });
      return {
        email,
        breaches: response.data as { name: string; date: string; description: string; }[],
        socialProfiles: [], // Would need additional social media lookup
      };
    } catch (error) {
      return { email, breaches: [], socialProfiles: [] };
    }
  }

  async getCompanyInfo(name: string): Promise<CompanyInfo> {
    // Implement company research
    try {
      // This would typically use a business data API
      return {
        name,
        domain: `${name.toLowerCase().replace(/\s+/g, '')}.com`,
        employees: 0,
        founded: 'Unknown',
        socialMedia: {
          linkedin: `https://linkedin.com/company/${name.toLowerCase()}`,
          twitter: `https://twitter.com/${name.toLowerCase()}`,
          facebook: `https://facebook.com/${name.toLowerCase()}`,
        },
      };
    } catch (error) {
      return { name };
    }
  }

  async getSocialMediaInfo(username: string): Promise<SocialMediaInfo> {
    const platforms = [
      'twitter.com',
      'github.com',
      'linkedin.com/in',
      'instagram.com',
      'facebook.com',
      'reddit.com/user'
    ];

    const results = await Promise.all(
      platforms.map(async (platform) => {
        const url = `https://${platform}/${username}`;
        try {
          const response = await axios.head(url);
          return {
            platform: platform.split('.')[0],
            url,
            exists: response.status === 200,
            username
          };
        } catch {
          return {
            platform: platform.split('.')[0],
            url,
            exists: false,
            username
          };
        }
      })
    );

    return {
      username,
      platforms: results
    };
  }

  async getNetworkInfo(target: string): Promise<NetworkInfo> {
    // Mock network scan response
    return {
      target,
      operatingSystem: 'Linux Ubuntu 20.04',
      openPorts: [
        { port: 80, service: 'http', version: 'nginx/1.18.0', state: 'open' },
        { port: 443, service: 'https', version: 'nginx/1.18.0', state: 'open' },
        { port: 22, service: 'ssh', version: 'OpenSSH 8.2p1', state: 'open' }
      ]
    };
  }

  async getCertificateInfo(domain: string): Promise<CertificateInfo> {
    // Mock certificate info response
    return {
      domain,
      issuer: 'Let\'s Encrypt Authority X3',
      validFrom: new Date().toISOString(),
      validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      subjectAltNames: [`*.${domain}`, domain]
    };
  }

  async runSherlockSearch(username: string): Promise<SocialMediaResult[]> {
    try {
      const response = await axios.get(`/api/osint/sherlock?username=${username}`);
      const results = response.data as SocialMediaResult[];
      
      const foundProfiles = results.filter(r => r.exists).length;
      const severity = foundProfiles > 10 ? 'HIGH' : foundProfiles > 5 ? 'MEDIUM' : 'LOW';
      
      await OsintLogService.log({
        userId: this.userId,
        event: 'OSINT_SHERLOCK',
        type: 'OSINT_SHERLOCK',
        severity,
        description: `Social media search performed for username: ${username}`,
        metadata: { username, results, foundProfiles }
      });

      return results;
    } catch (error) {
      console.error('Sherlock search failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await OsintLogService.log({
        userId: this.userId,
        event: 'OSINT_SHERLOCK_ERROR',
        type: 'OSINT_SHERLOCK',
        severity: 'LOW',
        description: `Social media search failed for username: ${username}`,
        metadata: { username, error: errorMessage }
      });
      return [];
    }
  }

  async getCveInfo(search: string): Promise<any> {
    try {
      const response = await axios.get(`https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${search}`);
      const data = response.data as { vulnerabilities: any[] };
      
      const criticalVulns = data.vulnerabilities.filter(v => 
        v.cve?.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore >= 9.0
      ).length;
      
      await OsintLogService.log({
        userId: this.userId,
        event: 'OSINT_CVE',
        type: 'OSINT_CVE',
        severity: criticalVulns > 0 ? 'HIGH' : 'MEDIUM',
        description: `CVE search performed for: ${search}`,
        metadata: { 
          search, 
          totalVulnerabilities: data.vulnerabilities.length,
          criticalVulnerabilities: criticalVulns
        }
      });

      return data.vulnerabilities;
    } catch (error) {
      console.error('CVE search failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await OsintLogService.log({
        userId: this.userId,
        event: 'OSINT_CVE_ERROR',
        type: 'OSINT_CVE',
        severity: 'LOW',
        description: `CVE search failed for: ${search}`,
        metadata: { search, error: errorMessage }
      });
      throw error;
    }
  }

  async getGoogleDorks(domain: string): Promise<string[]> {
    const dorks = [
      `site:${domain} inurl:login | admin | user | username | password`,
      `site:${domain} filetype:pdf | doc | docx | xlsx | txt`,
      `site:${domain} inurl:config | .env | .git`,
      `site:${domain} "internal use only" | "confidential"`,
      `site:${domain} inurl:backup | old | .bak | .swp`
    ];

    return dorks.map(dork => `https://www.google.com/search?q=${encodeURIComponent(dork)}`);
  }
}