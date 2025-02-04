import React, { useState } from 'react';
import { ClipboardList, Search, Download, FileText, Calendar, Building2, User } from 'lucide-react';

interface InspectionReport {
  id: string;
  propertyAddress: string;
  propertyImage: string;
  clientName: string;
  inspectionDate: string;
  reportDate: string;
  propertyType: string;
  squareFeet: number;
  findings: {
    category: string;
    items: {
      condition: 'good' | 'fair' | 'poor';
      description: string;
    }[];
  }[];
  estimatedRepairCosts: number;
  reportUrl: string;
}

const sampleReports: InspectionReport[] = [
  {
    id: '1',
    propertyAddress: '1234 Oak Street, Detroit, MI 48201',
    propertyImage: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400',
    clientName: 'John Anderson',
    inspectionDate: '2024-01-22T10:00:00Z',
    reportDate: '2024-01-22T15:30:00Z',
    propertyType: 'Single Family',
    squareFeet: 1800,
    findings: [
      {
        category: 'Structural',
        items: [
          { condition: 'fair', description: 'Foundation shows minor cracks, recommend monitoring' },
          { condition: 'good', description: 'Roof structure is sound with no visible issues' }
        ]
      },
      {
        category: 'Mechanical',
        items: [
          { condition: 'poor', description: 'HVAC system needs replacement, estimated age 20+ years' },
          { condition: 'fair', description: 'Electrical panel needs updating but is functional' }
        ]
      }
    ],
    estimatedRepairCosts: 12500,
    reportUrl: '#'
  },
  {
    id: '2',
    propertyAddress: '5678 Maple Avenue, Detroit, MI 48202',
    propertyImage: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400',
    clientName: 'Sarah Williams',
    inspectionDate: '2024-01-21T13:00:00Z',
    reportDate: '2024-01-21T17:45:00Z',
    propertyType: 'Multi Family',
    squareFeet: 2400,
    findings: [
      {
        category: 'Plumbing',
        items: [
          { condition: 'poor', description: 'Multiple leaks detected in basement pipes' },
          { condition: 'fair', description: 'Water heater is functional but aging' }
        ]
      },
      {
        category: 'Interior',
        items: [
          { condition: 'good', description: 'Walls and ceilings in good condition' },
          { condition: 'fair', description: 'Some windows need weatherstripping replacement' }
        ]
      }
    ],
    estimatedRepairCosts: 8750,
    reportUrl: '#'
  }
];

export function InspectionReports() {
  const [searchTerm, setSearchTerm] = useState('');
  const [reports, setReports] = useState<InspectionReport[]>(sampleReports);

  const filteredReports = reports.filter(report =>
    report.propertyAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getConditionColor = (condition: 'good' | 'fair' | 'poor') => {
    switch (condition) {
      case 'good':
        return 'text-green-400';
      case 'fair':
        return 'text-yellow-400';
      case 'poor':
        return 'text-red-400';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">Inspection Reports</h1>
        <p className="mt-2 text-gray-400">
          View and manage completed inspection reports
        </p>
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

      {filteredReports.length > 0 ? (
        <div className="space-y-6">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
            >
              <div className="flex">
                <div className="w-48 h-48">
                  <img
                    src={report.propertyImage}
                    alt={report.propertyAddress}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-100">{report.propertyAddress}</h3>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          {report.propertyType} • {report.squareFeet} sqft
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {report.clientName}
                        </div>
                      </div>
                    </div>
                    <a
                      href={report.reportUrl}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download Report
                    </a>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">
                          Inspected: {formatDate(report.inspectionDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">
                          Report Generated: {formatDate(report.reportDate)}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Key Findings:</h4>
                      <div className="space-y-2">
                        {report.findings.map((category, index) => (
                          <div key={index} className="text-sm">
                            <span className="text-gray-400">{category.category}:</span>
                            <ul className="mt-1 space-y-1">
                              {category.items.map((item, itemIndex) => (
                                <li
                                  key={itemIndex}
                                  className={`${getConditionColor(item.condition)}`}
                                >
                                  • {item.description}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Estimated Repair Costs:</span>
                      <span className="text-lg font-semibold text-gray-100">
                        ${report.estimatedRepairCosts.toLocaleString()}
                      </span>
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
          <p className="text-gray-400">No inspection reports found.</p>
        </div>
      )}
    </div>
  );
}