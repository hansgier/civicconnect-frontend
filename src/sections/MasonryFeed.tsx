import { useEffect, useRef, useMemo } from 'react';
import { ProjectCard, ProjectCardSkeleton } from '@/components/cards/ProjectCard';
import type { Project, ProjectFilters, SortOption } from '@/types';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjects } from '@/hooks/use-projects';
import { useBarangays } from '@/hooks/use-barangays';
import { FilterPanel } from '../components/interactions/FilterPanel';
import { SortDropdown } from '../components/interactions/SortDropdown';

interface MasonryFeedProps {
  filters: ProjectFilters;
  sort: SortOption;
  search: string;
  onFilterChange: (filters: ProjectFilters) => void;
  onSortChange: (sort: SortOption) => void;
}

// Distribute projects into columns for masonry effect
function distributeProjects(projects: Project[], columnCount: number): Project[][] {
  const columns: Project[][] = Array.from({ length: columnCount }, () => []);
  const columnHeights: number[] = Array(columnCount).fill(0);

  projects.forEach((project) => {
    // Find the shortest column
    const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
    columns[shortestColumnIndex].push(project);

    // Update column height (approximate based on aspect ratio)
    const aspectRatio = getAspectRatio(project.id);
    columnHeights[shortestColumnIndex] += aspectRatio;
  });

  return columns;
}

function getAspectRatio(projectId: string): number {
  // Use simple hash of ID to consistently assign aspect ratios if not provided
  const charCodeSum = projectId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const type = charCodeSum % 3;
  if (type === 0) return 1.25; // portrait
  if (type === 1) return 1;    // square
  return 0.625;                // landscape
}

function getAspectRatioType(projectId: string): 'portrait' | 'square' | 'landscape' {
  const charCodeSum = projectId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const type = charCodeSum % 3;
  if (type === 0) return 'portrait';
  if (type === 1) return 'square';
  return 'landscape';
}

export function MasonryFeed({
  filters,
  sort,
  search,
  onFilterChange,
  onSortChange
}: MasonryFeedProps) {
  const loaderRef = useRef<HTMLDivElement>(null);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'All') count++;
    if (filters.status !== 'all') count++;
    if (filters.location !== 'All') count++;
    if (filters.budgetRange !== 'All') count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    return count;
  }, [filters]);

  const barangaysQuery = useBarangays();
  const barangayIdMap = useMemo(() => {
    return Object.fromEntries(
      (barangaysQuery.data || []).map(b => [b.name, b.id])
    );
  }, [barangaysQuery.data]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useProjects({ filters, sort, search, barangayIdMap });

  const projects = useMemo(() => {
    return data?.pages.flatMap((page) => page.projects) || [];
  }, [data]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage, isFetchingNextPage, isLoading]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="w-48 h-8 rounded-lg" />
            <Skeleton className="w-64 h-4 rounded-lg" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProjectCardSkeleton 
              key={i} 
              aspectRatio={i % 3 === 0 ? 'portrait' : i % 3 === 1 ? 'square' : 'landscape'} 
            />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Something went wrong"
        description="We couldn't load the projects. Please try again later."
      />
    );
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        title="No projects found"
        description="Try adjusting your search or filters to find what you're looking for."
      />
    );
  }

  // Create columns for responsive masonry
  const desktopColumns = distributeProjects(projects, 3);
  const tabletColumns = distributeProjects(projects, 2);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Discover Projects
          </h1>
          <p className="mt-1 text-muted-foreground">
            Explore civic initiatives in your community
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">
            {projects.length} projects
          </span>
          <FilterPanel
            type="projects"
            filters={filters}
            onFilterChange={onFilterChange}
            activeFilterCount={activeFilterCount}
          />
          <SortDropdown
            type="projects"
            value={sort}
            onChange={onSortChange}
          />
        </div>
      </div>

      <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
        {desktopColumns.map((column, columnIndex) => (
          <div key={columnIndex} className="flex flex-col gap-6">
            {column.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                aspectRatio={getAspectRatioType(project.id)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Masonry Grid - Tablet (2 columns) */}
      <div className="hidden sm:grid sm:grid-cols-2 sm:gap-6 lg:hidden">
        {tabletColumns.map((column, columnIndex) => (
          <div key={columnIndex} className="flex flex-col gap-6">
            {column.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                aspectRatio={getAspectRatioType(project.id)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Masonry Grid - Mobile (1 column) */}
      <div className="flex flex-col gap-6 sm:hidden">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            aspectRatio={getAspectRatioType(project.id)}
          />
        ))}
      </div>

      {/* Infinite Scroll Loader / Sentinel */}
      {(hasNextPage || isFetchingNextPage) && (
        <div
          ref={loaderRef}
          className="flex items-center justify-center py-12"
        >
          {isFetchingNextPage ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
               <ProjectCardSkeleton aspectRatio="portrait" />
               <ProjectCardSkeleton aspectRatio="square" />
               <ProjectCardSkeleton aspectRatio="landscape" />
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">Scroll for more</span>
          )}
        </div>
      )}

      {/* End of List */}
      {!hasNextPage && projects.length > 0 && (
        <div className="flex items-center justify-center py-12 text-muted-foreground text-sm border-t border-dashed">
          <span>You've reached the end of the feed</span>
        </div>
      )}
    </div>
  );
}
