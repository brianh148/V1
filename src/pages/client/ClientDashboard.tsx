import React from 'react';
import { Building2, ClipboardList, UserCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export function ClientDashboard() {
  const { user } = useAuthStore();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">Welcome back!</h1>
        <p className="mt-2 text-gray-400">
          Manage your properties and track your requests from one place.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-2xl font-bold text-gray-100">0</span>
          </div>
          <h3 className="text-gray-300 font-medium">Saved Properties</h3>
          <p className="mt-1 text-sm text-gray-400">Properties you've bookmarked</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <UserCheck className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-2xl font-bold text-gray-100">0</span>
          </div>
          <h3 className="text-gray-300 font-medium">Agent Requests</h3>
          <p className="mt-1 text-sm text-gray-400">Active agent communications</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <ClipboardList className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-2xl font-bold text-gray-100">0</span>
          </div>
          <h3 className="text-gray-300 font-medium">Inspection Requests</h3>
          <p className="mt-1 text-sm text-gray-400">Pending and completed inspections</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-100">Recent Activity</h3>
            <div className="mt-4">
              <div className="text-center py-8">
                <p className="text-gray-400">No recent activity to show.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-100">Recommended Properties</h3>
            <div className="mt-4">
              <div className="text-center py-8">
                <p className="text-gray-400">No recommendations available yet.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}