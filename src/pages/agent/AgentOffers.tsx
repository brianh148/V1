import React from 'react';
import { ClipboardList, Search, DollarSign, Calendar, Home, ArrowRight } from 'lucide-react';

interface Offer {
  id: string;
  propertyAddress: string;
  propertyImage: string;
  clientName: string;
  offerAmount: number;
  listPrice: number;
  status: 'pending' | 'accepted' | 'rejected';
  submittedDate: string;
  expirationDate: string;
}

const sampleOffers: Offer[] = [
  {
    id: '1',
    propertyAddress: '1234 Oak Street, Detroit, MI 48201',
    propertyImage: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400',
    clientName: 'John Anderson',
    offerAmount: 275000,
    listPrice: 299000,
    status: 'pending',
    submittedDate: '2024-01-21T14:30:00Z',
    expirationDate: '2024-01-24T14:30:00Z'
  },
  {
    id: '2',
    propertyAddress: '5678 Maple Avenue, Detroit, MI 48202',
    propertyImage: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400',
    clientName: 'Sarah Williams',
    offerAmount: 425000,
    listPrice: 450000,
    status: 'accepted',
    submittedDate: '2024-01-20T09:15:00Z',
    expirationDate: '2024-01-23T09:15:00Z'
  }
];

export function AgentOffers() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [offers, setOffers] = React.useState<Offer[]>(sampleOffers);

  const filteredOffers = offers.filter(offer =>
    (statusFilter === 'all' || offer.status === statusFilter) &&
    (offer.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
     offer.clientName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: Offer['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'accepted':
        return 'bg-green-500/20 text-green-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">Offers</h1>
        <p className="mt-2 text-gray-400">
          Track and manage property offers
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search offers..."
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
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {filteredOffers.length > 0 ? (
        <div className="space-y-4">
          {filteredOffers.map((offer) => (
            <div
              key={offer.id}
              className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors"
            >
              <div className="flex">
                <div className="w-48 h-48">
                  <img
                    src={offer.propertyImage}
                    alt={offer.propertyAddress}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-100">{offer.propertyAddress}</h3>
                      <p className="mt-1 text-sm text-gray-400">Offer from {offer.clientName}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(offer.status)}`}>
                      {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Offer Amount:</span>
                        <span className="text-gray-200 font-medium">{new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          maximumFractionDigits: 0
                        }).format(offer.offerAmount)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">List Price:</span>
                        <span className="text-gray-200 font-medium">{new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          maximumFractionDigits: 0
                        }).format(offer.listPrice)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Difference:</span>
                        <span className={`font-medium ${
                          offer.offerAmount >= offer.listPrice ? 'text-green-400' : 'text-red-400'
                        }`}>{new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          maximumFractionDigits: 0
                        }).format(offer.offerAmount - offer.listPrice)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Submitted:</span>
                        <span className="text-gray-200">{formatDate(offer.submittedDate)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Expires:</span>
                        <span className="text-gray-200">{formatDate(offer.expirationDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ClipboardList className="mx-auto h-12 w-12 text-gray-600 mb-4" />
          <p className="text-gray-400">No offers found.</p>
        </div>
      )}
    </div>
  );
}