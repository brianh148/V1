import React, { useState, useEffect } from 'react';
import { Search, Filter, Building2, CheckCircle, XCircle, Edit3, Save, ArrowLeft } from 'lucide-react';
import { Property } from '../../types';
import { formatCurrency } from '../../utils/format';
import { RehabEstimator } from '../../components/RehabEstimator';
import { supabase } from '../../lib/supabase';

interface ReviewedProperty extends Property {
  reviewDate: string;
  reviewedBy: string;
  status: 'published' | 'rejected';
  notes: string;
}

export function AdminReviewed() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProperty, setSelectedProperty] = useState<ReviewedProperty | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewedProperties, setReviewedProperties] = useState<ReviewedProperty[]>([]);
  const [editForm, setEditForm] = useState({
    estimatedARV: '',
    renovationCost: 0,
    rentPotential: '',
    notes: '',
    status: ''
  });

  useEffect(() => {
    fetchReviewedProperties();
  }, []);

  const fetchReviewedProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .in('status', ['published', 'rejected'])
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match ReviewedProperty interface
      const transformedData: ReviewedProperty[] = (data || []).map(property => ({
        ...property,
        reviewDate: property.updated_at,
        reviewedBy: 'Admin', // You might want to fetch the actual reviewer name
        status: property.status as 'published' | 'rejected',
        notes: property.notes || '',
        // Ensure image is set from photos array
        image: property.photos?.[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'
      }));

      setReviewedProperties(transformedData);
    } catch (err) {
      console.error('Error fetching reviewed properties:', err);
      setError('Failed to load reviewed properties');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (property: ReviewedProperty) => {
    setEditForm({
      estimatedARV: property.estimatedARV?.toString() || '',
      renovationCost: property.renovationCost || 0,
      rentPotential: property.rentPotential?.toString() || '',
      notes: property.notes || '',
      status: property.status
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!selectedProperty) return;

    try {
      setError(null);
      const { data, error } = await supabase
        .from('properties')
        .update({
          estimated_arv: editForm.estimatedARV ? parseFloat(editForm.estimatedARV) : null,
          renovation_cost: editForm.renovationCost,
          rent_potential: editForm.rentPotential ? parseFloat(editForm.rentPotential) : null,
          notes: editForm.notes,
          status: editForm.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedProperty.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      const updatedProperty = {
        ...selectedProperty,
        estimatedARV: editForm.estimatedARV ? parseFloat(editForm.estimatedARV) : undefined,
        renovationCost: editForm.renovationCost,
        rentPotential: editForm.rentPotential ? parseFloat(editForm.rentPotential) : undefined,
        notes: editForm.notes,
        status: editForm.status as 'published' | 'rejected'
      };

      setSelectedProperty(updatedProperty);
      setReviewedProperties(prev => 
        prev.map(p => p.id === selectedProperty.id ? updatedProperty : p)
      );
      setIsEditing(false);

      // Refetch to ensure we have the latest data
      fetchReviewedProperties();
    } catch (err) {
      console.error('Error updating property:', err);
      setError('Failed to update property');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (selectedProperty) {
      setEditForm({
        estimatedARV: selectedProperty.estimatedARV?.toString() || '',
        renovationCost: selectedProperty.renovationCost || 0,
        rentPotential: selectedProperty.rentPotential?.toString() || '',
        notes: selectedProperty.notes || '',
        status: selectedProperty.status
      });
    }
  };

  const filteredProperties = reviewedProperties.filter(property => {
    const matchesSearch = property.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">Reviewed Properties</h1>
        <p className="mt-2 text-gray-400">
          View and edit previously reviewed property submissions
        </p>
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
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Properties List */}
        <div className="space-y-4">
          {filteredProperties.length > 0 ? (
            filteredProperties.map((property) => (
              <div
                key={property.id}
                className={`bg-gray-800 rounded-lg border ${
                  selectedProperty?.id === property.id
                    ? 'border-blue-500'
                    : 'border-gray-700'
                } cursor-pointer hover:border-blue-500 transition-colors`}
                onClick={() => setSelectedProperty(property)}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={property.image}
                      alt={property.address}
                      className="w-24 h-24 rounded-lg object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800';
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-medium text-gray-100">{property.address}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          property.status === 'published'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
                        <span>{property.bedrooms} beds</span>
                        <span>{property.bathrooms} baths</span>
                        <span>{property.squareFeet} sqft</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-blue-400 font-medium">{formatCurrency(property.price)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-600 mb-4" />
              <p className="text-gray-400">No reviewed properties found.</p>
            </div>
          )}
        </div>

        {/* Property Details */}
        {selectedProperty && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-100">Review Details</h3>
              {!isEditing ? (
                <button
                  onClick={() => handleEdit(selectedProperty)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Review
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              {/* Review Information */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Review Information
                </label>
                <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Reviewed By:</span>
                      <span className="ml-2 text-gray-200">{selectedProperty.reviewedBy}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Review Date:</span>
                      <span className="ml-2 text-gray-200">
                        {new Date(selectedProperty.reviewDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Editable Fields */}
              {isEditing ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Estimated ARV
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        value={editForm.estimatedARV}
                        onChange={(e) => setEditForm(prev => ({ ...prev, estimatedARV: e.target.value }))}
                        className="w-full pl-8 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Renovation Cost
                    </label>
                    <RehabEstimator onEstimateChange={(cost) => setEditForm(prev => ({ ...prev, renovationCost: cost }))} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Monthly Rent Potential
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        value={editForm.rentPotential}
                        onChange={(e) => setEditForm(prev => ({ ...prev, rentPotential: e.target.value }))}
                        className="w-full pl-8 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Review Notes
                    </label>
                    <textarea
                      value={editForm.notes}
                      onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Status
                    </label>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-100"
                    >
                      <option value="published">Published</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Review Notes
                    </label>
                    <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                      <p className="text-sm text-gray-200">{selectedProperty.notes}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Property Details
                    </label>
                    <div className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">List Price:</span>
                          <span className="ml-2 text-gray-200">{formatCurrency(selectedProperty.price)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Est. ARV:</span>
                          <span className="ml-2 text-gray-200">{formatCurrency(selectedProperty.estimatedARV)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Reno Cost:</span>
                          <span className="ml-2 text-gray-200">{formatCurrency(selectedProperty.renovationCost)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}