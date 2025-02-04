import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Ruler, Bath, BedDouble, Calendar, TrendingUp, BarChart2, Send, ClipboardList, Info, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Property, CalculationFactors } from '../types';
import { formatCurrency } from '../utils/format';
import { calculateNetProfit, calculateFinancingCosts } from '../utils/calculations';
import { QuickAnalyzeModal } from './QuickAnalyzeModal';
import { SendToAgentModal } from './SendToAgentModal';
import { RequestInspectionModal } from './RequestInspectionModal';

interface PropertyCardProps {
  property: Property;
  calculationFactors: CalculationFactors;
  onSaveProperty?: () => void;
  isSaved?: boolean;
}

export function PropertyCard({ property, calculationFactors, onSaveProperty, isSaved }: PropertyCardProps) {
  const [showAnalyzeModal, setShowAnalyzeModal] = React.useState(false);
  const [showSendToAgentModal, setShowSendToAgentModal] = React.useState(false);
  const [showInspectionModal, setShowInspectionModal] = React.useState(false);
  const [showRehabInfo, setShowRehabInfo] = React.useState(false);
  const netProfit = calculateNetProfit(property, calculationFactors);
  const totalInvestment = property.price + property.renovationCost;
  const roi = (netProfit / totalInvestment) * 100;
  const financingCosts = calculateFinancingCosts(property, calculationFactors);

  return (
    <>
      <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden transition-transform duration-200 hover:scale-[1.02] border border-gray-700">
        <div className="relative h-48">
          <img
            src={property.image}
            alt={property.address}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent">
            <div className="absolute bottom-0 left-0 right-12 p-4">
              <h3 className="text-gray-100 font-semibold truncate">{property.address}</h3>
              <p className="text-blue-400 text-lg font-bold">{formatCurrency(property.price)}</p>
            </div>
          </div>
          {onSaveProperty && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onSaveProperty();
              }}
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                isSaved ? 'bg-blue-500 text-white' : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <svg
                className="w-5 h-5"
                fill={isSaved ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          )}
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-400">
            <div className="flex items-center">
              <BedDouble className="w-4 h-4 mr-1" />
              <span>{property.bedrooms} beds</span>
            </div>
            <div className="flex items-center">
              <Bath className="w-4 h-4 mr-1" />
              <span>{property.bathrooms} baths</span>
            </div>
            <div className="flex items-center">
              <Ruler className="w-4 h-4 mr-1" />
              <span>{property.squareFeet} sqft</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Est. ARV:</span>
                <span className="text-gray-200 font-semibold">{formatCurrency(property.estimatedARV)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Renovation:</span>
                  <div className="relative">
                    <button
                      onMouseEnter={() => setShowRehabInfo(true)}
                      onMouseLeave={() => setShowRehabInfo(false)}
                      className="text-gray-400 hover:text-gray-300"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                    {showRehabInfo && (
                      <div className="absolute left-0 top-6 w-64 p-3 bg-gray-900 rounded-lg shadow-xl border border-gray-700 text-xs text-gray-300 z-50">
                        This estimate is based on listing photos and assumes typical repair costs. Please note, additional unforeseen repairs may be required upon inspection.
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-gray-200 font-semibold">{formatCurrency(property.renovationCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Financing Costs:</span>
                <span className="text-gray-200 font-semibold">{formatCurrency(financingCosts)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Net Profit:</span>
                <span className={`font-semibold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(netProfit)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">ROI:</span>
                <span className={`font-semibold ${roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {roi.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-400">
              <Calendar className="w-4 h-4 mr-1" />
              <span>Built {property.yearBuilt}</span>
              <span className="mx-2">•</span>
              <span>{property.propertyType}</span>
            </div>
            {property.dateAdded && (
              <div className="mt-2 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Added {formatDistanceToNow(new Date(property.dateAdded))} ago</span>
                </div>
              </div>
            )}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <button
                onClick={() => setShowAnalyzeModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                <BarChart2 className="w-4 h-4" />
                Analyze
              </button>
              <button
                onClick={() => setShowSendToAgentModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
                Agent
              </button>
              <button
                onClick={() => setShowInspectionModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <ClipboardList className="w-4 h-4" />
                Inspect
              </button>
            </div>
          </div>
        </div>
      </div>

      <QuickAnalyzeModal
        isOpen={showAnalyzeModal}
        onClose={() => setShowAnalyzeModal(false)}
        property={property}
        calculationFactors={calculationFactors}
      />

      <SendToAgentModal
        isOpen={showSendToAgentModal}
        onClose={() => setShowSendToAgentModal(false)}
        property={property}
      />

      <RequestInspectionModal
        isOpen={showInspectionModal}
        onClose={() => setShowInspectionModal(false)}
        property={property}
      />
    </>
  );
}