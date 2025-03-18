'use client';

import React, { useState } from 'react';
import { Search, Globe, Loader2 } from 'lucide-react';

interface WhoisResult {
  domain: string;
  registrar: string;
  createdDate: string;
  expiryDate: string;
  nameServers: string[];
  status: string[];
}

export default function WhoisFinder() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<WhoisResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/osint/whois?domain=${domain}`);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('WHOIS lookup failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">WHOIS Lookup</h2>
      
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="Enter domain name..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !domain}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>

      {result && (
        <div className="mt-6 space-y-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-4">{result.domain}</h3>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-gray-400">Registrar</dt>
                <dd className="text-sm text-white">{result.registrar}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-400">Created Date</dt>
                <dd className="text-sm text-white">{result.createdDate}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-400">Expiry Date</dt>
                <dd className="text-sm text-white">{result.expiryDate}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-400">Name Servers</dt>
                <dd className="text-sm text-white">
                  {result.nameServers.join(', ')}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
} 