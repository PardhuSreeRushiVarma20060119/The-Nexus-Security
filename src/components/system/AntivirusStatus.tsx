import { ShieldCheckIcon } from '@heroicons/react/24/outline';

interface AntivirusStatusProps {
  data: {
    installed: boolean;
    status: string;
    lastUpdate: string;
  };
}

export default function AntivirusStatus({ data }: AntivirusStatusProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white mb-4">Antivirus Status</h2>
      <div className="flex items-center space-x-4 mb-6">
        <div className={`p-3 rounded-lg ${data.installed ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
          <ShieldCheckIcon className={`h-6 w-6 ${data.installed ? 'text-green-500' : 'text-red-500'}`} />
        </div>
        <div>
          <p className="text-sm text-gray-400">Status</p>
          <p className={`text-lg font-medium ${data.installed ? 'text-green-500' : 'text-red-500'}`}>
            {data.status}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-400">Installation</p>
          <p className="text-white">{data.installed ? 'Installed' : 'Not Installed'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Last Update</p>
          <p className="text-white">{new Date(data.lastUpdate).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
} 