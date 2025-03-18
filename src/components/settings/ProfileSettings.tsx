'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function ProfileSettings() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      if (profile.newPassword && profile.newPassword !== profile.confirmPassword) {
        setError('New passwords do not match');
        return;
      }

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update the session to reflect the changes
      await update({
        ...session,
        user: {
          ...session?.user,
          name: profile.name,
          email: profile.email,
        },
      });

      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold text-white mb-6">Profile Settings</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-white mb-2">Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="form-input w-full bg-gray-800 text-white rounded border-gray-700"
          />
        </div>

        <div>
          <label className="block text-white mb-2">Email</label>
          <input
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            className="form-input w-full bg-gray-800 text-white rounded border-gray-700"
          />
        </div>

        <div className="border-t border-gray-800 pt-6">
          <h3 className="text-lg font-medium text-white mb-4">Change Password</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">Current Password</label>
              <input
                type="password"
                value={profile.currentPassword}
                onChange={(e) =>
                  setProfile({ ...profile, currentPassword: e.target.value })
                }
                className="form-input w-full bg-gray-800 text-white rounded border-gray-700"
              />
            </div>

            <div>
              <label className="block text-white mb-2">New Password</label>
              <input
                type="password"
                value={profile.newPassword}
                onChange={(e) =>
                  setProfile({ ...profile, newPassword: e.target.value })
                }
                className="form-input w-full bg-gray-800 text-white rounded border-gray-700"
              />
            </div>

            <div>
              <label className="block text-white mb-2">Confirm New Password</label>
              <input
                type="password"
                value={profile.confirmPassword}
                onChange={(e) =>
                  setProfile({ ...profile, confirmPassword: e.target.value })
                }
                className="form-input w-full bg-gray-800 text-white rounded border-gray-700"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm mt-2">{error}</div>
        )}

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
} 