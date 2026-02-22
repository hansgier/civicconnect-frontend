import { useState, useRef, useEffect } from 'react';
import { Search, X, LogIn, ArrowLeft } from 'lucide-react';
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
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  // Auto-focus the mobile search input when opened
  useEffect(() => {
    if (isMobileSearchOpen && mobileSearchRef.current) {
      mobileSearchRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  const handleCloseMobileSearch = () => {
    setIsMobileSearchOpen(false);
    onSearchChange('');
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-40 lg:left-[72px]">
      <div className="flex h-16 items-center justify-between gap-4 border-b border-border/50 bg-background/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">

        {/* Mobile Search Expanded State */}
        {isMobileSearchOpen && (
          <div className="flex flex-1 items-center gap-3 sm:hidden animate-in fade-in slide-in-from-right-4 duration-200">
            <button
              onClick={handleCloseMobileSearch}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={mobileSearchRef}
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-10 w-full rounded-full border bg-muted/50 pl-9 pr-9 text-sm focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Logo - Mobile Only (hidden when mobile search is open) */}
        {!isMobileSearchOpen && (
          <Link to="/" className="flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#e03000] to-[#0082f3]">
              <span className="text-lg font-bold text-white">C</span>
            </div>
            <span className="text-lg font-bold">CivicConnect</span>
          </Link>
        )}

        {/* Search Bar - Desktop/Tablet */}
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

        {/* Right Section (hidden when mobile search is open) */}
        {!isMobileSearchOpen && (
          <div className="flex items-center gap-3">
            {/* Search Icon - Mobile */}
            <button
              onClick={() => setIsMobileSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-muted sm:hidden"
            >
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
        )}
      </div>
    </header>
  );
}
