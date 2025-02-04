import React, { useState } from 'react';
import { X, Settings, Save } from 'lucide-react';
import { CostPresets, PurchaseCosts } from '../types';
import { formatCurrency } from '../utils/format';

interface CostPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  presets: CostPresets;
  onSavePresets: (presets: CostPresets) => void;
  strategy: string;
  purchaseModel: 'financed' | 'cash';
}

export function CostPresetsModal({
  isOpen,
  onClose,
  presets,
  onSavePresets,
  strategy,
  purchaseModel,
}: CostPresetsModalProps) {
  const [currentPresets, setCurrentPresets] = useState<CostPresets>(presets);

  if (!isOpen) return null;

  const handleCostChange = (
    category: keyof PurchaseCosts,
    field: string,
    value: string
  ) => {
    setCurrentPresets({
      ...currentPresets,
      [strategy]: {
        ...currentPresets[strategy],
        [purchaseModel]: {
          ...currentPresets[strategy][purchaseModel],
          [category]: {
            ...currentPresets[strategy][purchaseModel][category],
            [field]: Number(value) || 0,
          },
        },
      },
    });
  };

  const renderCostCategory = (
    category: keyof PurchaseCosts,
    title: string,
    fields: { key: string; label: string }[]
  ) => {
    const costs = currentPresets[strategy][purchaseModel][category] as any;
    
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-300">{title}</h4>
        {fields.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-4">
            <label className="flex-1 text-sm text-gray-400">{label}</label>
            <div className="relative w-32">
              <input
                type="number"
                value={costs[key]}
                onChange={(e) => handleCostChange(category, key, e.target.value)}
                className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded focus:ring-2 focus:ring-blue-500 text-gray-100"
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleSave = () => {
    onSavePresets(currentPresets);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-100">
                Edit Cost Presets
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                Customize default costs for {strategy.replace(/-/g, ' ')} strategy
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {strategy === 'fix-and-flip' && (
              <>
                {renderCostCategory('acquisition', 'Acquisition Costs', [
                  { key: 'closingCosts', label: 'Closing Costs' },
                  { key: 'inspectionCosts', label: 'Inspection Costs' },
                ])}
                {renderCostCategory('rehab', 'Rehabilitation Costs', [
                  { key: 'renovationBudget', label: 'Renovation Budget' },
                  { key: 'permitsAndFees', label: 'Permits & Fees' },
                  { key: 'contingency', label: 'Contingency' },
                ])}
                {renderCostCategory('holding', 'Holding Costs', [
                  { key: 'propertyTaxes', label: 'Property Taxes' },
                  { key: 'utilities', label: 'Utilities' },
                  { key: 'insurance', label: 'Insurance' },
                  { key: 'hoaFees', label: 'HOA Fees' },
                  { key: 'loanInterest', label: 'Loan Interest' },
                ])}
                {renderCostCategory('selling', 'Selling Costs', [
                  { key: 'realtorCommission', label: 'Realtor Commission' },
                  { key: 'closingCosts', label: 'Closing Costs' },
                  { key: 'stagingCosts', label: 'Staging Costs' },
                ])}
              </>
            )}

            {strategy === 'turnkey-rental' && (
              <>
                {renderCostCategory('acquisition', 'Acquisition Costs', [
                  { key: 'closingCosts', label: 'Closing Costs' },
                  { key: 'inspectionCosts', label: 'Inspection Costs' },
                ])}
                {renderCostCategory('setup', 'Setup Costs', [
                  { key: 'repairs', label: 'Initial Repairs' },
                  { key: 'propertyManagementSetup', label: 'Property Management Setup' },
                ])}
                {renderCostCategory('operating', 'Operating Costs', [
                  { key: 'propertyTaxes', label: 'Property Taxes' },
                  { key: 'insurance', label: 'Insurance' },
                  { key: 'propertyManagement', label: 'Property Management' },
                  { key: 'maintenanceReserve', label: 'Maintenance Reserve' },
                  { key: 'vacancyReserve', label: 'Vacancy Reserve' },
                ])}
              </>
            )}

            {strategy === 'brrr' && (
              <>
                {renderCostCategory('acquisition', 'Acquisition Costs', [
                  { key: 'closingCosts', label: 'Closing Costs' },
                  { key: 'inspectionCosts', label: 'Inspection Costs' },
                ])}
                {renderCostCategory('rehab', 'Rehabilitation Costs', [
                  { key: 'renovationBudget', label: 'Renovation Budget' },
                  { key: 'contingency', label: 'Contingency' },
                ])}
                {renderCostCategory('refinance', 'Refinance Costs', [
                  { key: 'appraisalFees', label: 'Appraisal Fees' },
                  { key: 'closingCosts', label: 'Closing Costs' },
                  { key: 'prepaymentPenalties', label: 'Prepayment Penalties' },
                ])}
                {renderCostCategory('operating', 'Operating Costs', [
                  { key: 'propertyTaxes', label: 'Property Taxes' },
                  { key: 'insurance', label: 'Insurance' },
                  { key: 'propertyManagement', label: 'Property Management' },
                  { key: 'maintenanceReserve', label: 'Maintenance Reserve' },
                  { key: 'vacancyReserve', label: 'Vacancy Reserve' },
                ])}
              </>
            )}

            {strategy === 'wholesale' && (
              <>
                {renderCostCategory('wholesale', 'Wholesale Costs', [
                  { key: 'assignmentFee', label: 'Assignment Fee' },
                  { key: 'buyerRehabBudget', label: 'Buyer Rehab Budget' },
                  { key: 'marketingFees', label: 'Marketing Fees' },
                ])}
              </>
            )}
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Presets
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}