import { useState } from 'react';
import { Search, X, LogIn } from 'lucide-react';
import { Link } from 'react-router';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { User } from '@/types';
import { NotificationPanel } from '@/components/interactions/NotificationPanel';
import { useAuth } from '@/lib/auth';
import { AdminNavButton } from './AdminNavButton';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentUser?: User;
}

export function TopBar({
  searchQuery,
  onSearchChange,
  currentUser,
}: TopBarProps) {
  const { isGuest } = useAuth();
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-40 lg:left-[72px]">
      <div className="flex h-16 items-center justify-between gap-4 border-b border-border/50 bg-background/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
        {/* Logo - Mobile Only */}
        <Link to="/" className="flex items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#e03000] to-[#0082f3]">
            <span className="text-lg font-bold text-white">C</span>
          </div>
          <span className="text-lg font-bold">CivicConnect</span>
        </Link>

        {/* Search Bar */}
        <div className="hidden flex-1 max-w-xl sm:block">
          <div
            className={cn(
              'relative flex items-center transition-all duration-300',
              isSearchFocused && 'scale-[1.02]'
            )}
          >
            <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search projects, announcements, contacts..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={cn(
                'h-11 w-full rounded-full border bg-muted/50 pl-10 pr-10 text-sm',
                'transition-all duration-300',
                'focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20',
                isSearchFocused && 'w-full border-primary shadow-lg shadow-primary/10'
              )}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 h-5 w-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Search Icon - Mobile */}
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-muted sm:hidden">
            <Search className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Admin Button */}
          <AdminNavButton />

          {/* Notifications */}
          <NotificationPanel />

          {/* User Avatar / Login Button */}
          {currentUser && !isGuest ? (
            <Link to="/profile" className="group relative">
              <div className="relative rounded-full p-0.5 transition-all duration-300">
                <Avatar className="h-9 w-9 ring-2 ring-background transition-transform duration-300 group-hover:scale-105">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
            </Link>
          ) : (
            <Button asChild size="sm" className="rounded-full gap-2">
              <Link to="/login">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
