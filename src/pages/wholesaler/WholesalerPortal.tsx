import React from 'react';
import { Building2, ClipboardList, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function WholesalerPortal() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">Wholesaler Dashboard</h1>
        <p className="mt-2 text-gray-400">
          Manage and submit wholesale property listings
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
          <h3 className="text-gray-300 font-medium">Active Listings</h3>
          <p className="mt-1 text-sm text-gray-400">Properties under review</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <ClipboardList className="w-6 h-6 text-yellow-400" />
            </div>
            <span className="text-2xl font-bold text-gray-100">0</span>
          </div>
          <h3 className="text-gray-300 font-medium">Pending Review</h3>
          <p className="mt-1 text-sm text-gray-400">Awaiting admin approval</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-2xl font-bold text-gray-100">0</span>
          </div>
          <h3 className="text-gray-300 font-medium">Approved</h3>
          <p className="mt-1 text-sm text-gray-400">Published properties</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
            <span className="text-2xl font-bold text-gray-100">0</span>
          </div>
          <h3 className="text-gray-300 font-medium">Rejected</h3>
          <p className="mt-1 text-sm text-gray-400">Declined submissions</p>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={() => navigate('/wholesaler/submit')}
          className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <Building2 className="w-5 h-5 mr-2" />
          Submit New Property
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-100">Recent Submissions</h3>
            <div className="mt-4">
              <div className="text-center py-8">
                <p className="text-gray-400">No recent submissions.</p>
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