import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  FileSpreadsheet, 
  Upload, 
  Filter, 
  Trash2, 
  Edit3, 
  Check, 
  X 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Property } from '../types';
import { formatCurrency } from '../utils/format';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'published' | 'rejected'>('all');
  const [source, setSource] = useState<'all' | 'mls' | 'wholesaler'>('all');

  useEffect(() => {
    fetchProperties();
  }, [filter, source]);

  const fetchProperties = async () => {
    try {
      let query = supabase.from('properties').select('*');
      
      if (filter !== 'all') {
        query = query.eq('status', filter);
      }
      if (source !== 'all') {
        query = query.eq('source', source);
      }

      const { data, error } = await query;
      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result;
        if (typeof text !== 'string') return;

        const rows = text.split('\n').map(row => row.split(','));
        const headers = rows[0];
        const properties = rows.slice(1).map(row => {
          const property: any = {};
          headers.forEach((header, index) => {
            property[header.trim()] = row[index]?.trim();
          });
          return property;
        });

        // Upload properties to Supabase
        const { error } = await supabase
          .from('properties')
          .insert(properties.map(p => ({
            ...p,
            source: 'wholesaler',
            status: 'pending_review'
          })));

        if (error) throw error;
        fetchProperties();
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Error uploading properties:', error);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setProperties(properties.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1.5 text-gray-100"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending Review</option>
              <option value="published">Published</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Table className="w-5 h-5 text-gray-400" />
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as typeof source)}
              className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1.5 text-gray-100"
            >
              <option value="all">All Sources</option>
              <option value="mls">MLS</option>
              <option value="wholesaler">Wholesaler</option>
            </select>
          </div>
          <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer">
            <FileSpreadsheet className="w-5 h-5" />
            Import CSV
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Rehab Est.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Rent Potential
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {properties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-750">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-100">{property.address}</div>
                    <div className="text-sm text-gray-400">
                      {property.bedrooms}bd {property.bathrooms}ba {property.squareFeet}sqft
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                    {formatCurrency(property.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      property.source === 'mls' 
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {property.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      property.status === 'published'
                        ? 'bg-green-500/20 text-green-400'
                        : property.status === 'rejected'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {property.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                    {property.renovationCost ? formatCurrency(property.renovationCost) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                    {property.rentPotential ? formatCurrency(property.rentPotential) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {/* Handle edit */}}
                        className="p-1 text-gray-400 hover:text-blue-400"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProperty(property.id.toString())}
                        className="p-1 text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}