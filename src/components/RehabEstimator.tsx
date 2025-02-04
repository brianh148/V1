import React, { useState } from 'react';
import { PenTool as Tool, DollarSign, Calculator } from 'lucide-react';
import { formatCurrency } from '../utils/format';

interface RehabItem {
  name: string;
  cost: number;
  baseCost: number;
  quantity?: number;
  allowMultiple?: boolean;
  selected: boolean;
}

interface RehabCategory {
  name: string;
  items: RehabItem[];
}

interface RehabEstimatorProps {
  onEstimateChange: (total: number) => void;
}

export function RehabEstimator({ onEstimateChange }: RehabEstimatorProps) {
  const [categories, setCategories] = useState<RehabCategory[]>([
    {
      name: 'Exterior',
      items: [
        { name: 'Roof Replacement', baseCost: 8000, cost: 8000, selected: false },
        { name: 'Siding', baseCost: 6000, cost: 6000, selected: false },
        { name: 'Windows', baseCost: 500, cost: 500, allowMultiple: true, quantity: 1, selected: false },
        { name: 'Exterior Doors', baseCost: 400, cost: 400, allowMultiple: true, quantity: 1, selected: false },
        { name: 'Landscaping', baseCost: 2000, cost: 2000, selected: false },
        { name: 'Driveway', baseCost: 3500, cost: 3500, selected: false }
      ]
    },
    {
      name: 'Interior',
      items: [
        { name: 'Kitchen Remodel', baseCost: 15000, cost: 15000, selected: false },
        { name: 'Bathroom Remodel', baseCost: 8000, cost: 8000, allowMultiple: true, quantity: 1, selected: false },
        { name: 'Flooring', baseCost: 6, cost: 6000, allowMultiple: true, quantity: 1000, selected: false },
        { name: 'Paint', baseCost: 3000, cost: 3000, selected: false },
        { name: 'Drywall Repair', baseCost: 2500, cost: 2500, selected: false },
        { name: 'Interior Doors', baseCost: 200, cost: 200, allowMultiple: true, quantity: 1, selected: false }
      ]
    },
    {
      name: 'Systems',
      items: [
        { name: 'HVAC', baseCost: 7000, cost: 7000, selected: false },
        { name: 'Electrical', baseCost: 5000, cost: 5000, selected: false },
        { name: 'Plumbing', baseCost: 4500, cost: 4500, selected: false },
        { name: 'Water Heater', baseCost: 1200, cost: 1200, selected: false },
        { name: 'Insulation', baseCost: 2000, cost: 2000, selected: false }
      ]
    },
    {
      name: 'Quick Estimate Buttons',
      items: [
        { name: 'Light Rehab', cost: 5000, baseCost: 5000, selected: false },
        { name: 'Medium Rehab', cost: 15000, baseCost: 15000, selected: false },
        { name: 'Full Rehab', cost: 35000, baseCost: 35000, selected: false }
      ]
    }
  ]);

  const handleQuantityChange = (categoryIndex: number, itemIndex: number, quantity: number) => {
    const updatedCategories = [...categories];
    const item = updatedCategories[categoryIndex].items[itemIndex];
    item.quantity = quantity;
    item.cost = item.baseCost * quantity;
    setCategories(updatedCategories);
    
    if (item.selected) {
      const total = calculateTotal(updatedCategories);
      setCustomAmount('');
      onEstimateChange(total);
    }
  };

  const handleCostChange = (categoryIndex: number, itemIndex: number, cost: number) => {
    const updatedCategories = [...categories];
    const item = updatedCategories[categoryIndex].items[itemIndex];
    item.cost = cost;
    item.baseCost = item.quantity ? cost / item.quantity : cost;
    setCategories(updatedCategories);
    
    if (item.selected) {
      const total = calculateTotal(updatedCategories);
      setCustomAmount('');
      onEstimateChange(total);
    }
  };
  const [customAmount, setCustomAmount] = useState<string>('');

  const handleQuickEstimate = (amount: number) => {
    // Reset all selections
    const updatedCategories = categories.map(category => ({
      ...category,
      items: category.items.map(item => ({
        ...item,
        selected: false
      }))
    }));
    setCategories(updatedCategories);
    setCustomAmount(amount.toString());
    onEstimateChange(amount);
  };

  const handleItemToggle = (categoryIndex: number, itemIndex: number) => {
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex].items[itemIndex].selected = 
      !updatedCategories[categoryIndex].items[itemIndex].selected;
    
    setCategories(updatedCategories);
    
    // Calculate new total
    const total = calculateTotal(updatedCategories);
    setCustomAmount('');
    onEstimateChange(total);
  };

  const calculateTotal = (cats: RehabCategory[]) => {
    return cats.reduce((total, category) => 
      total + category.items.reduce((catTotal, item) => 
        item.selected ? catTotal + item.cost : catTotal, 0
      ), 0);
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    // Reset all selections
    const updatedCategories = categories.map(category => ({
      ...category,
      items: category.items.map(item => ({
        ...item,
        selected: false
      }))
    }));
    setCategories(updatedCategories);
    onEstimateChange(Number(value) || 0);
  };

  return (
    <div className="space-y-6">
      {/* Quick Estimate Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => handleQuickEstimate(5000)}
          className="flex flex-col items-center gap-1 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors"
        >
          <span className="text-sm font-medium text-blue-400">Light Rehab</span>
          <span className="text-lg font-semibold text-blue-400">$5,000</span>
        </button>
        <button
          onClick={() => handleQuickEstimate(15000)}
          className="flex flex-col items-center gap-1 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors"
        >
          <span className="text-sm font-medium text-blue-400">Medium Rehab</span>
          <span className="text-lg font-semibold text-blue-400">$15,000</span>
        </button>
        <button
          onClick={() => handleQuickEstimate(35000)}
          className="flex flex-col items-center gap-1 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors"
        >
          <span className="text-sm font-medium text-blue-400">Full Rehab</span>
          <span className="text-lg font-semibold text-blue-400">$35,000</span>
        </button>
      </div>

      {/* Custom Amount Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Custom Amount
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="number"
            value={customAmount}
            onChange={(e) => handleCustomAmountChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-100"
            placeholder="Enter custom amount"
          />
        </div>
      </div>

      {/* Itemized Selections */}
      <div className="space-y-6">
        {categories.slice(0, -1).map((category, categoryIndex) => (
          <div key={categoryIndex}>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-300">{category.name}</h4>
              <span className="text-sm text-gray-400">
                Total: {formatCurrency(
                  category.items.reduce((sum, item) => 
                    item.selected ? sum + item.cost : sum, 0
                  )
                )}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {category.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={() => handleItemToggle(categoryIndex, itemIndex)}
                  className={`p-4 rounded-lg border text-left transition-colors relative flex items-center justify-between ${
                    item.selected
                      ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                      : 'bg-gray-700/30 border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <div className="text-sm opacity-80 mt-1">
                      {formatCurrency(item.cost)}
                      {item.allowMultiple && ` (${item.name === 'Flooring' ? 'per sq ft' : 'each'})`}
                    </div>
                  </div>
                  {item.selected && (
                    <div className="flex items-center gap-4">
                      {item.allowMultiple && (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(categoryIndex, itemIndex, Math.max(1, parseInt(e.target.value) || 1));
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-20 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm"
                          />
                          <span className="text-sm">{item.name === 'Flooring' ? 'sq ft' : 'units'}</span>
                        </div>
                      )}
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                        <input
                          type="number"
                          value={item.cost}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleCostChange(categoryIndex, itemIndex, Math.max(0, parseInt(e.target.value) || 0));
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-32 pl-6 pr-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm"
                        />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-300">Total Renovation Cost:</span>
          <span className="text-lg font-semibold text-blue-400">
            {formatCurrency(Number(customAmount) || calculateTotal(categories))}
          </span>
        </div>
      </div>
    </div>
  );
}