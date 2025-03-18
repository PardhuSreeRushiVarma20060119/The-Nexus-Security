import Button from '@/components/ui/Button';
import Glassmorphic from '@/components/ui/Glassmorphic';
import { Database, Play, RefreshCcw } from 'lucide-react';

export default function DatabasePage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Database Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Glassmorphic className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <Database className="w-6 h-6 mr-2" />
              Prisma Studio
            </h2>
          </div>
          <p className="text-gray-400 mb-4">
            Launch Prisma Studio to manage your database with a visual interface.
          </p>
          <form action="/api/admin/database/launch-studio" method="POST">
            <Button 
              type="submit"
              className="w-full flex items-center justify-center"
            >
              <Play className="w-4 h-4 mr-2" />
              Launch Prisma Studio
            </Button>
          </form>
        </Glassmorphic>

        <Glassmorphic className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <RefreshCcw className="w-6 h-6 mr-2" />
              Database Stats
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Users</span>
              <span className="font-semibold">Loading...</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Scans</span>
              <span className="font-semibold">Loading...</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Database Size</span>
              <span className="font-semibold">Loading...</span>
            </div>
          </div>
        </Glassmorphic>
      </div>
    </div>
  );
} 