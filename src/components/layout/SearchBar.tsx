'use client';

import { useEffect, useRef, useState } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSearch } from '@/contexts/SearchContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchBar() {
  const { isOpen, query, results, isLoading, openSearch, closeSearch, search, clearSearch } = useSearch();
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape') {
        closeSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openSearch, closeSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    search(value);
  };

  const handleResultClick = (path: string) => {
    router.push(path);
    closeSearch();
    clearSearch();
  };

  return (
    <>
      {/* Search Button */}
      <button
        onClick={openSearch}
        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <MagnifyingGlassIcon className="h-5 w-5" />
        <span>Search</span>
        <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-medium text-gray-400 bg-gray-800 rounded border border-gray-700">
          <span className="sr-only">Press </span>⌘
          <span className="sr-only"> and </span>K
        </kbd>
      </button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSearch}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Search Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-1/4 -translate-x-1/2 w-full max-w-2xl z-50"
            >
              <div className="mx-4 bg-gray-900 rounded-lg shadow-xl border border-gray-800">
                {/* Search Input */}
                <div className="flex items-center gap-2 p-4 border-b border-gray-800">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="Search features, reports, and settings..."
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500"
                  />
                  {inputValue && (
                    <button
                      onClick={() => {
                        setInputValue('');
                        clearSearch();
                      }}
                      className="p-1 hover:bg-gray-800 rounded-full transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5 text-gray-400" />
                    </button>
                  )}
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 text-center text-gray-400">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    </div>
                  ) : results.length > 0 ? (
                    <div className="py-2">
                      {results.map((result) => (
                        <motion.button
                          key={result.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          onClick={() => handleResultClick(result.path)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{result.icon}</span>
                            <div>
                              <div className="text-white font-medium">{result.title}</div>
                              <div className="text-sm text-gray-400">{result.description}</div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  ) : query ? (
                    <div className="p-4 text-center text-gray-400">
                      No results found
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
} 