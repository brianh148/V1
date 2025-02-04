import React, { useState, useEffect } from 'react';
import { Users, Building2, ClipboardList, Settings, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';

interface DashboardStats {
  totalUsers: number;
  totalProperties: number;
  totalAgents: number;
  totalInspections: number;
}

export function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProperties: 0,
    totalAgents: 0,
    totalInspections: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch total users
      const { count: usersCount } = await supabase
        .from('auth.users')
        .select('*', { count: 'exact', head: true });

      // Fetch total properties
      const { count: propertiesCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      // Fetch total agents
      const { count: agentsCount } = await supabase
        .from('agents')
        .select('*', { count: 'exact', head: true });

      // Fetch total inspections
      const { count: inspectionsCount } = await supabase
        .from('inspection_requests')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: usersCount || 0,
        totalProperties: propertiesCount || 0,
        totalAgents: agentsCount || 0,
        totalInspections: inspectionsCount || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">Admin Dashboard</h1>
        <p className="mt-2 text-gray-400">
          Manage users, properties, and system settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-2xl font-bold text-gray-100">{stats.totalUsers}</span>
          </div>
          <h3 className="text-gray-300 font-medium">Total Users</h3>
          <p className="mt-1 text-sm text-gray-400">Active platform users</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Building2 className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-2xl font-bold text-gray-100">{stats.totalProperties}</span>
          </div>
          <h3 className="text-gray-300 font-medium">Properties</h3>
          <p className="mt-1 text-sm text-gray-400">Listed properties</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <Users className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="text-2xl font-bold text-gray-100">{stats.totalAgents}</span>
          </div>
          <h3 className="text-gray-300 font-medium">Agents</h3>
          <p className="mt-1 text-sm text-gray-400">Registered agents</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <ClipboardList className="w-6 h-6 text-yellow-400" />
            </div>
            <span className="text-2xl font-bold text-gray-100">{stats.totalInspections}</span>
          </div>
          <h3 className="text-gray-300 font-medium">Inspections</h3>
          <p className="mt-1 text-sm text-gray-400">Total inspection requests</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-100">Recent Activity</h3>
            <div className="mt-4 space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-medium text-gray-200">New User Registration</h4>
                    <p className="text-xs text-gray-400">2 minutes ago</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Building2 className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-medium text-gray-200">New Property Listed</h4>
                    <p className="text-xs text-gray-400">15 minutes ago</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Settings className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-medium text-gray-200">System Update</h4>
                    <p className="text-xs text-gray-400">1 hour ago</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-100">System Status</h3>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-400"></div>
                  <span className="text-sm text-gray-300">Database</span>
                </div>
                <span className="text-sm text-green-400">Operational</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-400"></div>
                  <span className="text-sm text-gray-300">Authentication</span>
                </div>
                <span className="text-sm text-green-400">Operational</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-400"></div>
                  <span className="text-sm text-gray-300">Storage</span>
                </div>
                <span className="text-sm text-green-400">Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}