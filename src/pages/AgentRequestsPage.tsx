import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { Property, Agent, AgentAssignment } from '../types';
import { Filter, Search, Star, Clock, CheckCircle, XCircle } from 'lucide-react';

export function AgentRequestsPage() {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<(AgentAssignment & { property: Property; agent: Agent })[]>([]);
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
      // First, fetch the basic assignment data
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('agent_assignments')
        .select('id, agent_id, property_id, status, message, created_at')
        .eq('client_id', user?.id);

      if (assignmentsError) throw assignmentsError;

      if (!assignmentsData) {
        setRequests([]);
        return;
      }

      // Then fetch related property data
      const propertyIds = assignmentsData.map(a => a.property_id);
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select('id, address, bedrooms, bathrooms, square_feet, photos')
        .in('id', propertyIds);

      if (propertiesError) throw propertiesError;

      // Finally fetch agent data
      const agentIds = assignmentsData.map(a => a.agent_id);
      const { data: agentsData, error: agentsError } = await supabase
        .from('agents')
        .select('id, name, email, phone, photo, rating, review_count')
        .in('id', agentIds);

      if (agentsError) throw agentsError;

      // Combine the data
      const combinedData = assignmentsData.map(assignment => {
        const property = propertiesData?.find(p => p.id === assignment.property_id);
        const agent = agentsData?.find(a => a.id === assignment.agent_id);
        return {
          ...assignment,
          property: {
            ...property,
            image: property?.photos?.[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'
          } as Property,
          agent: agent as Agent,
        };
      });

      setRequests(combinedData);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
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
        <h1 className="text-2xl font-bold text-gray-100">Agent Requests</h1>
        <p className="mt-2 text-gray-400">Track your property inquiries and agent communications</p>
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
          <option value="accepted">Accepted</option>
          <option value="completed">Completed</option>
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
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        request.status === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : request.status === 'accepted'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {request.agent.photo ? (
                          <img
                            src={request.agent.photo}
                            alt={request.agent.name}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                            <span className="text-sm text-gray-300">
                              {request.agent.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-200">
                            {request.agent.name}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Star className="w-3 h-3 text-yellow-400" />
                            {request.agent.rating.toFixed(1)} ({request.agent.review_count} reviews)
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        {new Date(request.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {request.message && (
                      <div className="mt-4 text-sm text-gray-300">
                        <div className="font-medium mb-1">Your Message:</div>
                        <div className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                          {request.message}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No agent requests found.</p>
          </div>
        )}
      </div>
    </div>
  );
}