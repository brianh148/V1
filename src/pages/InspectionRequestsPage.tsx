import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { Property, InspectionRequest } from '../types';
import { Search, Clock, ClipboardList, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export function InspectionRequestsPage() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<(InspectionRequest & { property: Property })[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      // First, fetch the basic inspection request data
      const { data: requestsData, error: requestsError } = await supabase
        .from('inspection_requests')
        .select('id, property_id, status, scheduled_date, comments, report, created_at')
        .eq('client_id', user?.id);

      if (requestsError) throw requestsError;

      if (!requestsData) {
        setRequests([]);
        return;
      }

      // Then fetch related property data
      const propertyIds = requestsData.map(r => r.property_id);
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('id, address, bedrooms, bathrooms, square_feet, photos')
        .in('id', propertyIds);

      if (propertiesError) throw propertiesError;

      // Combine the data
      const combinedData = requestsData.map(request => ({
        ...request,
        property: {
          ...propertiesData?.find(p => p.id === request.property_id),
          image: propertiesData?.find(p => p.id === request.property_id)?.photos?.[0] || 
                'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'
        } as Property,
      }));

      setRequests(combinedData);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'scheduled':
        return <AlertCircle className="w-5 h-5 text-blue-400" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'scheduled':
        return 'bg-blue-500/20 text-blue-400';
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesSearch = request.property.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">Inspection Requests</h1>
        <p className="mt-2 text-gray-400">Track your property inspection requests and reports</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-100"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading requests...</p>
          </div>
        ) : filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start gap-6">
                  <img
                    src={request.property.image}
                    alt={request.property.address}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-100">
                          {request.property.address}
                        </h3>
                        <div className="mt-1 text-sm text-gray-400">
                          {request.property.bedrooms} beds • {request.property.bathrooms} baths • {request.property.square_feet} sqft
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        Requested on {new Date(request.created_at).toLocaleDateString()}
                      </div>
                      {request.scheduled_date && (
                        <div className="flex items-center gap-2 text-sm text-blue-400">
                          <AlertCircle className="w-4 h-4" />
                          Scheduled for {new Date(request.scheduled_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {request.comments && (
                      <div className="mt-4 text-sm text-gray-300">
                        <div className="font-medium mb-1">Your Comments:</div>
                        <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                          {request.comments}
                        </div>
                      </div>
                    )}

                    {request.status === 'completed' && request.report && (
                      <div className="mt-4">
                        <button
                          onClick={() => window.open(request.report, '_blank')}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <ClipboardList className="w-4 h-4" />
                          View Inspection Report
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No inspection requests found.</p>
          </div>
        )}
      </div>
    </div>
  );
}