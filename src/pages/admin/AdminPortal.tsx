import React from 'react';
import { Building2, ClipboardList, CheckCircle, Clock } from 'lucide-react';
import { properties } from '../../data/properties';

export function AdminPortal() {
  // Calculate stats
  const pendingReviews = properties.filter(p => p.status === 'pending_review').length;
  const publishedProperties = properties.filter(p => p.status === 'published').length;
  const rejectedProperties = properties.filter(p => p.status === 'rejected').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">Admin Dashboard</h1>
        <p className="mt-2 text-gray-400">
          Overview of property submissions and reviews
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <span className="text-2xl font-bold text-gray-100">{pendingReviews}</span>
          </div>
          <h3 className="text-gray-300 font-medium">Pending Review</h3>
          <p className="mt-1 text-sm text-gray-400">Properties awaiting review</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-2xl font-bold text-gray-100">{publishedProperties}</span>
          </div>
          <h3 className="text-gray-300 font-medium">Published</h3>
          <p className="mt-1 text-sm text-gray-400">Active properties</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <Building2 className="w-6 h-6 text-red-400" />
            </div>
            <span className="text-2xl font-bold text-gray-100">{rejectedProperties}</span>
          </div>
          <h3 className="text-gray-300 font-medium">Rejected</h3>
          <p className="mt-1 text-sm text-gray-400">Declined submissions</p>
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
            <h3 className="text-lg font-medium text-gray-100">Property Stats</h3>
            <div className="mt-4">
              <div className="text-center py-8">
                <p className="text-gray-400">No stats available.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}