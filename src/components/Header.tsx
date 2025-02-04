import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Building2, LogOut, Users, ClipboardList, Settings, Home, UserCheck, Briefcase, PenTool as Tool, Clock, DollarSign, Calculator, CheckCircle, Upload, List } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types/auth';

const roleLinks: Record<UserRole, { to: string; label: string; icon: React.ReactNode }[]> = {
  client: [
    { to: '/', label: 'Properties', icon: <Home className="w-4 h-4" /> },
    { to: '/my-properties', label: 'Saved Properties', icon: <Building2 className="w-4 h-4" /> },
    { to: '/requests', label: 'My Requests', icon: <ClipboardList className="w-4 h-4" /> },
  ],
  agent: [
    { to: '/agent', label: 'Dashboard', icon: <Briefcase className="w-4 h-4" /> },
    { to: '/agent/clients', label: 'My Clients', icon: <Users className="w-4 h-4" /> },
    { to: '/agent/offers', label: 'Offers', icon: <DollarSign className="w-4 h-4" /> },
  ],
  inspector: [
    { to: '/inspector', label: 'Dashboard', icon: <Briefcase className="w-4 h-4" /> },
    { to: '/inspector/requests', label: 'Inspection Requests', icon: <ClipboardList className="w-4 h-4" /> },
    { to: '/inspector/reports', label: 'Reports', icon: <Tool className="w-4 h-4" /> },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: <Home className="w-4 h-4" /> },
    { to: '/admin/for-review', label: 'For Review', icon: <ClipboardList className="w-4 h-4" /> },
    { to: '/admin/reviewed', label: 'Reviewed', icon: <CheckCircle className="w-4 h-4" /> },
  ],
  vendor: [
    { to: '/vendor', label: 'Dashboard', icon: <Briefcase className="w-4 h-4" /> },
    { to: '/vendor/quotes', label: 'Quote Requests', icon: <Calculator className="w-4 h-4" /> },
  ],
  wholesaler: [
    { to: '/wholesaler', label: 'Dashboard', icon: <Briefcase className="w-4 h-4" /> },
    { to: '/wholesaler/listings', label: 'My Listings', icon: <List className="w-4 h-4" /> },
    { to: '/wholesaler/submit', label: 'Submit Property', icon: <Upload className="w-4 h-4" /> },
  ],
  va: [
    { to: '/va', label: 'Dashboard', icon: <Briefcase className="w-4 h-4" /> },
    { to: '/va/properties', label: 'Properties', icon: <Building2 className="w-4 h-4" /> },
    { to: '/va/reviews', label: 'Reviews', icon: <ClipboardList className="w-4 h-4" /> },
  ],
};

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (!user?.role) return null;
  
  const links = roleLinks[user.role];
  
  return (
    <header className="bg-gray-800 shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold text-gray-100">Fast Track Finder</span>
            </Link>
          </div>
          <nav className="flex items-center space-x-1">
            {links.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === to
                    ? 'text-blue-400 bg-blue-400/10'
                    : 'text-gray-300 hover:text-gray-100 hover:bg-gray-700'
                }`}
              >
                {icon}
                {label}
              </Link>
            ))}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 ml-2 rounded-lg text-sm font-medium text-gray-300 hover:text-gray-100 hover:bg-gray-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}