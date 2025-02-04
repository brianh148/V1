import React, { useState } from 'react';
import { Search, Clock, Building2, Calendar, ArrowRight, Download, PenTool as Tool } from 'lucide-react';
import { QuoteRequest } from '../../types';
import { formatDistanceToNow } from 'date-fns';

const sampleRequests: QuoteRequest[] = [
  {
    id: '1',
    propertyId: '123',
    propertyAddress: '1234 Oak Street, Detroit, MI 48201',
    propertyImage: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400',
    scope: [
      {
        category: 'Exterior',
        items: [
          { name: 'Roof Replacement', description: 'Complete tear-off and replacement', required: true },
          { name: 'Siding Repair', description: 'Replace damaged sections', required: false }
        ]
      },
      {
        category: 'Interior',
        items: [
          { name: 'Kitchen Remodel', description: 'Full renovation including cabinets and appliances', required: true },
          { name: 'Bathroom Updates', description: 'New fixtures and tile', required: true }
        ]
      }
    ],
    status: 'pending',
    dueDate: '2024-02-01T00:00:00Z',
    createdAt: '2024-01-22T14:30:00Z',
    inspectionReport: '#',
    adminNotes: 'Priority project - quick turnaround needed'
  }
];

export function QuoteRequests() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);

  const filteredRequests = sampleRequests.filter(request =>
    request.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">Quote Requests</h1>
        <p className="mt-2 text-gray-400">
          View and submit quotes for renovation projects
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-100"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200"
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className={`bg-gray-800 rounded-lg border ${
                selectedRequest?.id === request.id
                  ? 'border-blue-500'
                  : 'border-gray-700'
              } cursor-pointer hover:border-blue-500 transition-colors`}
              onClick={() => setSelectedRequest(request)}
            >
              <div className="p-4">
                <div className="flex items-start gap-4">
                  <img
                    src={request.propertyImage}
                    alt={request.propertyAddress}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-100">{request.propertyAddress}</h3>
                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Due {formatDistanceToNow(new Date(request.dueDate))} ago</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Created {formatDistanceToNow(new Date(request.createdAt))} ago</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-sm px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
                        {request.scope.reduce((total, category) => 
                          total + category.items.length, 0
                        )} items in scope
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Request Details */}
        {selectedRequest && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-100">Quote Details</h3>
              {selectedRequest.inspectionReport && (
                <a
                  href={selectedRequest.inspectionReport}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Inspection Report
                </a>
              )}
            </div>

            {selectedRequest.adminNotes && (
              <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-400">{selectedRequest.adminNotes}</p>
              </div>
            )}

            <div className="space-y-6">
              {selectedRequest.scope.map((category, index) => (
                <div key={index}>
                  <h4 className="text-sm font-medium text-gray-300 mb-3">{category.category}</h4>
                  <div className="space-y-3">
                    {category.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="p-4 bg-gray-700/30 border border-gray-600 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="text-sm font-medium text-gray-200">{item.name}</h5>
                              {item.required && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                                  Required
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-gray-400">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <button
                onClick={() => {/* Navigate to quote form */}}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Tool className="w-4 h-4" />
                Submit Quote
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}