import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ApiProjectListResponse, ApiProjectDetailResponse } from '@/types/api';
import { transformProjectListItem, transformProjectDetail } from '@/lib/transforms';
import type { ProjectFilters, SortOption } from '@/types';

// ============================================================
// Filter/Sort mapping helpers
// ============================================================

const CATEGORY_MAP: Record<string, string> = {
  Institutional: 'INSTITUTIONAL',
  Transportation: 'TRANSPORTATION',
  Health: 'HEALTH',
  Water: 'WATER',
  Education: 'EDUCATION',
  Social: 'SOCIAL',
  Infrastructure: 'INFRASTRUCTURE',
  'Sports and Recreation': 'SPORTS_AND_RECREATION',
  Economic: 'ECONOMIC',
};

const STATUS_MAP: Record<string, string> = {
  ongoing: 'ONGOING',
  completed: 'COMPLETED',
  cancelled: 'CANCELLED',
  'on-hold': 'ON_HOLD',
  planned: 'PLANNED',
  'approved-proposal': 'APPROVED_PROPOSAL',
};

const SORT_MAP: Record<SortOption, { sortBy: string; sortOrder: string } | null> = {
  newest: { sortBy: 'createdAt', sortOrder: 'desc' },
  oldest: { sortBy: 'createdAt', sortOrder: 'asc' },
  'most-approved': null,    // No backend support — client-side sort
  'least-approved': null,   // No backend support — client-side sort
  'budget-high': { sortBy: 'cost', sortOrder: 'desc' },
  'budget-low': { sortBy: 'cost', sortOrder: 'asc' },
};

interface UseProjectsParams {
  filters: ProjectFilters;
  sort: SortOption;
  search?: string;
  barangayIdMap?: Record<string, string>; // name -> id mapping from useBarangays
}

/**
 * Build API query params from frontend filter state.
 *
 * Budget range and date filters are NOT supported by the backend.
 * They will be applied client-side after fetch.
 */
function buildQueryParams(
  params: UseProjectsParams,
  page: number
): Record<string, string | number> {
  const query: Record<string, string | number> = { page, limit: 12 };

  // Search
  if (params.search) query.search = params.search;

  // Category (skip "All")
  if (params.filters.category !== 'All' && CATEGORY_MAP[params.filters.category]) {
    query.category = CATEGORY_MAP[params.filters.category];
  }

  // Status (skip "all")
  if (params.filters.status !== 'all' && STATUS_MAP[params.filters.status]) {
    query.status = STATUS_MAP[params.filters.status];
  }

  // Location -> barangayId lookup
  if (
    params.filters.location !== 'All' &&
    params.barangayIdMap?.[params.filters.location]
  ) {
    query.barangayId = params.barangayIdMap[params.filters.location];
  }

  // Sort (only if backend supports it)
  const sortMapping = SORT_MAP[params.sort];
  if (sortMapping) {
    query.sortBy = sortMapping.sortBy;
    query.sortOrder = sortMapping.sortOrder;
  }

  return query;
}

// ============================================================
// Hooks
// ============================================================

/**
 * Fetch paginated project list with infinite scrolling support.
 */
export function useProjects(params: UseProjectsParams) {
  return useInfiniteQuery({
    queryKey: ['projects', params.filters, params.sort, params.search, params.barangayIdMap],
    queryFn: async ({ pageParam = 1 }) => {
      const query = buildQueryParams(params, pageParam as number);
      const { data } = await apiClient.get<ApiProjectListResponse>('/projects', {
        params: query,
      });

      let projects = data.projects.map(transformProjectListItem);

      // Client-side budget range filter (backend doesn't support this)
      if (params.filters.budgetRange && params.filters.budgetRange !== 'All') {
        projects = applyBudgetFilter(projects, params.filters.budgetRange, data.projects);
      }

      // Client-side date filter (backend doesn't support this)
      if (params.filters.dateFrom || params.filters.dateTo) {
        projects = applyDateFilter(
          projects,
          params.filters.dateFrom,
          params.filters.dateTo,
          data.projects
        );
      }

      return {
        projects,
        pagination: data.pagination,
      };
    },
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    // Enable refetch on window focus for real-time updates
    refetchOnWindowFocus: true,
    // Always consider data stale to ensure fresh counts after mutations
    staleTime: 0,
  });
}

/**
 * Fetch a single project with full detail (comments, media, updates, reactions).
 */
export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiProjectDetailResponse>(`/projects/${id}`);
      return transformProjectDetail(data.project);
    },
    enabled: !!id,
    // Enable refetch on window focus for real-time updates
    refetchOnWindowFocus: true,
    // Keep data fresh to reflect recent changes
    staleTime: 0,
  });
}

// ============================================================
// Client-side filter helpers
// ============================================================

function applyBudgetFilter(
  transformedProjects: ReturnType<typeof transformProjectListItem>[],
  budgetRange: string,
  rawProjects: ApiProjectListResponse['projects']
): typeof transformedProjects {
  // Budget ranges matching UI dropdowns
  const ranges: Record<string, { min: number; max: number }> = {
    'Under 1M PHP': { min: 0, max: 1_000_000 },
    '1M - 5M PHP': { min: 1_000_000, max: 5_000_000 },
    '5M - 10M PHP': { min: 5_000_000, max: 10_000_000 },
    'Over 10M PHP': { min: 10_000_000, max: Infinity },
  };

  const range = ranges[budgetRange];
  if (!range) return transformedProjects;

  return transformedProjects.filter((_, i) => {
    const cost = rawProjects[i]?.cost ? parseFloat(rawProjects[i].cost!) : 0;
    return cost >= range.min && cost < range.max;
  });
}

function applyDateFilter(
  transformedProjects: ReturnType<typeof transformProjectListItem>[],
  dateFrom: string,
  dateTo: string,
  rawProjects: ApiProjectListResponse['projects']
): typeof transformedProjects {
  return transformedProjects.filter((_, i) => {
    const startDate = rawProjects[i]?.startDate;
    if (!startDate) return true; // Include projects without dates

    const projectDate = new Date(startDate).getTime();
    if (dateFrom && projectDate < new Date(dateFrom).getTime()) return false;
    if (dateTo && projectDate > new Date(dateTo).getTime()) return false;
    return true;
  });
}
