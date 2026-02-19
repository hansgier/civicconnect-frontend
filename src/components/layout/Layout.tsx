import { useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { cn } from '@/lib/utils';
import { FloatingSidebar } from './FloatingSidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { useAuth } from '@/lib/auth';
import { useLogout } from '@/hooks/use-auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Layout({
  searchQuery,
  onSearchChange,
}: LayoutProps) {
  const location = useLocation();
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => setShowLogoutDialog(false),
    });
  };

  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-background">
      {/* Floating Sidebar - Desktop */}
      <FloatingSidebar 
        onLogout={() => setShowLogoutDialog(true)}
      />

      {/* Top Bar */}
      <TopBar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        currentUser={user ? {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          email: user.email,
          contributions: user.contributions,
          joinedAt: user.joinedAt,
          status: user.status as 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED',
          userType: user.role.toLowerCase() as 'admin' | 'barangay' | 'assistant-admin' | 'resident'
        } : undefined}
      />

      {/* Main Content */}
      <main className={cn(
        "lg:pl-[72px] pb-20 lg:pb-8 min-h-screen",
        isHome ? 'pt-28' : 'pt-16'
      )}>
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav
        onLogout={() => setShowLogoutDialog(true)}
      />

      {/* Logout Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log out</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <p className="text-muted-foreground mb-6">Are you sure you want to log out?</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowLogoutDialog(false)}
                className="flex-1"
                disabled={logoutMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="flex-1"
                disabled={logoutMutation.isPending}
              >
                {logoutMutation.isPending ? 'Logging out...' : 'Log out'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
