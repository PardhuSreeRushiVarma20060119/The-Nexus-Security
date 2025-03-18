import { Metadata } from 'next';
import SecuritySettings from '@/components/settings/SecuritySettings';
import ProfileSettings from '@/components/settings/ProfileSettings';

export const metadata: Metadata = {
  title: 'Settings | Nexus Security Platform',
  description: 'Manage your security and profile settings',
};

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProfileSettings />
          <SecuritySettings />
        </div>
      </div>
    </div>
  );
} 