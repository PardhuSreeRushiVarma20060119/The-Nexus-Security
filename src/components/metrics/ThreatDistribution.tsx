'use client';

interface ThreatDistributionProps {
  distribution: Record<string, number>;
}

export default function ThreatDistribution({ distribution }: ThreatDistributionProps) {
  const severityColors = {
    critical: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500',
  };

  const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);

  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4">Threat Distribution</h2>
      <div className="space-y-4">
        {Object.entries(distribution).map(([severity, count]) => (
          <div key={severity} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 capitalize">{severity}</span>
              <span className="text-white">{count}</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${severityColors[severity.toLowerCase() as keyof typeof severityColors] || 'bg-gray-500'}`}
                style={{ width: `${(count / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Total Threats</span>
          <span className="text-white font-medium">{total}</span>
        </div>
      </div>
    </div>
  );
} 