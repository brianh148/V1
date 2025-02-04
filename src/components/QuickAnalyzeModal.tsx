import React, { useState } from 'react';
import { X, Send, ClipboardList, PenTool as Tool, Info } from 'lucide-react';
import { Property, CalculationFactors } from '../types';
import { SendToAgentModal } from './SendToAgentModal';

interface QuickAnalyzeModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  calculationFactors: CalculationFactors;
}

export function QuickAnalyzeModal({ isOpen, onClose, property, calculationFactors }: QuickAnalyzeModalProps) {
  const [showSendToAgentModal, setShowSendToAgentModal] = useState(false);
  const [showRehabInfo, setShowRehabInfo] = useState(false);

  if (!isOpen) return null;

  // Mock scope of work data - in production this would come from your database
  const scopeOfWork = {
    exterior: [
      'Replace roof shingles and repair any damaged decking',
      'Paint exterior siding and trim',
      'Replace front and back entry doors',
      'Repair/replace gutters and downspouts'
    ],
    interior: [
      'Complete kitchen remodel including new cabinets, countertops, and appliances',
      'Update all bathrooms with new fixtures and tile',
      'Refinish hardwood floors throughout',
      'Paint all interior walls and ceilings'
    ],
    mechanical: [
      'Replace HVAC system',
      'Update electrical panel and rewire as needed',
      'Replace water heater',
      'Update plumbing fixtures and repair any leaks'
    ],
    landscaping: [
      'Clean up overgrown vegetation',
      'Repair/replace damaged walkways',
      'Install new sod in front yard',
      'Trim existing trees and bushes'
    ]
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={onClose} />

          <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-800 rounded-lg shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-100">
                  Investment Analysis
                </h3>
                <p className="mt-1 text-sm text-gray-400">{property.address}</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowSendToAgentModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Send to Agent
                </button>
                <button
                  onClick={onClose}
                  className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scope of Work */}
            <div className="space-y-6">
              <div className="bg-gray-700/30 rounded-lg border border-gray-600 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tool className="w-5 h-5 text-blue-400" />
                  <h4 className="text-lg font-medium text-gray-100">Scope of Work</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Exterior Work */}
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-blue-400 uppercase tracking-wider">Exterior</h5>
                    <ul className="space-y-2">
                      {scopeOfWork.exterior.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Interior Work */}
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-blue-400 uppercase tracking-wider">Interior</h5>
                    <ul className="space-y-2">
                      {scopeOfWork.interior.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Mechanical Work */}
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-blue-400 uppercase tracking-wider">Mechanical</h5>
                    <ul className="space-y-2">
                      {scopeOfWork.mechanical.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Landscaping Work */}
                  <div className="space-y-3">
                    <h5 className="text-sm font-medium text-blue-400 uppercase tracking-wider">Landscaping</h5>
                    <ul className="space-y-2">
                      {scopeOfWork.landscaping.map((item, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-4 bg-blue-500/10 border border-blue-400/20 rounded-lg text-sm text-blue-300">
                <Info className="w-5 h-5 flex-shrink-0" />
                <p>For detailed investment analysis, consult with your assigned agent.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SendToAgentModal
        isOpen={showSendToAgentModal}
        onClose={() => setShowSendToAgentModal(false)}
        property={property}
      />
    </>
  );
}