import React, { useState } from 'react';
import { DollarSign, Calculator } from 'lucide-react';
import { formatCurrency } from '../utils/format';

interface CostItem {
  name: string;
  cost: number;
  selected: boolean;
  quantity?: number;
}

interface CostCategory {
  name: string;
  items: CostItem[];
}

interface InspectionCostEstimatorProps {
  onEstimateChange: (total: number, categories: Record<string, number>) => void;
}

export function InspectionCostEstimator({ onEstimateChange }: InspectionCostEstimatorProps) {
  const [categories, setCategories] = useState<CostCategory[]>([
    {
      name: 'Exterior',
      items: [
        { name: 'Window Screens', cost: 90, selected: false },
        { name: 'Scrape and paint windows', cost: 240, selected: false },
        { name: 'Remove window bars', cost: 150, selected: false },
        { name: 'Scrape and Paint Fascia', cost: 220, selected: false },
        { name: 'Exterior paint', cost: 4000, selected: false },
        { name: 'Vinyl Siding', cost: 8800, selected: false },
        { name: 'Remove Trees/Branches', cost: 250, selected: false },
        { name: 'Remove Vines', cost: 100, selected: false },
        { name: 'Security Door Glass', cost: 175, selected: false },
        { name: 'Remove Security Gate', cost: 150, selected: false },
        { name: 'Security door new', cost: 475, selected: false },
        { name: 'Downspout Extensions', cost: 75, selected: false },
        { name: 'Tuckpointing', cost: 100, selected: false },
        { name: 'Fencing, Chain Link', cost: 1500, selected: false },
        { name: 'Fencing, Wooden', cost: 2400, selected: false },
        { name: 'Downspouts', cost: 120, selected: false },
        { name: 'Dish removal', cost: 100, selected: false }
      ]
    },
    {
      name: 'Entryway',
      items: [
        { name: 'Front Door Paint', cost: 50, selected: false },
        { name: 'Door Knob', cost: 125, selected: false },
        { name: 'Front Door Replacement', cost: 550, selected: false },
        { name: 'Flooring: Hardwoods', cost: 100, selected: false },
        { name: 'New LVP Flooring', cost: 150, selected: false },
        { name: 'Transitional Pieces', cost: 25, selected: false }
      ]
    },
    {
      name: 'Living Room',
      items: [
        { name: 'New Blinds', cost: 25, selected: false },
        { name: 'Window Screens', cost: 75, selected: false },
        { name: 'Window Glass', cost: 250, selected: false },
        { name: 'Scrape and paint windows', cost: 200, selected: false },
        { name: 'Replace Windows', cost: 550, selected: false },
        { name: 'Paint Interior', cost: 400, selected: false },
        { name: 'Install New Drywall', cost: 100, selected: false },
        { name: 'Drywall Repair', cost: 50, selected: false },
        { name: 'Flooring: LVP', cost: 2750, selected: false },
        { name: 'Flooring: Hardwoods', cost: 2250, selected: false },
        { name: 'Flooring: Carpet', cost: 1500, selected: false }
      ]
    },
    {
      name: 'Dining Room',
      items: [
        { name: 'Scrape and paint windows', cost: 200, selected: false },
        { name: 'Window sill', cost: 100, selected: false },
        { name: 'Window Glass', cost: 250, selected: false },
        { name: 'Replace Windows', cost: 550, selected: false },
        { name: 'Flooring: Carpet', cost: 1500, selected: false },
        { name: 'Flooring: Hardwoods', cost: 2250, selected: false },
        { name: 'Flooring: LVP', cost: 2750, selected: false },
        { name: 'Drywall Repair', cost: 50, selected: false },
        { name: 'Paint Interior', cost: 400, selected: false }
      ]
    },
    {
      name: 'Hallway',
      items: [
        { name: 'Paint Interior', cost: 400, selected: false },
        { name: 'Flooring: Hardwoods', cost: 750, selected: false },
        { name: 'Flooring: Carpet', cost: 500, selected: false },
        { name: 'Flooring: LVP', cost: 1000, selected: false },
        { name: 'Drywall Repair', cost: 50, selected: false },
        { name: 'Install New Drywall', cost: 100, selected: false }
      ]
    },
    {
      name: 'Bedroom 1',
      items: [
        { name: 'Flooring: Hardwoods', cost: 450, selected: false },
        { name: 'Flooring: Carpet', cost: 225, selected: false },
        { name: 'Flooring: LVP', cost: 550, selected: false },
        { name: 'Drywall Repair', cost: 50, selected: false },
        { name: 'Install New Drywall', cost: 100, selected: false },
        { name: 'New Doorknobs', cost: 25, selected: false },
        { name: 'Closet Door', cost: 150, selected: false },
        { name: 'Bedroom Door', cost: 150, selected: false },
        { name: 'Window sill', cost: 100, selected: false },
        { name: 'Window Glass', cost: 250, selected: false },
        { name: 'Replace Windows', cost: 550, selected: false },
        { name: 'Remove window bars', cost: 150, selected: false },
        { name: 'Paint Interior', cost: 400, selected: false }
      ]
    },
    {
      name: 'Bathroom',
      items: [
        { name: 'New Bathtub Hardware', cost: 200, selected: false },
        { name: 'Tub', cost: 400, selected: false },
        { name: 'Tile Bathtub Surround', cost: 1250, selected: false },
        { name: 'Bathtub drain with plumbing', cost: 150, selected: false },
        { name: 'Sink Plumbing', cost: 100, selected: false },
        { name: 'Sink Piping', cost: 50, selected: false },
        { name: 'Bathroom Vanity Hardware', cost: 200, selected: false },
        { name: 'New Vanity', cost: 300, selected: false },
        { name: 'Paint Interior', cost: 300, selected: false },
        { name: 'Drywall Repair', cost: 50, selected: false },
        { name: 'Install New Drywall', cost: 100, selected: false },
        { name: 'Window sill', cost: 100, selected: false },
        { name: 'Window Glass', cost: 250, selected: false },
        { name: 'Scrape and paint windows', cost: 200, selected: false },
        { name: 'Remove window bars', cost: 150, selected: false },
        { name: 'Replace Windows', cost: 550, selected: false },
        { name: 'Flooring: Tile', cost: 600, selected: false },
        { name: 'Flooring: LVP', cost: 400, selected: false }
      ]
    },
    {
      name: 'Kitchen',
      items: [
        { name: 'Kitchen sink', cost: 200, selected: false },
        { name: 'Sink Plumbing', cost: 100, selected: false },
        { name: 'Sink Piping', cost: 50, selected: false },
        { name: 'Glaze Wall Tiles', cost: 600, selected: false },
        { name: 'Paint Interior', cost: 400, selected: false },
        { name: 'Drywall Repair', cost: 50, selected: false },
        { name: 'Install New Drywall', cost: 100, selected: false },
        { name: 'Window sill', cost: 100, selected: false },
        { name: 'Window Glass', cost: 250, selected: false },
        { name: 'Scrape and paint windows', cost: 200, selected: false },
        { name: 'Remove window bars', cost: 150, selected: false },
        { name: 'Replace Windows', cost: 550, selected: false },
        { name: 'Flooring: Tile', cost: 1500, selected: false },
        { name: 'Flooring: LVP', cost: 1250, selected: false }
      ]
    },
    {
      name: 'Stairways',
      items: [
        { name: 'Paint Interior', cost: 400, selected: false },
        { name: 'Finish Stairway Edge Trim', cost: 100, selected: false },
        { name: 'Flooring: Carpet', cost: 200, selected: false },
        { name: 'Flooring: LVP', cost: 350, selected: false },
        { name: 'Drywall Repair', cost: 50, selected: false },
        { name: 'Install New Drywall', cost: 100, selected: false }
      ]
    },
    {
      name: 'Basement',
      items: [
        { name: 'Glass Block', cost: 450, selected: false },
        { name: 'Window sill', cost: 100, selected: false },
        { name: 'Scrape and paint windows', cost: 200, selected: false },
        { name: 'Remove window bars', cost: 150, selected: false },
        { name: 'Secure laundry tub', cost: 50, selected: false },
        { name: 'Laundry tub', cost: 200, selected: false },
        { name: 'Install Missing Drain Covers', cost: 15, selected: false },
        { name: 'Re pipe plumbing', cost: 1500, selected: false },
        { name: 'Plumbing drain stack', cost: 500, selected: false },
        { name: 'Paint Interior', cost: 750, selected: false },
        { name: 'Waterproofing', cost: 3750, selected: false },
        { name: 'Remove Ceiling Tiles', cost: 500, selected: false },
        { name: 'Drywall Repair', cost: 50, selected: false },
        { name: 'Install New Drywall', cost: 100, selected: false }
      ]
    },
    {
      name: 'General',
      items: [
        { name: 'New Lock Box', cost: 125, selected: false },
        { name: 'Disposal', cost: 1000, selected: false },
        { name: 'Full interior house clean', cost: 275, selected: false },
        { name: 'SimpliSafe Security System', cost: 300, selected: false },
        { name: 'Winter Security Package', cost: 300, selected: false },
        { name: 'Garage roof', cost: 275, selected: false },
        { name: 'House Roof', cost: 9000, selected: false },
        { name: 'Furnace - New', cost: 2100, selected: false },
        { name: 'Hot water tank - New', cost: 1100, selected: false },
        { name: 'Utility Set Up', cost: 250, selected: false },
        { name: 'Sewer Jetting', cost: 750, selected: false },
        { name: 'Sewer scope', cost: 150, selected: false },
        { name: 'Drain Snake', cost: 200, selected: false },
        { name: 'Breaker Panel Replacement', cost: 700, selected: false },
        { name: 'Electric Service drop', cost: 600, selected: false },
        { name: 'New Carbon Monoxide Monitor', cost: 40, selected: false },
        { name: 'Remove Unnecessary Wiring In Basement', cost: 100, selected: false },
        { name: 'New Light Fixture', cost: 35, selected: false },
        { name: 'New Light Switches and Outlets', cost: 10, selected: false },
        { name: 'Switch and Outlet Covers', cost: 10, selected: false },
        { name: 'New Smoke Detectors', cost: 225, selected: false }
      ]
    }
  ]);

  const handleItemToggle = (categoryIndex: number, itemIndex: number) => {
    setCategories(prevCategories => {
      const newCategories = [...prevCategories];
      newCategories[categoryIndex] = {
        ...newCategories[categoryIndex],
        items: [...newCategories[categoryIndex].items]
      };
      newCategories[categoryIndex].items[itemIndex] = {
        ...newCategories[categoryIndex].items[itemIndex],
        selected: !newCategories[categoryIndex].items[itemIndex].selected
      };

      // Calculate new totals after state update
      const categoryTotals: Record<string, number> = {};
      let total = 0;

      newCategories.forEach(category => {
        const categoryTotal = category.items.reduce((sum, item) => 
          item.selected ? sum + item.cost : sum, 0
        );
        categoryTotals[category.name] = categoryTotal;
        total += categoryTotal;
      });

      // Call the callback with new totals
      onEstimateChange(total, categoryTotals);

      return newCategories;
    });
  };

  return (
    <div className="space-y-6">
      {categories.map((category, categoryIndex) => (
        <div key={category.name} className="border border-gray-700 rounded-lg p-4">
          <h4 className="text-lg font-medium text-gray-100 mb-4">{category.name}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {category.items.map((item, itemIndex) => (
              <button
                key={item.name}
                onClick={() => handleItemToggle(categoryIndex, itemIndex)}
                className={`p-3 rounded-lg text-left transition-colors ${
                  item.selected
                    ? 'bg-blue-500/20 border border-blue-500 text-blue-400'
                    : 'bg-gray-700/30 border border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{item.name}</span>
                  <span>{formatCurrency(item.cost)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}