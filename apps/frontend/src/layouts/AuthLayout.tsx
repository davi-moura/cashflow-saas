import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export function AuthLayout() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-teal-50 p-4">
      <Outlet />
    </div>
  );
}
