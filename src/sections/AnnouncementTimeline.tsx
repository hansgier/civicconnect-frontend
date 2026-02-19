import { useState, useMemo } from 'react';
import { Calendar, ChevronRight, CircleAlert, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Announcement, AnnouncementSortOption } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RichTextRenderer } from '@/components/ui/rich-text-renderer';
import { FilterPanel, type AnnouncementFilters } from '@/components/interactions/FilterPanel';
import { SortDropdown } from '@/components/interactions/SortDropdown';
import { useAnnouncements } from '@/hooks/use-announcements';

function AnnouncementCard({ 
  announcement, 
  onClick 
}: { 
  announcement: Announcement; 
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'group  relative cursor-pointer overflow-hidden rounded-2xl border bg-card',
        'transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-xl',
        announcement.isUrgent && 'pulse-border border-red-500/50'
      )}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Thumbnail */}
        <div className="relative h-48 w-full shrink-0 overflow-hidden sm:h-auto sm:w-48">
          <img
            src={announcement.image || '/placeholder-announcement.jpg'}
            alt={announcement.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {announcement.isUrgent && (
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
              <CircleAlert className="h-3.5 w-3.5" />
              Urgent
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            {/* Category & Date */}
            <div className="mb-2 flex items-center gap-3">
              <span className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-medium',
                announcement.isUrgent 
                  ? 'bg-red-500/10 text-red-600' 
                  : 'bg-primary/10 text-primary'
              )}>
                {announcement.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              {announcement.location && (
                <span className="text-xs text-muted-foreground">
                  • {announcement.location}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="mb-2 text-lg font-semibold leading-tight group-hover:text-primary transition-colors">
              {announcement.title}
            </h3>

            {/* Excerpt */}
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {announcement.excerpt}
            </p>
          </div>

          {/* Author & Action */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={announcement.author.avatar}
                alt={announcement.author.name}
                className="h-8 w-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium">{announcement.author.name}</span>
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-primary">
              Read more
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AnnouncementTimelineProps {
  search?: string;
}

export function AnnouncementTimeline({ search }: AnnouncementTimelineProps) {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [filters, setFilters] = useState<AnnouncementFilters>({
    category: 'All',
    location: 'All',
    isUrgent: null,
    dateFrom: '',
    dateTo: '',
  });
  const [sort, setSort] = useState<AnnouncementSortOption>('newest');

  const { data: announcements = [], isLoading, isError } = useAnnouncements({
    filters,
    sort,
    search,
  });

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'All') count++;
    if (filters.location !== 'All') count++;
    if (filters.isUrgent !== null) count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    return count;
  }, [filters]);

  // Group by month
  const groupedAnnouncements = useMemo(() => {
    return announcements.reduce((groups, announcement) => {
      const date = new Date(announcement.createdAt);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(announcement);
      return groups;
    }, {} as Record<string, Announcement[]>);
  }, [announcements]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">Loading announcements...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Filters & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Announcements
          </h1>
          <p className="mt-1 text-muted-foreground">
            Stay informed about important updates and events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FilterPanel
            type="announcements"
            filters={filters}
            onFilterChange={setFilters}
            activeFilterCount={activeFilterCount}
          />
          <SortDropdown
            type="announcements"
            value={sort}
            onChange={setSort}
          />
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {announcements.length} announcement{announcements.length !== 1 ? 's' : ''}
      </div>

      {/* Timeline */}
      {announcements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {isError ? "Couldn't load announcements" : "No announcements found"}
          </h3>
          <p className="text-muted-foreground">
            {isError ? "Please try again later" : "Try adjusting your filters"}
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border hidden md:block" />

          {/* Month Groups */}
          <div className="space-y-12">
            {Object.entries(groupedAnnouncements).map(([monthYear, items]) => (
              <div key={monthYear} className="relative">
                {/* Month Marker */}
                <div className="mb-6 flex items-center gap-4 md:sticky md:top-20 md:z-10">
                  <div className="hidden md:flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-background">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-semibold text-muted-foreground bg-background/80 backdrop-blur-sm pr-4 rounded-r-lg">
                    {monthYear}
                  </h2>
                </div>

                {/* Announcements */}
                <div className="space-y-4 md:ml-12">
                  {items.map((announcement) => (
                    <AnnouncementCard
                      key={announcement.id}
                      announcement={announcement}
                      onClick={() => setSelectedAnnouncement(announcement)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog 
        open={selectedAnnouncement !== null} 
        onOpenChange={() => setSelectedAnnouncement(null)}
      >
        <DialogContent className="w-9xl max-h-[90vh] overflow-y-auto">
          {selectedAnnouncement && (
            <>
              <DialogHeader>
                <div className="mb-2 flex items-center gap-3">
                  <span className={cn(
                    'rounded-full px-2.5 py-0.5 text-xs font-medium',
                    selectedAnnouncement.isUrgent 
                      ? 'bg-red-500/10 text-red-600' 
                      : 'bg-primary/10 text-primary'
                  )}>
                    {selectedAnnouncement.category}
                  </span>
                  {selectedAnnouncement.isUrgent && (
                    <span className="flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                      <CircleAlert className="h-3.5 w-3.5" />
                      Urgent
                    </span>
                  )}
                </div>
                <DialogTitle className="text-2xl">
                  {selectedAnnouncement.title}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* Image */}
                <div className="overflow-hidden rounded-xl bg-muted">
                  <img
                    src={selectedAnnouncement.image || '/placeholder-announcement.jpg'}
                    alt={selectedAnnouncement.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Meta */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <img
                      src={selectedAnnouncement.author.avatar}
                      alt={selectedAnnouncement.author.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <span className="font-medium">{selectedAnnouncement.author.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {selectedAnnouncement.location && (
                      <span>{selectedAnnouncement.location}</span>
                    )}
                    <span>
                      {new Date(selectedAnnouncement.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <RichTextRenderer
                  content={selectedAnnouncement.content}
                  className="leading-relaxed"
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
