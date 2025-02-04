import React, { useState } from 'react';
import { X, Calendar, ClipboardList, Send, ArrowRight } from 'lucide-react';
import { Property } from '../types';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

interface RequestInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
}

export function RequestInspectionModal({ isOpen, onClose, property }: RequestInspectionModalProps) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [exitStrategy, setExitStrategy] = useState('fix-and-flip');

  const exitStrategies = [
    { id: 'fix-and-flip', label: 'Fix and Flip', description: 'Purchase, renovate, and sell for profit' },
    { id: 'buy-and-hold', label: 'Buy and Hold', description: 'Long-term rental property investment' },
    { id: 'brrr', label: 'BRRR Strategy', description: 'Buy, Rehab, Rent, Refinance, Repeat' },
    { id: 'wholesale', label: 'Wholesale', description: 'Contract and assign to another investor' }
  ];

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('inspection_requests')
        .insert({
          property_id: property.id,
          client_id: user.id,
          comments,
          exit_strategy: exitStrategy,
          status: 'pending'
        });

      if (error) throw error;
      onClose();
    } catch (error) {
      console.error('Error submitting inspection request:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-100">
              Request Property Inspection
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
              <h4 className="text-lg font-medium text-gray-100 mb-2">{property.address}</h4>
              <div className="text-sm text-gray-400">
                {property.bedrooms} beds • {property.bathrooms} baths • {property.squareFeet} sqft
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Exit Strategy Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                What's your exit strategy for this property?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {exitStrategies.map((strategy) => (
                  <button
                    key={strategy.id}
                    onClick={() => setExitStrategy(strategy.id)}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      exitStrategy === strategy.id
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                        : 'bg-gray-700/30 border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{strategy.label}</span>
                      {exitStrategy === strategy.id && (
                        <ArrowRight className="w-4 h-4" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{strategy.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Additional Comments or Instructions
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-100"
                placeholder="Add any specific areas you'd like the inspector to focus on..."
              />
            </div>

            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
              <h4 className="text-blue-400 font-medium mb-2">What happens next?</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-blue-400" />
                  Our team will review your inspection request
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  We'll contact you to schedule the inspection
                </li>
                <li className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-400" />
                  You'll receive the inspection report within 48 hours of completion
                </li>
              </ul>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ClipboardList className="w-4 h-4" />
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}