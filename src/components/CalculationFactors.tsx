import React, { useState } from 'react';
import { Settings, Home, ArrowRight, Building2, Store, ChevronDown, ChevronRight } from 'lucide-react';
import { CalculationFactors } from '../types';
import { formatCurrency } from '../utils/format';
import { CostPresetsModal } from './CostPresetsModal';

interface CalculationFactorsProps {
  factors: CalculationFactors;
  onFactorsChange: (factors: CalculationFactors) => void;
}

export function CalculationFactorsBox({ factors, onFactorsChange }: CalculationFactorsProps) {
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const [useDefaults, setUseDefaults] = useState(true);
  const [showCosts, setShowCosts] = useState(false);

  const handleInputChange = (field: keyof CalculationFactors, value: string | number) => {
    if (field === 'purchaseModel') {
      // When changing purchase model, update costs from presets if using defaults
      const newPurchaseModel = value as 'financed' | 'cash';
      const newCosts = useDefaults 
        ? factors.costPresets[factors.strategy][newPurchaseModel]
        : factors.currentCosts;

      onFactorsChange({
        ...factors,
        purchaseModel: newPurchaseModel,
        currentCosts: newCosts
      });
    } else if (field === 'strategy') {
      // When changing strategy, update costs from presets if using defaults
      const newStrategy = value as string;
      const newCosts = useDefaults 
        ? factors.costPresets[newStrategy][factors.purchaseModel]
        : factors.currentCosts;

      onFactorsChange({
        ...factors,
        strategy: newStrategy,
        currentCosts: newCosts
      });
    } else {
      onFactorsChange({
        ...factors,
        [field]: value,
      });
    }
  };

  const handleToggleDefaults = (checked: boolean) => {
    setUseDefaults(checked);
    if (checked) {
      // When enabling defaults, update costs from presets
      onFactorsChange({
        ...factors,
        currentCosts: factors.costPresets[factors.strategy][factors.purchaseModel]
      });
    }
  };

  const strategies = [
    { value: 'fix-and-flip', label: 'Buy, Fix, and Flip', icon: Home },
    { value: 'turnkey-rental', label: 'Turnkey Rental', icon: Building2 },
    { value: 'brrr', label: 'BRRR', icon: ArrowRight },
    { value: 'wholesale', label: 'Wholesale', icon: Store },
  ];

  const calculateTotalCosts = () => {
    const relevantCategories = {
      'fix-and-flip': ['acquisition', 'rehab', 'holding', 'selling'],
      'turnkey-rental': ['acquisition', 'setup', 'operating'],
      'brrr': ['acquisition', 'rehab', 'refinance', 'operating'],
      'wholesale': ['wholesale']
    };

    const categories = relevantCategories[factors.strategy] || [];
    return categories.reduce((total, category) => {
      const costs = factors.currentCosts[category] || {};
      return total + Object.values(costs).reduce((sum, cost) => sum + cost, 0);
    }, 0);
  };

  const getRelevantCosts = () => {
    const relevantCategories = {
      'fix-and-flip': [
        { key: 'acquisition', label: 'Acquisition' },
        { key: 'rehab', label: 'Rehabilitation' },
        { key: 'holding', label: 'Holding' },
        { key: 'selling', label: 'Selling' }
      ],
      'turnkey-rental': [
        { key: 'acquisition', label: 'Acquisition' },
        { key: 'setup', label: 'Setup' },
        { key: 'operating', label: 'Operating' }
      ],
      'brrr': [
        { key: 'acquisition', label: 'Acquisition' },
        { key: 'rehab', label: 'Rehabilitation' },
        { key: 'refinance', label: 'Refinance' },
        { key: 'operating', label: 'Operating' }
      ],
      'wholesale': [
        { key: 'wholesale', label: 'Wholesale' }
      ]
    };

    return relevantCategories[factors.strategy] || [];
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6 mb-8">
      {/* Strategy Selection */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {strategies.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => handleInputChange('strategy', value)}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border ${
              factors.strategy === value
                ? 'bg-blue-500 border-blue-600 text-white'
                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Icon className="w-6 h-6" />
            <span className="text-sm font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Purchase Model & Costs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => handleInputChange('purchaseModel', 'financed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  factors.purchaseModel === 'financed'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Financed
              </button>
              <button
                onClick={() => handleInputChange('purchaseModel', 'cash')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  factors.purchaseModel === 'cash'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Cash
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={useDefaults}
                onChange={(e) => handleToggleDefaults(e.target.checked)}
                className="rounded border-gray-600 text-blue-500 focus:ring-blue-500"
              />
              Use Default Costs
            </label>
            <button
              onClick={() => setShowPresetsModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm"
            >
              <Settings className="w-4 h-4" />
              Edit Costs
            </button>
          </div>
        </div>

        {/* Collapsible Cost Summary */}
        <div className="border border-gray-700 rounded-lg">
          <button
            onClick={() => setShowCosts(!showCosts)}
            className="w-full px-4 py-3 flex items-center justify-between bg-gray-700 hover:bg-gray-600 transition-colors rounded-lg"
          >
            <div className="flex items-center gap-3">
              <span className="text-gray-200 font-medium">Total Estimated Costs</span>
              <span className="text-blue-400 font-semibold">{formatCurrency(calculateTotalCosts())}</span>
            </div>
            {showCosts ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {showCosts && (
            <div className="p-4 bg-gray-800 rounded-b-lg">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {getRelevantCosts().map(({ key, label }) => {
                  const costs = factors.currentCosts[key] || {};
                  const total = Object.values(costs).reduce((sum, cost) => sum + cost, 0);
                  if (total === 0) return null;
                  
                  return (
                    <div key={key} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">
                        {label} Costs
                      </h4>
                      <div className="text-lg font-semibold text-blue-400">
                        {formatCurrency(total)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <CostPresetsModal
        isOpen={showPresetsModal}
        onClose={() => setShowPresetsModal(false)}
        presets={factors.costPresets}
        onSavePresets={(newPresets) =>
          onFactorsChange({
            ...factors,
            costPresets: newPresets,
            currentCosts: useDefaults ? newPresets[factors.strategy][factors.purchaseModel] : factors.currentCosts
          })
        }
        strategy={factors.strategy}
        purchaseModel={factors.purchaseModel}
      />
    </div>
  );
}