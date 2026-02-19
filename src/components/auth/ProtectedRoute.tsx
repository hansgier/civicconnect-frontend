import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/lib/auth';

interface ProtectedRouteProps {
  requiredRoles?: Array<'ADMIN' | 'BARANGAY' | 'ASSISTANT_ADMIN' | 'CITIZEN'>;
  redirectTo?: string;
}

export function ProtectedRoute({
  requiredRoles,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isGuest, isLoading } = useAuth();

  // Show nothing while checking auth status
  if (isLoading) {
    return null; // Or a loading spinner
  }

  if (!isAuthenticated || isGuest) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role-based access
  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
