'use client';

import { useEffect, useState } from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function SecurityScore() {
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSecurityScore = async () => {
      try {
        const response = await fetch('/api/security-metrics');
        const data = await response.json();
        setScore(data.score);
      } catch (error) {
        console.error('Error fetching security score:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSecurityScore();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 50) return 'text-orange-500';
    return 'text-red-500';
  };

  const getRiskLevel = (score: number) => {
    if (score >= 90) return 'Low Risk';
    if (score >= 70) return 'Moderate Risk';
    if (score >= 50) return 'High Risk';
    return 'Critical Risk';
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <h2 className="text-xl font-semibold text-white mb-4">Security Score</h2>
        <div className="h-24 bg-gray-800 rounded-lg mb-4"></div>
      </div>
    );
  }

  if (score === null) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Security Score</h2>
        <p className="text-gray-400">Unable to load security score</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-4">Security Score</h2>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <ShieldCheckIcon className={`h-8 w-8 ${getScoreColor(score)}`} />
          <div>
            <p className={`text-3xl font-bold ${getScoreColor(score)}`}>
              {score}
            </p>
            <p className="text-sm text-gray-400">out of 100</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-sm font-medium ${getScoreColor(score)}`}>
            {getRiskLevel(score)}
          </p>
          <p className="text-xs text-gray-400">Current Status</p>
        </div>
      </div>

      <div className="w-full bg-gray-800 rounded-full h-2.5 mb-4">
        <div
          className={`h-2.5 rounded-full ${getScoreColor(score)}`}
          style={{ width: `${score}%` }}
        ></div>
      </div>

      <div className="text-sm text-gray-400">
        {score >= 90 ? (
          'Your system is well-protected'
        ) : score >= 70 ? (
          'Some improvements recommended'
        ) : score >= 50 ? (
          'Action required to improve security'
        ) : (
          'Immediate action required'
        )}
      </div>
    </div>
  );
} 