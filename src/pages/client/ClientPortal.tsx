import React from 'react';
import { Building2, ClipboardList, Send, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export function ClientPortal() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">Client Dashboard</h1>
        <p className="mt-2 text-gray-400">
          Manage your property requests and track your investments
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-2xl font-bold text-gray-100">0</span>
          </div>
          <h3 className="text-gray-300 font-medium">Active Properties</h3>
          <p className="mt-1 text-sm text-gray-400">Properties under review</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Send className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-2xl font-bold text-gray-100">0</span>
          </div>
          <h3 className="text-gray-300 font-medium">Sent Requests</h3>
          <p className="mt-1 text-sm text-gray-400">Requests sent to agents</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-2xl font-bold text-gray-100">0</span>
          </div>
          <h3 className="text-gray-300 font-medium">Pending Reviews</h3>
          <p className="mt-1 text-sm text-gray-400">Awaiting agent review</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <ClipboardList className="w-6 h-6 text-yellow-400" />
            </div>
            <span className="text-2xl font-bold text-gray-100">0</span>
          </div>
          <h3 className="text-gray-300 font-medium">Active Offers</h3>
          <p className="mt-1 text-sm text-gray-400">Offers in progress</p>
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
            <h3 className="text-lg font-medium text-gray-100">Active Requests</h3>
            <div className="mt-4">
              <div className="text-center py-8">
                <p className="text-gray-400">No active requests.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}