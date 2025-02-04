import React, { useState } from 'react';
import { Settings, Calculator } from 'lucide-react';
import { CalculationFactors, PurchaseCosts } from '../types';
import { formatCurrency } from '../utils/format';
import { CollapsibleSection } from './CollapsibleSection';
import { CostPresetsModal } from './CostPresetsModal';

interface PurchaseCostsBoxProps {
  factors: CalculationFactors;
  onFactorsChange: (factors: CalculationFactors) => void;
}

export function PurchaseCostsBox({ factors, onFactorsChange }: PurchaseCostsBoxProps) {
  const [showPresetsModal, setShowPresetsModal] = useState(false);

  const renderCostCategory = (
    title: string,
    costs: Record<string, number>,
    total: number
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm font-medium text-gray-300">
        <span>{title}</span>
        <span>{formatCurrency(total)}</span>
      </div>
      {Object.entries(costs).map(([key, value]) => (
        <div key={key} className="flex justify-between text-sm">
          <span className="text-gray-400">
            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
          </span>
          <span className="text-gray-200">{formatCurrency(value)}</span>
        </div>
      ))}
    </div>
  );

  const calculateCategoryTotal = (costs: Record<string, number>) =>
    Object.values(costs).reduce((sum, cost) => sum + cost, 0);

  return (
    <CollapsibleSection title="Purchase Costs">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-100">Cost Breakdown</h3>
          <button
            onClick={() => setShowPresetsModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm"
          >
            <Settings className="w-4 h-4" />
            Edit Presets
          </button>
        </div>

        <div className="grid gap-6">
          {factors.strategy === 'fix-and-flip' && (
            <>
              {renderCostCategory(
                'Acquisition Costs',
                factors.currentCosts.acquisition,
                calculateCategoryTotal(factors.currentCosts.acquisition)
              )}
              {renderCostCategory(
                'Rehabilitation Costs',
                factors.currentCosts.rehab,
                calculateCategoryTotal(factors.currentCosts.rehab)
              )}
              {renderCostCategory(
                'Holding Costs',
                factors.currentCosts.holding,
                calculateCategoryTotal(factors.currentCosts.holding)
              )}
              {renderCostCategory(
                'Selling Costs',
                factors.currentCosts.selling,
                calculateCategoryTotal(factors.currentCosts.selling)
              )}
            </>
          )}

          {factors.strategy === 'turnkey-rental' && (
            <>
              {renderCostCategory(
                'Acquisition Costs',
                factors.currentCosts.acquisition,
                calculateCategoryTotal(factors.currentCosts.acquisition)
              )}
              {renderCostCategory(
                'Setup Costs',
                factors.currentCosts.setup,
                calculateCategoryTotal(factors.currentCosts.setup)
              )}
              {renderCostCategory(
                'Operating Costs',
                factors.currentCosts.operating,
                calculateCategoryTotal(factors.currentCosts.operating)
              )}
            </>
          )}

          {factors.strategy === 'brrr' && (
            <>
              {renderCostCategory(
                'Acquisition Costs',
                factors.currentCosts.acquisition,
                calculateCategoryTotal(factors.currentCosts.acquisition)
              )}
              {renderCostCategory(
                'Rehabilitation Costs',
                factors.currentCosts.rehab,
                calculateCategoryTotal(factors.currentCosts.rehab)
              )}
              {renderCostCategory(
                'Refinance Costs',
                factors.currentCosts.refinance,
                calculateCategoryTotal(factors.currentCosts.refinance)
              )}
              {renderCostCategory(
                'Operating Costs',
                factors.currentCosts.operating,
                calculateCategoryTotal(factors.currentCosts.operating)
              )}
            </>
          )}

          {factors.strategy === 'wholesale' && (
            <>
              {renderCostCategory(
                'Wholesale Costs',
                factors.currentCosts.wholesale,
                calculateCategoryTotal(factors.currentCosts.wholesale)
              )}
            </>
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
            currentCosts: newPresets[factors.strategy][factors.purchaseModel],
          })
        }
        strategy={factors.strategy}
        purchaseModel={factors.purchaseModel}
      />
    </CollapsibleSection>
  );
}