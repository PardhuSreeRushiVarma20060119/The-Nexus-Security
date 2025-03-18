'use client';

import { useState, useEffect } from 'react';
import { Card, Title, Text, Button, Grid, Switch } from '@tremor/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface SecuritySettings {
  autoScanEnabled: boolean;
  scanInterval: number;
  notificationsEnabled: boolean;
  twoFactorEnabled: boolean;
  firewallEnabled: boolean;
  networkMonitoring: boolean;
  aiInsightsEnabled: boolean;
}

export default function SecuritySettings() {
  const { data: session } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<SecuritySettings>({
    autoScanEnabled: true,
    scanInterval: 24,
    notificationsEnabled: true,
    twoFactorEnabled: false,
    firewallEnabled: true,
    networkMonitoring: true,
    aiInsightsEnabled: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch current settings
    fetch('/api/settings/security')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setSettings(data.settings);
        }
      })
      .catch(console.error);
  }, []);

  const updateSetting = async (key: keyof SecuritySettings, value: boolean | number) => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/settings/security', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [key]: value,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update settings');
      }

      setSettings(prev => ({
        ...prev,
        [key]: value,
      }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="p-6 bg-[var(--background)]">
      <div className="mb-6">
        <Title>Security Settings</Title>
        <Text>Configure your security preferences and protection levels</Text>
      </div>

      <Grid numItems={1} numItemsLg={2} className="gap-6">
        <Card className="p-6">
          <Title className="mb-4">Automated Protection</Title>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Text className="font-medium">Automatic System Scans</Text>
                <Text className="text-sm text-gray-500">
                  Regularly scan your system for threats
                </Text>
              </div>
              <Switch
                checked={settings.autoScanEnabled}
                onChange={() => updateSetting('autoScanEnabled', !settings.autoScanEnabled)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Text className="font-medium">Network Monitoring</Text>
                <Text className="text-sm text-gray-500">
                  Monitor network activity in real-time
                </Text>
              </div>
              <Switch
                checked={settings.networkMonitoring}
                onChange={() => updateSetting('networkMonitoring', !settings.networkMonitoring)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Text className="font-medium">Firewall Protection</Text>
                <Text className="text-sm text-gray-500">
                  Block unauthorized network access
                </Text>
              </div>
              <Switch
                checked={settings.firewallEnabled}
                onChange={() => updateSetting('firewallEnabled', !settings.firewallEnabled)}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <Title className="mb-4">Security Features</Title>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Text className="font-medium">Two-Factor Authentication</Text>
                <Text className="text-sm text-gray-500">
                  Add an extra layer of security to your account
                </Text>
              </div>
              <Switch
                checked={settings.twoFactorEnabled}
                onChange={() => updateSetting('twoFactorEnabled', !settings.twoFactorEnabled)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Text className="font-medium">Security Notifications</Text>
                <Text className="text-sm text-gray-500">
                  Get alerts about security events
                </Text>
              </div>
              <Switch
                checked={settings.notificationsEnabled}
                onChange={() => updateSetting('notificationsEnabled', !settings.notificationsEnabled)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Text className="font-medium">AI-Powered Insights</Text>
                <Text className="text-sm text-gray-500">
                  Get intelligent security recommendations
                </Text>
              </div>
              <Switch
                checked={settings.aiInsightsEnabled}
                onChange={() => updateSetting('aiInsightsEnabled', !settings.aiInsightsEnabled)}
              />
            </div>
          </div>
        </Card>
      </Grid>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
} 