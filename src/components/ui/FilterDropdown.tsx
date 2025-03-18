'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X } from 'lucide-react';
import { useState } from 'react';

interface FilterOption {
  id: string;
  label: string;
  value: string;
}

interface FilterDropdownProps {
  options: FilterOption[];
  selectedFilters: string[];
  onFilterChange: (filters: string[]) => void;
  label?: string;
  className?: string;
}

export default function FilterDropdown({
  options,
  selectedFilters,
  onFilterChange,
  label = 'Filters',
  className = '',
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleFilter = (filterId: string) => {
    const newFilters = selectedFilters.includes(filterId)
      ? selectedFilters.filter((id) => id !== filterId)
      : [...selectedFilters, filterId];
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    onFilterChange([]);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          inline-flex items-center px-4 py-2
          border border-gray-300 rounded-lg
          text-sm font-medium text-gray-700
          bg-white hover:bg-gray-50
          focus:outline-none focus:ring-2 focus:ring-primary/20
        `}
      >
        <Filter className="w-4 h-4 mr-2" />
        {label}
        {selectedFilters.length > 0 && (
          <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-primary text-white rounded-full">
            {selectedFilters.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute z-50 mt-2 w-56 rounded-lg bg-white shadow-lg border border-gray-200"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900">{label}</h3>
                {selectedFilters.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {options.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFilters.includes(option.id)}
                      onChange={() => toggleFilter(option.id)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 