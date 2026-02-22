import { Home, BarChart3, Bell, User, LogOut, Phone } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

interface MobileNavProps {
  onLogout?: () => void;
}

const navItems = [
  { id: '/', icon: Home, label: 'Home' },
  { id: '/dashboard', icon: BarChart3, label: 'Dashboard' },
  { id: '/announcements', icon: Bell, label: 'Alerts' },
  { id: '/contacts', icon: Phone, label: 'Contacts' },
  { id: '/profile', icon: User, label: 'Profile' },
];

export function MobileNav({ onLogout }: MobileNavProps) {
  const location = useLocation();
  const { isGuest } = useAuth();

  const filteredNavItems = navItems.filter(item => {
    if (item.id === '/profile' && isGuest) return false;
    return true;
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/95 backdrop-blur-xl lg:hidden">
      <div className="flex h-16 items-center justify-evenly px-2">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.id;

          return (
            <Link
              key={item.id}
              to={item.id}
              className={cn(
                'group flex flex-col items-center gap-1 rounded-xl px-2 py-2 transition-all duration-300',
                isActive && 'bg-primary/10'
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'h-5 w-5 transition-all duration-300',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </div>
              <span
                className={cn(
                  'text-xs font-medium transition-colors duration-300',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground group-hover:text-foreground'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Logout button - separated visually from nav items */}
        {!isGuest && (
          <>
            <div className="h-8 w-px bg-border/50" />
            <button
              onClick={onLogout}
              className="group flex flex-col items-center gap-1 rounded-xl px-2 py-2 transition-all duration-300"
            >
              <LogOut className="h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:text-red-500" />
              <span className="text-xs font-medium text-muted-foreground group-hover:text-red-500">
                Log out
              </span>
            </button>
          </>
        )}
      </div>
      
      {/* Safe area padding for iOS */}
      <div className="h-safe-area-inset-bottom bg-background" />
    </nav>
  );
}
