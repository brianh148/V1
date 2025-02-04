import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Search, Clock, CheckCircle, XCircle, Edit3, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { formatCurrency } from '../../utils/format';

interface Property {
  id: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  status: string;
  deal_status: 'available' | 'pending' | 'sold';
  photos: string[];
  created_at: string;
  wholesaler_id: string;
}

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function ListingsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      console.error('No user ID available');
      navigate('/login');
      return;
    }

    // Validate user ID is a valid UUID
    if (!UUID_REGEX.test(user.id)) {
      console.error('Invalid user ID format');
      setError('Invalid user credentials. Please log in again.');
      return;
    }

    fetchProperties();
  }, [user?.id, navigate]);

  const fetchProperties = async () => {
    if (!user?.id || !UUID_REGEX.test(user.id)) {
      setError('Invalid user credentials. Please log in again.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('wholesaler_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError('Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateDealStatus = async (propertyId: string, dealStatus: 'available' | 'pending' | 'sold') => {
    if (!user?.id || !UUID_REGEX.test(user.id)) {
      setError('Invalid user credentials. Please log in again.');
      return;
    }

    try {
      setError(null);
      const { error } = await supabase
        .from('properties')
        .update({ deal_status: dealStatus })
        .eq('id', propertyId)
        .eq('wholesaler_id', user.id);

      if (error) throw error;
      
      // Update local state
      setProperties(prev => prev.map(prop => 
        prop.id === propertyId ? { ...prop, deal_status: dealStatus } : prop
      ));
    } catch (error) {
      console.error('Error updating property status:', error);
      setError('Failed to update property status. Please try again.');
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || property.deal_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_review':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'published':
        return 'bg-green-500/20 text-green-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getDealStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'sold':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (!user?.id || !UUID_REGEX.test(user.id)) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Please sign in with valid credentials to view your listings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">My Listings</h1>
          <p className="mt-2 text-gray-400">
            Manage your wholesale property listings
          </p>
        </div>
        <button
          onClick={() => navigate('/wholesaler/submit')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          <Upload className="w-4 h-4" />
          Submit New Property
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

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
          <option value="available">Available</option>
          <option value="pending">Pending</option>
          <option value="sold">Sold</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading properties...</p>
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className="space-y-4">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start gap-6">
                  <img
                    src={property.photos?.[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400'}
                    alt={property.address}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-100">{property.address}</h3>
                        <div className="mt-1 text-sm text-gray-400">
                          {property.bedrooms} beds • {property.bathrooms} baths • {property.square_feet} sqft
                        </div>
                        <div className="mt-2 text-lg font-medium text-blue-400">
                          {formatCurrency(property.price)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(property.status)}`}>
                          {property.status.replace('_', ' ').charAt(0).toUpperCase() + property.status.slice(1)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm ${getDealStatusColor(property.deal_status)}`}>
                          {property.deal_status.charAt(0).toUpperCase() + property.deal_status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <button
                        onClick={() => updateDealStatus(property.id, 'available')}
                        className={`px-3 py-1.5 rounded text-sm font-medium ${
                          property.deal_status === 'available'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        Available
                      </button>
                      <button
                        onClick={() => updateDealStatus(property.id, 'pending')}
                        className={`px-3 py-1.5 rounded text-sm font-medium ${
                          property.deal_status === 'pending'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => updateDealStatus(property.id, 'sold')}
                        className={`px-3 py-1.5 rounded text-sm font-medium ${
                          property.deal_status === 'sold'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        Sold
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-600 mb-4" />
          <p className="text-gray-400">No properties found.</p>
        </div>
      )}
    </div>
  );
}