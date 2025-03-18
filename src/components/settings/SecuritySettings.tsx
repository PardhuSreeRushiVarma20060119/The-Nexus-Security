'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SecuritySettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    autoScanEnabled: true,
    scanInterval: 24,
    notificationsEnabled: true,
    twoFactorEnabled: false,
  });

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      router.refresh();
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-white mb-6">Security Settings</h2>
      
      <div className="space-y-6">
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.autoScanEnabled}
              onChange={(e) =>
                setSettings({ ...settings, autoScanEnabled: e.target.checked })
              }
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="text-white">Enable automatic security scans</span>
          </label>
        </div>

        <div>
          <label className="block text-white mb-2">Scan Interval (hours)</label>
          <input
            type="number"
            value={settings.scanInterval}
            onChange={(e) =>
              setSettings({
                ...settings,
                scanInterval: parseInt(e.target.value) || 24,
              })
            }
            min="1"
            max="168"
            className="form-input w-full bg-gray-800 text-white rounded border-gray-700"
          />
        </div>

        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  notificationsEnabled: e.target.checked,
                })
              }
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="text-white">Enable security notifications</span>
          </label>
        </div>

        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.twoFactorEnabled}
              onChange={(e) =>
                setSettings({ ...settings, twoFactorEnabled: e.target.checked })
              }
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="text-white">Enable two-factor authentication</span>
          </label>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Security Settings'}
        </button>
      </div>
    </div>
  );
} 