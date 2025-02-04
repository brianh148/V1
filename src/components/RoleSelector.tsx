import React from 'react';
import { Building2, Users, ClipboardList, PenTool as Tool, Briefcase, Upload } from 'lucide-react';
import { UserRole } from '../types/auth';
import { useAuthStore } from '../store/authStore';

export function RoleSelector() {
  const { setUser } = useAuthStore();

  const roles: { role: UserRole; label: string; icon: React.ReactNode }[] = [
    { role: 'admin', label: 'Admin', icon: <Building2 className="w-5 h-5" /> },
    { role: 'client', label: 'Client', icon: <Users className="w-5 h-5" /> },
    { role: 'agent', label: 'Agent', icon: <Briefcase className="w-5 h-5" /> },
    { role: 'inspector', label: 'Inspector', icon: <ClipboardList className="w-5 h-5" /> },
    { role: 'vendor', label: 'Vendor', icon: <Tool className="w-5 h-5" /> },
    { role: 'wholesaler', label: 'Wholesaler', icon: <Upload className="w-5 h-5" /> }
  ];

  const handleRoleSelect = (role: UserRole) => {
    setUser({
      id: '1',
      email: 'user@example.com',
      role
    });
  };

  return (
    <div className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-blue-400" />
            <span className="ml-2 text-xl font-bold text-gray-100">Fast Track Finder</span>
          </div>
          <div className="flex items-center space-x-2">
            {roles.map(({ role, label, icon }) => (
              <button
                key={role}
                onClick={() => handleRoleSelect(role)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-800 text-gray-300 hover:text-gray-100"
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}