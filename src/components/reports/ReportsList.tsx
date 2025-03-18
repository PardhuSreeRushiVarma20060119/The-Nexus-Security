'use client';
import React from 'react';
import { format } from 'date-fns';
import { Download, Eye } from 'lucide-react';
import type { Report } from '@/types/reports';

interface ReportsListProps {
  reports: Report[];
}

export default function ReportsList({ reports }: ReportsListProps) {
  const handleDownload = (report: Report) => {
    // Implement report download logic
  };

  const handleView = (report: Report) => {
    // Implement report view logic
  };

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div
          key={report.id}
          className="bg-gray-900 rounded-lg p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">{report.title}</h3>
              <p className="text-sm text-gray-400">
                {format(new Date(report.createdAt), 'PPP')}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleView(report)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDownload(report)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className={`px-2 py-1 rounded-full text-xs ${
              report.severity === 'high' ? 'bg-red-900 text-red-200' :
              report.severity === 'medium' ? 'bg-yellow-900 text-yellow-200' :
              report.severity === 'low' ? 'bg-green-900 text-green-200' :
              'bg-blue-900 text-blue-200'
            }`}>
              {report.severity}
            </span>
            <span className="text-sm text-gray-400">{report.type}</span>
          </div>

          <p className="text-gray-300">{report.summary}</p>
        </div>
      ))}
    </div>
  );
} 