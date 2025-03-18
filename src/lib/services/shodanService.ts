import axios from 'axios';

export interface ShodanHostInfo {
  ip: string;
  hostnames: string[];
  ports: number[];
  vulns?: string[];
  os?: string;
  organization?: string;
  isp?: string;
  asn?: string;
  lastUpdate?: string;
  services: {
    port: number;
    protocol: string;
    service: string;
    version?: string;
  }[];
}

export interface ShodanSearchResult {
  total: number;
  matches: ShodanHostInfo[];
}

export class ShodanService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.shodan.io';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_SHODAN_API_KEY || '';
  }

  async getHostInfo(ip: string): Promise<ShodanHostInfo> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/shodan/host/${ip}?key=${this.apiKey}`
      );
      
      return {
        ip: response.data.ip_str,
        hostnames: response.data.hostnames || [],
        ports: response.data.ports || [],
        vulns: response.data.vulns || [],
        os: response.data.os,
        organization: response.data.org,
        isp: response.data.isp,
        asn: response.data.asn,
        lastUpdate: response.data.last_update,
        services: (response.data.data || []).map((service: any) => ({
          port: service.port,
          protocol: service.transport,
          service: service.product || service._shodan?.module,
          version: service.version
        }))
      };
    } catch (error) {
      console.error('Shodan host lookup failed:', error);
      throw error;
    }
  }

  async searchShodan(query: string): Promise<ShodanSearchResult> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/shodan/host/search?key=${this.apiKey}&query=${encodeURIComponent(query)}`
      );
      
      return {
        total: response.data.total,
        matches: response.data.matches.map((match: any) => ({
          ip: match.ip_str,
          hostnames: match.hostnames || [],
          ports: match.ports || [],
          vulns: match.vulns || [],
          os: match.os,
          organization: match.org,
          isp: match.isp,
          asn: match.asn,
          lastUpdate: match.last_update,
          services: [{
            port: match.port,
            protocol: match.transport,
            service: match.product || match._shodan?.module,
            version: match.version
          }]
        }))
      };
    } catch (error) {
      console.error('Shodan search failed:', error);
      throw error;
    }
  }
} 