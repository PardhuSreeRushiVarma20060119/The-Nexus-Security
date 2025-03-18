'use client';

import React, { useState, useEffect } from 'react';
import { Download, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import type { SocialMediaPlatform, NetworkPort } from '@/lib/services/osintService';
import type { ShodanHostInfo } from '@/lib/services/shodanService';

interface OsintResult {
  id: string;
  type: string;
  target: string;
  findings: string[];
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}

const mockResults: OsintResult[] = [
  {
    id: '1',
    type: 'WHOIS',
    target: 'example.com',
    findings: ['Domain expires in 30 days', 'Registrar: Example Registrar'],
    severity: 'low',
    timestamp: new Date().toISOString()
  },
  {
    id: '2',
    type: 'Shodan',
    target: '192.168.1.1',
    findings: ['Open ports: 80, 443', 'Running nginx 1.18.0'],
    severity: 'medium',
    timestamp: new Date().toISOString()
  }
];

export default function OsintResults() {
  const [results, setResults] = useState<OsintResult[]>([]);

  useEffect(() => {
    const handleOsintResult = (event: CustomEvent<{ tool: string; result: any }>) => {
      const { tool, result } = event.detail;
      
      // Convert the result to our format based on the tool type
      let newResults: OsintResult[] = [];
      
      switch (tool) {
        case 'domain':
          newResults = [
            {
              id: '1',
              type: 'Domain',
              target: result.domain,
              findings: [
                `Registrar: ${result.registrar}, Created: ${result.creationDate}`,
                `${result.technologies?.length || 0} technologies detected`,
                `${result.ports?.length || 0} ports detected`
              ],
              severity: 'low',
              timestamp: new Date().toISOString()
            },
            {
              id: '2',
              type: 'Technologies',
              target: result.technologies?.join(', ') || 'None detected',
              findings: [],
              severity: 'low',
              timestamp: new Date().toISOString()
            },
            {
              id: '3',
              type: 'Ports',
              target: result.ports?.join(', ') || 'None detected',
              findings: [],
              severity: 'low',
              timestamp: new Date().toISOString()
            }
          ];
          break;
          
        case 'social':
          const activePlatforms = (result.platforms as SocialMediaPlatform[]).filter(p => p.exists);
          newResults = [
            {
              id: '4',
              type: 'Social Media',
              target: result.username,
              findings: [
                `Found on ${activePlatforms.length} platforms`,
                ...activePlatforms.map(p => p.platform)
              ],
              severity: activePlatforms.length > 0 ? 'medium' : 'low',
              timestamp: new Date().toISOString()
            },
            ...activePlatforms.map(p => ({
              id: `5-${p.platform}`, 
              type: 'Platform',
              target: p.url,
              findings: [],
              severity: p.platform.toLowerCase().includes('linkedin') ? 'high' : 'medium' as 'low' | 'medium' | 'high',
              timestamp: new Date().toISOString()
            }))
          ];
          break;
          
        case 'network':
          newResults = [
            {
              id: '6',
              type: 'Network',
              target: result.target,
              findings: [
                `OS: ${result.operatingSystem || 'Unknown'}`,
                ...result.openPorts.map((port: NetworkPort) => `${port.port}/${port.service}`)
              ],
              severity: 'info',
              timestamp: new Date().toISOString()
            },
            ...result.openPorts.map((port: NetworkPort) => ({
              id: `7-${port.port}`,
              type: 'Port',
              target: `${port.port}/${port.service}`,
              findings: [
                port.version ? `Version: ${port.version}` : 'Unknown version',
                // Remove optional chaining since vulnerabilities doesn't exist on NetworkPort
                port.vulnerabilities && port.vulnerabilities.length ? 'Vulnerable' : 'Not vulnerable'  
              ],
              severity: port.port === 22 ? 'high' : 'medium',
              timestamp: new Date().toISOString()
            }))
          ];
          break;

        case 'certificate':
          newResults = [
            {
              id: '8',
              type: 'Certificate',
              target: result.domain,
              findings: [
                `Issuer: ${result.issuer}, Valid until: ${new Date(result.validTo).toLocaleDateString()}`,
                `${result.subjectAltNames.length} alternative names`
              ],
              severity: new Date(result.validTo) < new Date() ? 'high' : 'low',
              timestamp: new Date().toISOString()
            },
            {
              id: '9',
              type: 'Alternative Names',
              target: result.subjectAltNames.join(', '),
              findings: [],
              severity: 'low',
              timestamp: new Date().toISOString()
            }
          ];
          break;

        case 'shodan':
          if ('matches' in result) {
            // Search results
            newResults = [
              {
                id: '10',
                type: 'Shodan Search',
                target: `Found ${result.total} results`,
                findings: [
                  `Showing first ${result.matches.length} matches`,
                  ...result.matches.map((match: ShodanHostInfo) => match.ip)
                ],
                severity: 'info',
                timestamp: new Date().toISOString()
              },
              ...result.matches.map((match: ShodanHostInfo) => ({
                id: `11-${match.ip}`,
                type: 'Host',
                target: match.ip,
                findings: [
                  `Organization: ${match.organization || 'Unknown'}, Ports: ${match.ports.join(', ')}`,
                  match.vulns?.length ? 'Vulnerable' : 'Not vulnerable'
                ],
                severity: match.vulns?.length ? 'high' : 'medium',
                timestamp: new Date().toISOString()
              }))
            ];
          } else {
            // Single host results
            newResults = [
              {
                id: '12',
                type: 'Host Information',
                target: result.ip,
                findings: [
                  `Organization: ${result.organization || 'Unknown'}, OS: ${result.os || 'Unknown'}`,
                  `${result.services.length} services detected`
                ],
                severity: 'low',
                timestamp: new Date().toISOString()
              },
              {
                id: '13',
                type: 'Services',
                target: result.services.map((s: { port: number; protocol: string; service: string; version?: string }) => `${s.port}/${s.protocol} (${s.service}${s.version ? ` ${s.version}` : ''})`).join(', '),
                findings: [],
                severity: 'medium',
                timestamp: new Date().toISOString()
              }
            ];

            if (result.vulns?.length) {
              newResults.push({
                id: '14',
                type: 'Vulnerabilities',
                target: result.vulns.join(', '),
                findings: [],
                severity: 'high',
                timestamp: new Date().toISOString()
              });
            }
          }
          break;
      }
      
      setResults(prev => [...newResults, ...prev]);
    };

    window.addEventListener('osint-result', handleOsintResult as EventListener);
    return () => {
      window.removeEventListener('osint-result', handleOsintResult as EventListener);
    };
  }, []);

  const handleExport = () => {
    const csv = results.map(r => 
      `${r.type},${r.target},${r.findings.join(', ')},${r.severity}`
    ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'osint-results.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Recent Results</h2>
        <button className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>

      <div className="space-y-4">
        {results.map((result) => (
          <div
            key={result.id}
            className={`p-4 rounded-lg border ${
              result.severity === 'high'
                ? 'border-red-500/50 bg-red-500/10'
                : result.severity === 'medium'
                ? 'border-yellow-500/50 bg-yellow-500/10'
                : 'border-green-500/50 bg-green-500/10'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                {result.severity === 'high' ? (
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                ) : result.severity === 'medium' ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                )}
                <h3 className="text-sm font-medium text-white">{result.type}</h3>
              </div>
              <div className="flex items-center text-gray-400 text-xs">
                <Clock className="h-4 w-4 mr-1" />
                {new Date(result.timestamp).toLocaleString()}
              </div>
            </div>
            <p className="text-sm text-gray-300 mb-2">Target: {result.target}</p>
            <ul className="space-y-1">
              {result.findings.map((finding, index) => (
                <li key={index} className="text-sm text-gray-400">
                  • {finding}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
} 