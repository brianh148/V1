import React from 'react';
import { Users, Search, Star, Mail, Phone, Building2 } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo: string;
  status: 'active' | 'inactive';
  properties: number;
  lastActive: string;
}

const sampleClients: Client[] = [
  {
    id: '1',
    name: 'John Anderson',
    email: 'john.anderson@example.com',
    phone: '(313) 555-0101',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80',
    status: 'active',
    properties: 2,
    lastActive: '2024-01-22T10:30:00Z'
  },
  {
    id: '2',
    name: 'Sarah Williams',
    email: 'sarah.williams@example.com',
    phone: '(313) 555-0102',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80',
    status: 'active',
    properties: 1,
    lastActive: '2024-01-21T15:45:00Z'
  }
];

export function AgentClients() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [clients, setClients] = React.useState<Client[]>(sampleClients);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatLastActive = (date: string) => {
    const now = new Date();
    const lastActive = new Date(date);
    const diffHours = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    return lastActive.toLocaleDateString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">My Clients</h1>
        <p className="mt-2 text-gray-400">
          Manage your client relationships and communications
        </p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-100"
          />
        </div>
      </div>

      {filteredClients.length > 0 ? (
        <div className="space-y-4">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-gray-800 rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start gap-4">
                <img
                  src={client.photo}
                  alt={client.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-100">{client.name}</h3>
                      <div className="mt-1 flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {client.properties} {client.properties === 1 ? 'property' : 'properties'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          Active client
                        </span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">
                      Last active {formatLastActive(client.lastActive)}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-4">
                    <a
                      href={`mailto:${client.email}`}
                      className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                    >
                      <Mail className="w-4 h-4" />
                      {client.email}
                    </a>
                    <a
                      href={`tel:${client.phone}`}
                      className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                    >
                      <Phone className="w-4 h-4" />
                      {client.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-600 mb-4" />
          <p className="text-gray-400">No clients found.</p>
        </div>
      )}
    </div>
  );
}