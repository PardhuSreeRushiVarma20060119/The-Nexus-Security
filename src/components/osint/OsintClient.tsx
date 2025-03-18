'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

const OsintDashboard = dynamic(() => import('./OsintDashboard'), { 
  ssr: false,
  loading: () => <div className="bg-gray-900 p-6 rounded-lg shadow-lg animate-pulse">Loading dashboard...</div>
});

const OsintTools = dynamic(() => import('./OsintTools'), { 
  ssr: false,
  loading: () => <div className="bg-gray-900 p-6 rounded-lg shadow-lg animate-pulse">Loading tools...</div>
});

const OsintResults = dynamic(() => import('./OsintResults'), { 
  ssr: false,
  loading: () => <div className="bg-gray-900 p-6 rounded-lg shadow-lg animate-pulse">Loading results...</div>
});

export default function OsintClient() {
  return (
    <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OSINT Tools Panel */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <OsintTools />
        </div>

        {/* Results Dashboard */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
          <OsintDashboard />
        </div>
      </div>

      {/* OSINT Results */}
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
        <OsintResults />
      </div>
    </Suspense>
  );
} 