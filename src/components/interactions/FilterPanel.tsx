import { useState, useMemo } from 'react';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { ProjectStatus, ProjectFilters, AnnouncementFilters } from '@/types';
import { useBarangays } from '@/hooks/use-barangays';

export type { ProjectFilters, AnnouncementFilters };

interface FilterPanelProps {
  type: 'projects' | 'announcements';
  filters: ProjectFilters | AnnouncementFilters;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFilterChange: (filters: any) => void;
  activeFilterCount: number;
}

const statusOptions: { value: ProjectStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'planned', label: 'Planned' },
  { value: 'approved-proposal', label: 'Approved Proposal' },
];

const categories = [
  'All',
  'Institutional',
  'Transportation',
  'Health',
  'Water',
  'Education',
  'Social',
  'Infrastructure',
  'Sports and Recreation',
  'Economic'
];

const budgetRanges = [
  { label: 'All' },
  { label: 'Under 1M PHP' },
  { label: '1M - 5M PHP' },
  { label: '5M - 10M PHP' },
  { label: 'Over 10M PHP' }
];

const announcementCategories = ['All', 'Event', 'Infrastructure', 'Safety', 'Policy'];

export function FilterPanel({ type, filters, onFilterChange, activeFilterCount }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: barangays = [] } = useBarangays();
  
  const locations = useMemo(() => {
    return ['All', ...barangays.map(b => b.name)].sort();
  }, [barangays]);

  const isProjectFilters = type === 'projects';
  const projectFilters = isProjectFilters ? filters as ProjectFilters : null;
  const announcementFilters = !isProjectFilters ? filters as AnnouncementFilters : null;

  const handleReset = () => {
    if (isProjectFilters) {
      onFilterChange({
        category: 'All',
        location: 'All',
        status: 'all',
        budgetRange: 'All',
        dateFrom: '',
        dateTo: '',
      });
    } else {
      onFilterChange({
        category: 'All',
        location: 'All',
        isUrgent: null,
        dateFrom: '',
        dateTo: '',
      });
    }
  };

  const updateFilter = (key: string, value: unknown) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'gap-2 relative',
            activeFilterCount > 0 && 'border-primary text-primary'
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto px-4 py-8">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <button
                onClick={handleReset}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Reset all
              </button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Category Filter */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {(isProjectFilters ? categories : announcementCategories).map((cat) => (
                <button
                  key={cat}
                  onClick={() => updateFilter('category', cat)}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm text-left transition-all',
                    filters.category === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Location Filter */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Location</label>
            <div className="relative">
              <select
                value={filters.location}
                onChange={(e) => updateFilter('location', e.target.value)}
                className="w-full appearance-none rounded-lg border bg-background px-3 py-2.5 text-sm"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-muted-foreground" />
            </div>
          </div>

          {/* Status Filter - Projects only */}
          {isProjectFilters && projectFilters && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Status</label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => updateFilter('status', status.value)}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-sm transition-all',
                      projectFilters.status === status.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Urgency Filter - Announcements only */}
          {!isProjectFilters && announcementFilters && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Priority</label>
              <div className="flex gap-2">
                <button
                  onClick={() => updateFilter('isUrgent', null)}
                  className={cn(
                    'flex-1 rounded-lg px-3 py-2 text-sm transition-all',
                    announcementFilters.isUrgent === null
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => updateFilter('isUrgent', true)}
                  className={cn(
                    'flex-1 rounded-lg px-3 py-2 text-sm transition-all',
                    announcementFilters.isUrgent === true
                      ? 'bg-red-500 text-white'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  Urgent
                </button>
                <button
                  onClick={() => updateFilter('isUrgent', false)}
                  className={cn(
                    'flex-1 rounded-lg px-3 py-2 text-sm transition-all',
                    announcementFilters.isUrgent === false
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  Regular
                </button>
              </div>
            </div>
          )}

          {/* Budget Filter - Projects only */}
          {isProjectFilters && projectFilters && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Budget Range</label>
              <div className="space-y-2">
                {budgetRanges.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => updateFilter('budgetRange', range.label)}
                    className={cn(
                      'w-full rounded-lg px-3 py-2 text-sm text-left transition-all flex items-center justify-between',
                      projectFilters.budgetRange === range.label
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    )}
                  >
                    <span>{range.label}</span>
                    {projectFilters.budgetRange === range.label && (
                      <span className="h-2 w-2 rounded-full bg-current" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date Range Filter */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Date Range</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">From</label>
                <DatePicker
                  date={filters.dateFrom}
                  onChange={(value) => updateFilter('dateFrom', value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">To</label>
                <DatePicker
                  date={filters.dateTo}
                  onChange={(value) => updateFilter('dateTo', value)}
                />
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
