import React from 'react';
import { X, DollarSign } from 'lucide-react';
import { MiscellaneousCosts } from '../types';
import { formatCurrency } from '../utils/format';

interface MiscCostsModalProps {
  isOpen: boolean;
  onClose: () => void;
  costs: MiscellaneousCosts;
  onCostsChange: (costs: MiscellaneousCosts) => void;
}

export function MiscCostsModal({ isOpen, onClose, costs, onCostsChange }: MiscCostsModalProps) {
  if (!isOpen) return null;

  const costItems = [
    { key: 'utilities' as const, label: 'Utilities' },
    { key: 'insurance' as const, label: 'Insurance' },
    { key: 'propertyTaxes' as const, label: 'Property Taxes' },
    { key: 'maintenance' as const, label: 'Maintenance' },
    { key: 'other' as const, label: 'Other' },
  ];

  const totalCosts = Object.values(costs).reduce((sum, cost) => sum + cost, 0);

  const handleCostChange = (key: keyof MiscellaneousCosts, value: string) => {
    onCostsChange({
      ...costs,
      [key]: Number(value) || 0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-100">
              Itemize Miscellaneous Costs
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {costItems.map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  {label}
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="number"
                    value={costs[key]}
                    onChange={(e) => handleCostChange(key, e.target.value)}
                    min="0"
                    step="100"
                    className="w-full pl-9 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-100"
                  />
                </div>
              </div>
            ))}

            <div className="pt-4 mt-4 border-t border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-300">Total Costs:</span>
                <span className="text-lg font-semibold text-blue-400">
                  {formatCurrency(totalCosts)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}