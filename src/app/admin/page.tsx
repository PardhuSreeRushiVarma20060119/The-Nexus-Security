import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin) {
    redirect('/');
  }

  const stats = await Promise.all([
    prisma.user.count(),
    prisma.malwareAnalysis.count(),
    prisma.file.count(),
  ]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Total Users</h2>
          <p className="text-3xl font-bold text-blue-600">{stats[0]}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Malware Analyses</h2>
          <p className="text-3xl font-bold text-green-600">{stats[1]}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Files Analyzed</h2>
          <p className="text-3xl font-bold text-purple-600">{stats[2]}</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/admin/users"
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold">Manage Users</h3>
            <p className="text-sm text-gray-600">View and manage user accounts</p>
          </a>
          
          <a
            href="/admin/database"
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold">Database Management</h3>
            <p className="text-sm text-gray-600">Access Prisma Studio and database tools</p>
          </a>
          
          <a
            href="/admin/config"
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold">Server Configuration</h3>
            <p className="text-sm text-gray-600">Configure system settings and parameters</p>
          </a>
          
          <a
            href="/admin/security"
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold">Security Logs</h3>
            <p className="text-sm text-gray-600">View security events and audit logs</p>
          </a>
        </div>
      </div>
    </div>
  );
} 