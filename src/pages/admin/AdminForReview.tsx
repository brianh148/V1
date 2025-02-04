import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, DollarSign, Building2, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Property } from '../../types';
import { formatCurrency } from '../../utils/format';
import { RehabEstimator } from '../../components/RehabEstimator';

interface Comparable {
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  yearBuilt: number;
  distance?: number;
  saleDate?: string;
  selected?: boolean;
}

export function AdminForReview() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [rehabEstimate, setRehabEstimate] = useState<number>(0);
  const [rentPotential, setRentPotential] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [comparables, setComparables] = useState<Comparable[]>([
    {
      address: "1234 Similar Ave, Detroit, MI",
      price: 185000,
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1450,
      yearBuilt: 1950,
      distance: 0.5,
      saleDate: "2024-01-15",
      selected: false
    },
    {
      address: "5678 Nearby St, Detroit, MI",
      price: 175000,
      bedrooms: 3,
      bathrooms: 1.5,
      squareFeet: 1350,
      yearBuilt: 1945,
      distance: 0.8,
      saleDate: "2024-01-10",
      selected: false
    },
    {
      address: "9012 Close Rd, Detroit, MI",
      price: 195000,
      bedrooms: 4,
      bathrooms: 2,
      squareFeet: 1600,
      yearBuilt: 1952,
      distance: 1.2,
      saleDate: "2024-01-05",
      selected: false
    }
  ]);
  const [showAddComparable, setShowAddComparable] = useState(false);
  const [newComparable, setNewComparable] = useState<Comparable>({
    address: '',
    price: 0,
    bedrooms: 0,
    bathrooms: 0,
    squareFeet: 0,
    yearBuilt: 0,
    distance: 0,
    saleDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchPendingProperties();
  }, []);

  const fetchPendingProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'pending_review')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData = (data || []).map(property => ({
        ...property,
        image: property.photos?.[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'
      }));

      setProperties(transformedData);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (property: Property, status: 'published' | 'rejected') => {
    if (!property) return;

    try {
      setError(null);
      setLoading(true);

      // Update the property status and estimates
      const { error: updateError } = await supabase
        .from('properties')
        .update({
          status: status,
          renovation_cost: rehabEstimate,
          rent_potential: rentPotential,
          notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', property.id);

      if (updateError) throw updateError;

      // Update local state
      setProperties(prev => prev.filter(p => p.id !== property.id));
      setSuccess(`Property successfully ${status === 'published' ? 'approved' : 'rejected'}!`);
      
      // Reset form
      setSelectedProperty(null);
      setRehabEstimate(0);
      setRentPotential(0);
      setNotes('');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);

    } catch (err) {
      console.error('Error reviewing property:', err);
      setError(`Failed to ${status === 'published' ? 'approve' : 'reject'} property`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComparable = () => {
    setComparables([...comparables, newComparable]);
    setShowAddComparable(false);
    setNewComparable({
      address: '',
      price: 0,
      bedrooms: 0,
      bathrooms: 0,
      squareFeet: 0,
      yearBuilt: 0,
      distance: 0,
      saleDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleComparableToggle = (index: number) => {
    setComparables(prev => prev.map((comp, i) => 
      i === index ? { ...comp, selected: !comp.selected } : comp
    ));
  };

  const calculateAveragePrice = () => {
    const selectedComps = comparables.filter(comp => comp.selected);
    if (selectedComps.length === 0) return 0;
    const total = selectedComps.reduce((sum, comp) => sum + comp.price, 0);
    return total / selectedComps.length;
  };

  const calculatePricePerSqFt = (price: number, sqft: number) => {
    return sqft > 0 ? price / sqft : 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">Properties For Review</h1>
        <p className="mt-2 text-gray-400">
          Review and approve new property submissions
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500 rounded-lg">
          <p className="text-green-400">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Properties List */}
        <div className="space-y-4">
          {properties.length > 0 ? (
            properties.map((property) => (
              <div
                key={property.id}
                onClick={() => setSelectedProperty(property)}
                className={`p-4 bg-gray-800 rounded-lg border ${
                  selectedProperty?.id === property.id
                    ? 'border-blue-500'
                    : 'border-gray-700'
                } cursor-pointer hover:border-blue-400 transition-colors`}
              >
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
                    <h3 className="text-lg font-medium text-gray-100">{property.address}</h3>
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
            ))
          ) : (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-600 mb-4" />
              <p className="text-gray-400">No properties pending review.</p>
            </div>
          )}
        </div>

        {/* Property Review Form */}
        {selectedProperty && (
          <div className="space-y-8">
            {/* Comparables Section */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-100">Comparable Properties</h3>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Average Price</div>
                    <div className="text-lg font-semibold text-blue-400">
                      {formatCurrency(calculateAveragePrice())}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddComparable(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Comparable
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-sm font-medium text-gray-400 pb-3">Address</th>
                      <th className="text-left text-sm font-medium text-gray-400 pb-3">Price</th>
                      <th className="text-left text-sm font-medium text-gray-400 pb-3">Specs</th>
                      <th className="text-left text-sm font-medium text-gray-400 pb-3">$/sqft</th>
                      <th className="text-left text-sm font-medium text-gray-400 pb-3">Distance</th>
                      <th className="text-left text-sm font-medium text-gray-400 pb-3">Sale Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {comparables.map((comp, index) => (
                      <tr 
                        key={index} 
                        onClick={() => handleComparableToggle(index)}
                        className={`cursor-pointer transition-colors ${
                          comp.selected 
                            ? 'bg-blue-500/20 hover:bg-blue-500/30' 
                            : 'hover:bg-gray-750'
                        }`}
                      >
                        <td className={`py-3 ${comp.selected ? 'text-blue-400' : 'text-gray-200'}`}>
                          {comp.address}
                        </td>
                        <td className={`py-3 ${comp.selected ? 'text-blue-400' : 'text-gray-200'}`}>
                          {formatCurrency(comp.price)}
                        </td>
                        <td className={`py-3 ${comp.selected ? 'text-blue-400' : 'text-gray-200'}`}>
                          {comp.bedrooms}bd {comp.bathrooms}ba {comp.squareFeet}sqft
                        </td>
                        <td className={`py-3 ${comp.selected ? 'text-blue-400' : 'text-gray-200'}`}>
                          {formatCurrency(calculatePricePerSqFt(comp.price, comp.squareFeet))}/sqft
                        </td>
                        <td className={`py-3 ${comp.selected ? 'text-blue-400' : 'text-gray-200'}`}>
                          {comp.distance} mi
                        </td>
                        <td className={`py-3 ${comp.selected ? 'text-blue-400' : 'text-gray-200'}`}>
                          {new Date(comp.saleDate!).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {showAddComparable && (
                <div className="mt-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                  <h4 className="text-sm font-medium text-gray-200 mb-4">Add New Comparable</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Address</label>
                      <input
                        type="text"
                        value={newComparable.address}
                        onChange={(e) => setNewComparable({ ...newComparable, address: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Price</label>
                      <input
                        type="number"
                        value={newComparable.price}
                        onChange={(e) => setNewComparable({ ...newComparable, price: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Bedrooms</label>
                      <input
                        type="number"
                        value={newComparable.bedrooms}
                        onChange={(e) => setNewComparable({ ...newComparable, bedrooms: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Bathrooms</label>
                      <input
                        type="number"
                        value={newComparable.bathrooms}
                        onChange={(e) => setNewComparable({ ...newComparable, bathrooms: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Square Feet</label>
                      <input
                        type="number"
                        value={newComparable.squareFeet}
                        onChange={(e) => setNewComparable({ ...newComparable, squareFeet: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Year Built</label>
                      <input
                        type="number"
                        value={newComparable.yearBuilt}
                        onChange={(e) => setNewComparable({ ...newComparable, yearBuilt: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Distance (miles)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newComparable.distance}
                        onChange={(e) => setNewComparable({ ...newComparable, distance: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Sale Date</label>
                      <input
                        type="date"
                        value={newComparable.saleDate}
                        onChange={(e) => setNewComparable({ ...newComparable, saleDate: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-3">
                    <button
                      onClick={() => setShowAddComparable(false)}
                      className="px-3 py-1.5 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddComparable}
                      className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      Add Comparable
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Renovation Cost Estimate */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-100">Review Property</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Renovation Cost Estimate
                  </label>
                  <RehabEstimator onEstimateChange={setRehabEstimate} />
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
                      placeholder="Enter estimated monthly rent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Review Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-100"
                    placeholder="Add any notes about the property..."
                  />
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleReview(selectedProperty, 'published')}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {loading ? 'Processing...' : 'Approve & Publish'}
                  </button>
                  <button
                    onClick={() => handleReview(selectedProperty, 'rejected')}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <XCircle className="w-4 h-4" />
                    {loading ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}