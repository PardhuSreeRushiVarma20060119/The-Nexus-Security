import { FireIcon } from '@heroicons/react/24/outline';

interface FirewallStatusProps {
  data: {
    enabled: boolean;
    rules: number;
  };
}

export default function FirewallStatus({ data }: FirewallStatusProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4">Firewall Status</h2>
      <div className="flex items-center space-x-4 mb-6">
        <div className={`p-3 rounded-lg ${data.enabled ? 'bg-blue-500/10' : 'bg-red-500/10'}`}>
          <FireIcon className={`h-6 w-6 ${data.enabled ? 'text-blue-500' : 'text-red-500'}`} />
        </div>
        <div>
          <p className="text-sm text-gray-400">Status</p>
          <p className={`text-lg font-medium ${data.enabled ? 'text-blue-500' : 'text-red-500'}`}>
            {data.enabled ? 'Active' : 'Inactive'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-400">Active Rules</p>
          <p className="text-white">{data.rules} Rules</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Protection Level</p>
          <p className="text-white">
            {data.enabled ? (data.rules > 10 ? 'High' : 'Medium') : 'Low'}
          </p>
        </div>
      </div>
    </div>
  );
} 