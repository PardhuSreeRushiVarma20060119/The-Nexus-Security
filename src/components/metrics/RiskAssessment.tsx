'use client';

import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

interface RiskAssessmentProps {
  score: number;
}

export default function RiskAssessment({ score }: RiskAssessmentProps) {
  const getRiskLevel = (score: number) => {
    if (score >= 100) return { level: 'Critical', color: 'text-red-500' };
    if (score >= 50) return { level: 'High', color: 'text-orange-500' };
    if (score >= 25) return { level: 'Medium', color: 'text-yellow-500' };
    return { level: 'Low', color: 'text-green-500' };
  };

  const { level, color } = getRiskLevel(score);
  const normalizedScore = Math.min(100, Math.max(0, score));

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4">Risk Assessment</h2>
      <div className="flex items-center space-x-4 mb-6">
        <div className={`p-3 rounded-lg bg-opacity-10 ${color} bg-current`}>
          <ShieldExclamationIcon className={`h-6 w-6 ${color}`} />
        </div>
        <div>
          <p className="text-sm text-gray-400">Risk Level</p>
          <p className={`text-lg font-medium ${color}`}>{level}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Risk Score</span>
          <span className={`font-medium ${color}`}>{normalizedScore}</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${color} bg-current`}
            style={{ width: `${(normalizedScore / 100) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="p-3 bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-400">Recommendations</p>
          <ul className="mt-2 space-y-1 text-sm text-white">
            {score >= 50 && (
              <li>• Review and address high-severity threats immediately</li>
            )}
            {score >= 25 && (
              <li>• Update security policies and access controls</li>
            )}
            <li>• Regular security scans and monitoring</li>
            <li>• Keep systems and software up to date</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 