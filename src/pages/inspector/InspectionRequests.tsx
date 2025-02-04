import React, { useState } from 'react';
import { ClipboardList, Search, Clock, CheckCircle, XCircle, Calendar, Building2, MapPin, Play, DollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatCurrency } from '../../utils/format';
import { InspectionCostEstimator } from '../../components/InspectionCostEstimator';

interface InspectionRequest {
  id: string;
  propertyAddress: string;
  propertyImage: string;
  clientName: string;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  requestDate: string;
  scheduledDate?: string;
  propertyType: string;
  squareFeet: number;
  specialInstructions?: string;
  deadline: string;
}

interface InspectionFormData {
  notes: string;
  photos: File[];
  totalCost: number;
  categoryCosts: Record<string, number>;
}

export function InspectionRequests() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<InspectionRequest | null>(null);
  const [formData, setFormData] = useState<InspectionFormData>({
    notes: '',
    photos: [],
    totalCost: 0,
    categoryCosts: {}
  });

  // Sample data - in production this would come from your API
  const requests: InspectionRequest[] = [
    {
      id: '1',
      propertyAddress: '1234 Oak Street, Detroit, MI 48201',
      propertyImage: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400',
      clientName: 'John Anderson',
      status: 'scheduled',
      requestDate: '2024-01-21T14:30:00Z',
      scheduledDate: '2024-01-24T10:00:00Z',
      propertyType: 'Single Family',
      squareFeet: 1800,
      specialInstructions: 'Please pay special attention to the foundation and roof condition.',
      deadline: '2024-01-24T23:59:59Z'
    },
    // Add more sample requests as needed
  ];

  const handleStartInspection = (request: InspectionRequest) => {
    setSelectedRequest(request);
    setShowInspectionForm(true);
  };

  const handleSubmitInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission - in production this would send data to your API
    console.log('Inspection data:', formData);
    setShowInspectionForm(false);
    setSelectedRequest(null);
  };

  const handleEstimateChange = (total: number, categories: Record<string, number>) => {
    setFormData(prev => ({
      ...prev,
      totalCost: total,
      categoryCosts: categories
    }));
  };

  const handleModalClick = (e: React.MouseEvent) => {
    // Only close if clicking the backdrop
    if (e.target === e.currentTarget) {
      setShowInspectionForm(false);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const scheduledRequests = requests.filter(r => r.status === 'scheduled')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">Inspection Requests</h1>
        <p className="mt-2 text-gray-400">Manage and complete property inspections</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search by address or client name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Requests */}
        <div>
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Needs Scheduling</h2>
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <div className="flex items-start gap-4">
                  <img
                    src={request.propertyImage}
                    alt={request.propertyAddress}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-100">{request.propertyAddress}</h3>
                    <p className="mt-1 text-sm text-gray-400">{request.clientName}</p>
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <span className="text-yellow-400">Needs Scheduling</span>
                      <span className="text-gray-400">
                        Requested {formatDistanceToNow(new Date(request.requestDate))} ago
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled Requests */}
        <div>
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Scheduled Inspections</h2>
          <div className="space-y-4">
            {scheduledRequests.map((request) => (
              <div key={request.id} className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <div className="flex items-start gap-4">
                  <img
                    src={request.propertyImage}
                    alt={request.propertyAddress}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-100">{request.propertyAddress}</h3>
                    <p className="mt-1 text-sm text-gray-400">{request.clientName}</p>
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <span className="text-blue-400">
                        Scheduled for {new Date(request.scheduledDate!).toLocaleDateString()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleStartInspection(request)}
                      className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Start Inspection
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inspection Form Modal */}
      {showInspectionForm && selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={handleModalClick}>
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center">
            <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" />

            <div 
              className="inline-block w-full max-w-5xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-800 rounded-lg shadow-xl"
              onClick={e => e.stopPropagation()} // Prevent clicks inside the modal from closing it
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-100">Property Inspection Form</h3>
                  <p className="mt-2 text-gray-400">{selectedRequest.propertyAddress}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Total Estimated Cost</div>
                  <div className="text-2xl font-bold text-blue-400">{formatCurrency(formData.totalCost)}</div>
                </div>
              </div>
              
              <form onSubmit={handleSubmitInspection} className="space-y-6">
                <InspectionCostEstimator onEstimateChange={handleEstimateChange} />

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-100"
                    placeholder="Add any additional notes about the inspection..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Photos
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      photos: Array.from(e.target.files || [])
                    }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-100"
                  />
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setShowInspectionForm(false)}
                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Submit Inspection
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}