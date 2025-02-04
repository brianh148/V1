import React, { useState, useEffect } from 'react';
import { X, Search, Star, Phone, Mail, Send } from 'lucide-react';
import { Agent, Property } from '../types';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

interface SendToAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  assignedAgent?: Agent;
}

export function SendToAgentModal({ isOpen, onClose, property, assignedAgent }: SendToAgentModalProps) {
  const { user } = useAuthStore();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(assignedAgent || null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Sample agents data for development/demo
  const sampleAgents: Agent[] = [
    {
      id: '1',
      name: 'Ryan Lonsway',
      email: 'ryan.lonsway@realtor.com',
      phone: '(313) 555-0100',
      photo: 'https://bokntskowkscayyrauyi.supabase.co/storage/v1/object/public/images/HEADSHOT%202024.PNG',
      specialties: ['Investment Properties', 'Fix and Flip', 'BRRR Strategy', 'Multi-family'],
      rating: 5.0,
      review_count: 189
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@realtor.com',
      phone: '(313) 555-0123',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
      specialties: ['Residential', 'Investment Properties', 'First-time Buyers'],
      rating: 4.9,
      review_count: 127
    },
    {
      id: '3',
      name: 'Michael Chen',
      email: 'michael.chen@realtor.com',
      phone: '(313) 555-0124',
      photo: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400',
      specialties: ['Commercial', 'Multi-family', 'Property Development'],
      rating: 4.8,
      review_count: 98
    }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchAgents();
    }
  }, [isOpen]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      
      // For development, use sample data
      // In production, this would fetch from Supabase
      const data = sampleAgents;
      setAgents(data);

    } catch (error) {
      console.error('Error fetching agents:', error);
      setFetchError('Failed to load agents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendToAgent = async () => {
    if (!selectedAgent || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('agent_assignments')
        .insert({
          agent_id: selectedAgent.id,
          client_id: user.id,
          property_id: property.id,
          message,
          status: 'pending'
        });

      if (error) throw error;
      onClose();
    } catch (error) {
      console.error('Error sending to agent:', error);
      setFetchError('Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.specialties.some(specialty => 
      specialty.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-100">
              {assignedAgent ? 'Contact Your Agent' : 'Select an Agent'}
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {fetchError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400">
              {fetchError}
            </div>
          )}

          {!assignedAgent && (
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search agents by name or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-100"
                />
              </div>
            </div>
          )}

          <div className="space-y-4 mb-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-400">Loading agents...</p>
              </div>
            ) : assignedAgent ? (
              <div className={`p-4 bg-gray-700/50 rounded-lg border ${
                selectedAgent?.id === assignedAgent.id ? 'border-blue-500' : 'border-gray-600'
              }`}>
                <div className="flex items-center gap-4">
                  {assignedAgent.photo ? (
                    <img
                      src={assignedAgent.photo}
                      alt={assignedAgent.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center">
                      <span className="text-2xl text-gray-300">
                        {assignedAgent.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-100">{assignedAgent.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span>{assignedAgent.rating.toFixed(1)} ({assignedAgent.review_count} reviews)</span>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <a
                        href={`tel:${assignedAgent.phone}`}
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                      >
                        <Phone className="w-4 h-4" />
                        {assignedAgent.phone}
                      </a>
                      <a
                        href={`mailto:${assignedAgent.email}`}
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                      >
                        <Mail className="w-4 h-4" />
                        {assignedAgent.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ) : filteredAgents.length > 0 ? (
              filteredAgents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className={`w-full p-4 bg-gray-700/50 rounded-lg border ${
                    selectedAgent?.id === agent.id ? 'border-blue-500' : 'border-gray-600'
                  } hover:border-blue-400 transition-colors text-left`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                      {agent.photo ? (
                        <img
                          src={agent.photo}
                          alt={agent.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.parentElement!.innerHTML = `<span class="text-2xl font-medium text-gray-300">${agent.name.split(' ').map(n => n[0]).join('')}</span>`;
                          }}
                        />
                      ) : (
                        <span className="text-2xl font-medium text-gray-300">
                          {agent.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-medium text-gray-100">{agent.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>{agent.rating.toFixed(1)} ({agent.review_count} reviews)</span>
                      </div>
                      <div className="mt-1 text-sm text-gray-400">
                        Specialties: {agent.specialties.join(', ')}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No agents found matching your search.</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Message (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-100"
                placeholder="Add a message for the agent..."
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendToAgent}
                disabled={!selectedAgent || loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Sending...' : 'Send to Agent'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}