import { Skeleton } from '@/components/ui/skeleton';

interface LoadingSkeletonProps {
  rowCount?: number;
  columnCount?: number;
  variant?: 'table' | 'cards' | 'form';
}

/**
 * Enhanced LoadingSkeleton with multiple variants
 * 
 * @param variant - 'table' for data tables, 'cards' for card layouts, 'form' for forms
 */
export function LoadingSkeleton({ 
  rowCount = 5, 
  columnCount = 5,
  variant = 'table'
}: LoadingSkeletonProps) {
  if (variant === 'cards') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
        {Array.from({ length: rowCount }).map((_, i) => (
          <div 
            key={i} 
            className="rounded-3xl border bg-card/50 p-6 backdrop-blur-xl space-y-5"
          >
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4 bg-primary/5" />
              <Skeleton className="h-4 w-1/4 bg-muted/50 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full opacity-60" />
              <Skeleton className="h-4 w-2/3 opacity-60" />
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-border/50">
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <Skeleton className="h-9 w-20 rounded-xl bg-primary/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'form') {
    return (
      <div className="rounded-3xl border bg-card/50 p-8 backdrop-blur-2xl space-y-8 animate-in zoom-in-95 duration-500">
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 opacity-70" />
            <Skeleton className="h-12 w-full rounded-xl bg-muted/30" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 opacity-70" />
            <Skeleton className="h-32 w-full rounded-xl bg-muted/30" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20 opacity-70" />
              <Skeleton className="h-11 w-full rounded-xl bg-muted/30" />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Skeleton className="h-11 w-28 rounded-xl" />
          <Skeleton className="h-11 w-32 rounded-xl bg-primary/20" />
        </div>
      </div>
    );
  }

  // Default table variant
  return (
    <div className="rounded-3xl border bg-card/30 overflow-hidden backdrop-blur-xl animate-in fade-in duration-500">
      {/* Header */}
      <div className="h-14 bg-muted/20 border-b flex items-center px-6 gap-6">
        <Skeleton className="h-5 w-5 rounded-md" />
        {Array.from({ length: columnCount - 1 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-[140px] opacity-50" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="h-16 border-b border-border/40 last:border-0 flex items-center px-6 gap-6 hover:bg-muted/5 transition-colors"
        >
          <Skeleton className="h-5 w-5 rounded-md opacity-30" />
          <Skeleton className="h-4 w-[240px]" />
          <Skeleton className="h-4 w-[120px] opacity-60" />
          <Skeleton className="h-4 w-[120px] opacity-60" />
          <div className="ml-auto flex gap-3">
            <Skeleton className="h-9 w-9 rounded-xl bg-muted/50" />
            <Skeleton className="h-9 w-9 rounded-xl bg-muted/50" />
          </div>
        </div>
      ))}
    </div>
  );
}
