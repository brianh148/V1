import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  Home, 
  Calendar,
  PenTool as Tool
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Property, PropertyReview } from '../types';
import { formatCurrency } from '../utils/format';

export function VAReviewPortal() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [rehabEstimate, setRehabEstimate] = useState<number>(0);
  const [rentPotential, setRentPotential] = useState<number>(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchPendingProperties();
  }, []);

  const fetchPendingProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'pending_review');

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (property: Property, status: 'published' | 'rejected') => {
    try {
      // Update property status and estimates
      const { error: propertyError } = await supabase
        .from('properties')
        .update({
          status,
          renovation_cost: rehabEstimate,
          rent_potential: rentPotential,
        })
        .eq('id', property.id);

      if (propertyError) throw propertyError;

      // Create review record
      const { error: reviewError } = await supabase
        .from('property_reviews')
        .insert({
          property_id: property.id,
          rehab_estimate: rehabEstimate,
          notes,
        });

      if (reviewError) throw reviewError;

      // Update local state
      setProperties(properties.filter(p => p.id !== property.id));
      setSelectedProperty(null);
      setRehabEstimate(0);
      setRentPotential(0);
      setNotes('');
    } catch (error) {
      console.error('Error reviewing property:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">VA Review Portal</h1>
        <p className="mt-2 text-gray-400">
          Review and estimate renovation costs for pending properties
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Property List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">
            Pending Properties ({properties.length})
          </h2>
          {properties.map((property) => (
            <div
              key={property.id}
              onClick={() => setSelectedProperty(property)}
              className={`p-4 bg-gray-800 rounded-lg border ${
                selectedProperty?.id === property.id
                  ? 'border-blue-500'
                  : 'border-gray-700'
              } cursor-pointer hover:border-blue-400 transition-colors`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-gray-100 font-medium">{property.address}</h3>
                  <div className="mt-1 text-sm text-gray-400">
                    {property.bedrooms}bd {property.bathrooms}ba {property.squareFeet}sqft
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <span className="flex items-center text-blue-400">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {formatCurrency(property.price)}
                    </span>
                    <span className="flex items-center text-gray-400">
                      <Calendar className="w-4 h-4 mr-1" />
                      Built {property.yearBuilt}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  property.source === 'mls'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-purple-500/20 text-purple-400'
                }`}>
                  {property.source}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Review Form */}
        {selectedProperty && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-200 mb-4">
              Property Review
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Renovation Cost Estimate
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    value={rehabEstimate}
                    onChange={(e) => setRehabEstimate(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-100"
                    placeholder="Enter renovation cost estimate"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Monthly Rent Potential
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    value={rentPotential}
                    onChange={(e) => setRentPotential(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-100"
                    placeholder="Enter monthly rent potential"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-100"
                  placeholder="Add any relevant notes about the property..."
                />
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleReview(selectedProperty, 'published')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve & Publish
                </button>
                <button
                  onClick={() => handleReview(selectedProperty, 'rejected')}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}