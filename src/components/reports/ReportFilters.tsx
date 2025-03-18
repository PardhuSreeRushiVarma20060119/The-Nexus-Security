'use client';

import React from 'react';

export default function ReportFilters() {
  return (
    <div className="bg-gray-900 rounded-lg p-6 space-y-6">
      <h2 className="text-lg font-semibold text-white">Filters</h2>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400">Report Type</label>
          <select className="mt-1 w-full bg-gray-800 text-white rounded-lg p-2">
            <option value="">All Types</option>
            <option value="malware">Malware Analysis</option>
            <option value="network">Network Scan</option>
            <option value="osint">OSINT</option>
            <option value="vulnerability">Vulnerability</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-400">Severity</label>
          <select className="mt-1 w-full bg-gray-800 text-white rounded-lg p-2">
            <option value="">All Severities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="info">Info</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-400">Date Range</label>
          <select className="mt-1 w-full bg-gray-800 text-white rounded-lg p-2">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>
    </div>
  );
} 