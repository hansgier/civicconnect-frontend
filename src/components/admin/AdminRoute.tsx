import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

interface AdminRouteProps {
  requiredRoles?: Array<'ADMIN' | 'ASSISTANT_ADMIN'>;
  redirectTo?: string;
}

export function AdminRoute({
  requiredRoles = ['ADMIN', 'ASSISTANT_ADMIN'],
  redirectTo = '/',
}: AdminRouteProps) {
  const { user, isAuthenticated, isGuest, isLoading } = useAuth();

  // Show nothing while checking auth status
  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || isGuest) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (user && !requiredRoles.includes(user.role as 'ADMIN' | 'ASSISTANT_ADMIN')) {
    toast.error('You do not have permission to access the admin panel');
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
