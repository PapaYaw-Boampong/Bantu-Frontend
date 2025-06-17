import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/authHooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // You might want to replace this with a proper loading component
  }

  if (!isAuthenticated) {
    // Redirect to login page but save the attempted location
    return <Navigate to="/welcome" state={{ from: location }} replace />;
  }

  return <>{children}</>;
} 