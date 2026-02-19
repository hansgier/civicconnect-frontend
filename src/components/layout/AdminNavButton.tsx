import { Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

export function AdminNavButton() {
  const { user } = useAuth();
  const location = useLocation();

  // Only show for ADMIN and ASSISTANT_ADMIN
  if (!user || (user.role !== 'ADMIN' && user.role !== 'ASSISTANT_ADMIN')) {
    return null;
  }

  const isActive = location.pathname === '/admin';

  return (
    <Link
      to="/admin"
      className={cn(
        'flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-gradient-to-r from-[#e03000] to-[#0082f3] text-white shadow-lg shadow-primary/20'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
      title="Admin Panel"
    >
      <Shield className="h-4 w-4" />
      <span className="hidden sm:inline">Admin</span>
    </Link>
  );
}
