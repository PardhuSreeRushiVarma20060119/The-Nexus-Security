'use client';

import React, { useState } from 'react';
import { Globe, Search, Shield, Database, FileSearch } from 'lucide-react';
import { OsintService } from '@/lib/services/osintService';
import { ShodanService } from '@/lib/services/shodanService';
import { useSession } from 'next-auth/react';

const tools = [
  {
    id: 'whois',
    name: 'WHOIS Lookup',
    icon: Globe,
    description: 'Domain registration information'
  },
  {
    id: 'sherlock',
    name: 'Sherlock',
    icon: Search,
    description: 'Username search across platforms'
  },
  {
    id: 'shodan',
    name: 'Shodan Search',
    icon: Database,
    description: 'IoT and device intelligence'
  },
  {
    id: 'cve',
    name: 'CVE Search',
    icon: Shield,
    description: 'Vulnerability database search'
  },
  {
    id: 'dorks',
    name: 'Google Dorks',
    icon: FileSearch,
    description: 'Advanced search queries'
  }
];

export default function OsintTools() {
  const { data: session } = useSession();
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const osintService = session?.user?.id ? new OsintService(session.user.id) : null;
  const shodanService = new ShodanService();

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
    setSearchQuery('');
    setError(null);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    if (!osintService) {
      setError('Please sign in to use OSINT tools');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      let result;
      switch (selectedTool) {
        case 'whois':
          result = await osintService.getDomainInfo(searchQuery);
          break;
        case 'sherlock':
          result = await osintService.runSherlockSearch(searchQuery);
          break;
        case 'cve':
          result = await osintService.getCveInfo(searchQuery);
          break;
        case 'shodan':
          if (searchQuery.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
            result = await shodanService.getHostInfo(searchQuery);
          } else {
            result = await shodanService.searchShodan(searchQuery);
          }
          break;
        case 'dorks':
          result = await osintService.getGoogleDorks(searchQuery);
          break;
        default:
          result = null;
      }

      if (result) {
        const event = new CustomEvent('osint-result', { 
          detail: { tool: selectedTool, result } 
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setError('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => handleToolSelect(tool.id)}
            className={`group p-6 rounded-xl border transition-all duration-300 backdrop-blur-md ${
              selectedTool === tool.id
                ? 'border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                : 'border-gray-200/20 bg-gray-900/40 hover:bg-gray-900/60 hover:border-gray-200/40 hover:shadow-lg'
            }`}
          >
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`p-3 rounded-full transition-all duration-300 ${
                selectedTool === tool.id
                  ? 'bg-blue-500/20'
                  : 'bg-gray-800/50 group-hover:bg-gray-800'
              }`}>
                <tool.icon className={`h-6 w-6 transition-colors duration-300 ${
                  selectedTool === tool.id
                    ? 'text-blue-400'
                    : 'text-gray-400 group-hover:text-gray-300'
                }`} />
              </div>
              <span className={`text-sm font-medium transition-colors duration-300 ${
                selectedTool === tool.id
                  ? 'text-blue-400'
                  : 'text-gray-300'
              }`}>{tool.name}</span>
              <span className="text-xs text-gray-500">{tool.description}</span>
            </div>
          </button>
        ))}
      </div>

      {selectedTool && (
        <div className="backdrop-blur-md bg-gray-900/40 p-4 rounded-xl border border-gray-200/20 shadow-lg">
          <div className="flex space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter search query..."
              className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-300"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={isLoading || !searchQuery.trim()}
              className={`px-6 py-2 rounded-lg text-white font-medium transition-all duration-300 ${
                isLoading || !searchQuery.trim()
                  ? 'bg-gray-700/50 cursor-not-allowed'
                  : 'bg-blue-500/80 hover:bg-blue-500 hover:shadow-md hover:shadow-blue-500/20'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Searching...</span>
                </div>
              ) : (
                'Search'
              )}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="backdrop-blur-md bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl shadow-lg" role="alert">
          <p className="font-medium">{error}</p>
        </div>
      )}
    </div>
  );
} 