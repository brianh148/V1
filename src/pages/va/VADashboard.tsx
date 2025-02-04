import React from 'react';
import { ClipboardList, CheckCircle, XCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export function VADashboard() {
  const { user } = useAuthStore();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">VA Dashboard</h1>
        <p className="mt-2 text-gray-400">
          Review and process property submissions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <ClipboardList className="w-6 h-6 text-yellow-400" />
            </div>
            <span className="text-2xl font-bold text-gray-100">0</span>
          </div>
          <h3 className="text-gray-300 font-medium">Pending Review</h3>
          <p className="mt-1 text-sm text-gray-400">Properties awaiting review</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-2xl font-bold text-gray-100">0</span>
          </div>
          <h3 className="text-gray-300 font-medium">Approved</h3>
          <p className="mt-1 text-sm text-gray-400">Properties approved today</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
            <span className="text-2xl font-bold text-gray-100">0</span>
          </div>
          <h3 className="text-gray-300 font-medium">Rejected</h3>
          <p className="mt-1 text-sm text-gray-400">Properties rejected today</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-100">Review Queue</h3>
            <div className="mt-4">
              <div className="text-center py-8">
                <p className="text-gray-400">No properties in review queue.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-100">Recent Activity</h3>
            <div className="mt-4">
              <div className="text-center py-8">
                <p className="text-gray-400">No recent activity.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}