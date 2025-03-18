import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface SystemUpdatesProps {
  data: {
    available: number;
    critical: number;
  };
}

export default function SystemUpdates({ data }: SystemUpdatesProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4">System Updates</h2>
      <div className="flex items-center space-x-4 mb-6">
        <div className={`p-3 rounded-lg ${data.critical > 0 ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
          <ArrowPathIcon className={`h-6 w-6 ${data.critical > 0 ? 'text-red-500' : 'text-green-500'}`} />
        </div>
        <div>
          <p className="text-sm text-gray-400">Status</p>
          <p className={`text-lg font-medium ${data.critical > 0 ? 'text-red-500' : 'text-green-500'}`}>
            {data.available === 0 ? 'Up to Date' : `${data.available} Updates Available`}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-400">Available Updates</p>
          <p className="text-white">{data.available} Updates</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Critical Updates</p>
          <p className={`text-white ${data.critical > 0 ? 'text-red-500' : 'text-white'}`}>
            {data.critical} Critical
          </p>
        </div>
      </div>
    </div>
  );
} 