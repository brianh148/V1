import React from 'react';
import { Users, ClipboardList, DollarSign, Building2 } from 'lucide-react';
import { TaskManager } from '../../components/TaskManager';

export function AgentPortal() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">Agent Dashboard</h1>
        <p className="mt-2 text-gray-400">
          Manage your clients and track property transactions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-2xl font-bold text-gray-100">0</span>
          </div>
          <h3 className="text-gray-300 font-medium">Active Clients</h3>
          <p className="mt-1 text-sm text-gray-400">Clients you're working with</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Building2 className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-2xl font-bold text-gray-100">0</span>
          </div>
          <h3 className="text-gray-300 font-medium">Active Listings</h3>
          <p className="mt-1 text-sm text-gray-400">Properties in progress</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-2xl font-bold text-gray-100">0</span>
          </div>
          <h3 className="text-gray-300 font-medium">Closed Deals</h3>
          <p className="mt-1 text-sm text-gray-400">Successfully closed transactions</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <ClipboardList className="w-6 h-6 text-yellow-400" />
            </div>
            <span className="text-2xl font-bold text-gray-100">0</span>
          </div>
          <h3 className="text-gray-300 font-medium">Pending Offers</h3>
          <p className="mt-1 text-sm text-gray-400">Offers awaiting response</p>
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
            <TaskManager />
          </div>
        </div>
      </div>
    </div>
  );
}