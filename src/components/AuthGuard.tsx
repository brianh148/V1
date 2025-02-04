import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Building2 } from 'lucide-react';
import { Header } from './Header';
import { RoleSelector } from './RoleSelector';

export function AuthGuard() {
  const navigate = useNavigate();
  const { user, loading, initialized } = useAuthStore();

  useEffect(() => {
    if (initialized && !loading && !user) {
      navigate('/login');
    }
  }, [user, loading, initialized, navigate]);

  if (loading || !initialized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
        <Building2 className="h-12 w-12 text-blue-400 mb-4" />
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-400 text-sm">Loading your dashboard...</p>
      </div>
    );
  }

  return user ? (
    <div className="min-h-screen bg-gray-900">
      <RoleSelector />
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  ) : null;
}