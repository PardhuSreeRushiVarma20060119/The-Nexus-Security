'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface SearchContextType {
  isOpen: boolean;
  query: string;
  results: SearchResult[];
  isLoading: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  search: (query: string) => Promise<void>;
  clearSearch: () => void;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'dashboard' | 'security' | 'system' | 'reports' | 'settings';
  path: string;
  icon?: string;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const openSearch = useCallback(() => setIsOpen(true), []);
  const closeSearch = useCallback(() => setIsOpen(false), []);
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
  }, []);

  const search = useCallback(async (searchQuery: string) => {
    setQuery(searchQuery);
    setIsLoading(true);

    try {
      // Simulate API call with debounce
      await new Promise(resolve => setTimeout(resolve, 300));

      // Define searchable items
      const searchableItems: SearchResult[] = [
        {
          id: 'dashboard',
          title: 'Dashboard',
          description: 'View your security overview and metrics',
          type: 'dashboard',
          path: '/dashboard',
          icon: '📊'
        },
        {
          id: 'security-metrics',
          title: 'Security Metrics',
          description: 'Detailed security analytics and reports',
          type: 'security',
          path: '/security-metrics',
          icon: '🔒'
        },
        {
          id: 'system-health',
          title: 'System Health',
          description: 'Monitor system performance and health',
          type: 'system',
          path: '/system-health',
          icon: '💻'
        },
        {
          id: 'malware-analysis',
          title: 'Malware Analysis',
          description: 'Scan and analyze files for malware',
          type: 'security',
          path: '/malware-analysis',
          icon: '🦠'
        },
        {
          id: 'log-analysis',
          title: 'Log Analysis',
          description: 'View and analyze system logs',
          type: 'system',
          path: '/log-analysis',
          icon: '📝'
        },
        {
          id: 'reports',
          title: 'Reports',
          description: 'View all security reports',
          type: 'reports',
          path: '/reports',
          icon: '📄'
        },
        {
          id: 'settings',
          title: 'Settings',
          description: 'Configure your security settings',
          type: 'settings',
          path: '/settings',
          icon: '⚙️'
        }
      ];

      // Filter results based on query
      const filteredResults = searchableItems.filter(item => {
        const searchLower = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
        );
      });

      setResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = {
    isOpen,
    query,
    results,
    isLoading,
    openSearch,
    closeSearch,
    search,
    clearSearch
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
} 