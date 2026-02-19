import { useState } from 'react';
import { Bell, X, ThumbsUp, MessageCircle, Info, Megaphone, RefreshCw, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Notification } from '@/types';
import { useAuth } from '@/lib/auth';
import {
  useNotifications,
  useMarkRead,
  useMarkAllRead,
  useDeleteNotification,
  useUnreadCount,
} from '@/hooks/use-notifications';

const notificationIcons: Record<Notification['type'], React.ElementType> = {
  approval: ThumbsUp,
  comment: MessageCircle,
  update: RefreshCw,
  announcement: Megaphone,
  system: Info,
};

const notificationColors: Record<Notification['type'], string> = {
  approval: 'bg-green-500',
  comment: 'bg-blue-500',
  update: 'bg-purple-500',
  announcement: 'bg-amber-500',
  system: 'bg-gray-500',
};

export function NotificationPanel() {
  const { isAuthenticated, isGuest } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();
  const deleteNotification = useDeleteNotification();

  if (!isAuthenticated || isGuest) return null;

  const notifications = data?.notifications || [];

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markRead.mutate(notification.id);
    }
    
    setIsOpen(false);

    if (notification.projectId) {
      navigate(`/projects/${notification.projectId}`);
    } else if (notification.announcementId) {
      navigate('/announcements'); // Could deep link if we add that logic
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button className="group relative flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-all duration-300 hover:bg-muted/80">
          <Bell className="h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground ring-2 ring-background animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="text-sm text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
              >
                Mark all as read
              </button>
            )}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-sm text-muted-foreground">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">No notifications yet</p>
              <p className="text-muted-foreground text-xs px-8">Stay tuned for updates on your community projects!</p>
            </div>
          ) : (
            <div className="space-y-2 pb-8">
              {notifications.map((notification) => {
                const Icon = notificationIcons[notification.type] || Info;
                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      'group relative flex gap-3 rounded-xl p-4 cursor-pointer transition-all',
                      'hover:bg-muted',
                      !notification.read && 'bg-primary/5'
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
                        notificationColors[notification.type] || 'bg-gray-500'
                      )}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn('font-medium text-sm', !notification.read && 'text-primary')}>
                          {notification.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap uppercase font-semibold">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {!notification.read && (
                      <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-primary" />
                    )}

                    {/* Dismiss button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification.mutate(notification.id);
                      }}
                      disabled={deleteNotification.isPending}
                      className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-destructive transition-all"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
