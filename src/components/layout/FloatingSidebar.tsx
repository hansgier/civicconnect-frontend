import { 
  Home, 
  Bell, 
  BarChart3, 
  User, 
  LogOut,
  Phone
} from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/lib/auth';

interface FloatingSidebarProps {
  onLogout?: () => void;
}

const navItems = [
  { id: '/', icon: Home, label: 'Home' },
  { id: '/dashboard', icon: BarChart3, label: 'Dashboard' },
  { id: '/announcements', icon: Bell, label: 'Announcements' },
  { id: '/contacts', icon: Phone, label: 'Contacts' },
  { id: '/profile', icon: User, label: 'Profile' },
];

export function FloatingSidebar({ onLogout }: FloatingSidebarProps) {
  const location = useLocation();
  const { isGuest } = useAuth();

  const filteredNavItems = navItems.filter(item => {
    if (item.id === '/profile' && isGuest) return false;
    return true;
  });

  return (
    <TooltipProvider delayDuration={100}>
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[72px] flex-col border-r border-border/50 bg-background/80 backdrop-blur-xl lg:flex">
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-border/50">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#e03000] to-[#0082f3]">
            <span className="text-lg font-bold text-white">C</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col items-center gap-2 py-6">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.id;
            
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.id}
                    className={cn(
                      'group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300',
                      'hover:bg-muted',
                      isActive && 'bg-primary/10'
                    )}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <span className="absolute left-0 h-6 w-1 rounded-r-full bg-primary transition-all duration-300" />
                    )}
                    
                    <Icon
                      className={cn(
                        'h-5 w-5 transition-all duration-300',
                        'group-hover:scale-110',
                        isActive 
                          ? 'text-primary' 
                          : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* Log out */}
        <div className="flex flex-col items-center gap-2 border-t border-border/50 py-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={onLogout}
                className="group flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <LogOut className="h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:scale-110 group-hover:text-red-500" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              Log out
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
