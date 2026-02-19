import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ApiAnnouncementListResponse } from '@/types/api';
import { transformAnnouncement } from '@/lib/transforms';
import type { AnnouncementFilters, AnnouncementSortOption } from '@/types';

/**
 * Map frontend announcement category to backend enum.
 */
const CATEGORY_MAP: Record<string, string> = {
  Event: 'EVENT',
  Safety: 'SAFETY',
  Policy: 'POLICY',
  Infrastructure: 'INFRASTRUCTURE',
};

interface UseAnnouncementsParams {
  filters: AnnouncementFilters;
  sort: AnnouncementSortOption;
  search?: string;
}

/**
 * Fetch announcements with optional filters.
 *
 * Backend supports: category, isUrgent, search, page, limit
 * Backend does NOT support: location filter, date range, sort direction
 *
 * Unsupported filters are applied client-side.
 */
export function useAnnouncements(params: UseAnnouncementsParams) {
  return useQuery({
    queryKey: ['announcements', params.filters, params.sort, params.search],
    queryFn: async () => {
      const query: Record<string, string | number> = {
        page: 1,
        limit: 100, // Fetch all — client-side filtering/sorting needed
      };

      // Category filter
      if (params.filters.category !== 'All' && CATEGORY_MAP[params.filters.category]) {
        query.category = CATEGORY_MAP[params.filters.category];
      }

      // Urgency filter
      if (params.filters.isUrgent !== null) {
        query.isUrgent = String(params.filters.isUrgent);
      }

      // Search
      if (params.search) {
        query.search = params.search;
      }

      const { data } = await apiClient.get<ApiAnnouncementListResponse>(
        '/announcements',
        { params: query }
      );

      let announcements = data.announcements.map(transformAnnouncement);

      // Client-side: location filter (backend doesn't filter by location)
      if (params.filters.location && params.filters.location !== 'All') {
        announcements = announcements.filter(
          (a) => a.location?.toLowerCase() === params.filters.location.toLowerCase()
        );
      }

      // Client-side: date range filter
      if (params.filters.dateFrom) {
        const from = new Date(params.filters.dateFrom).getTime();
        announcements = announcements.filter(
          (a) => new Date(a.createdAt).getTime() >= from
        );
      }
      if (params.filters.dateTo) {
        const to = new Date(params.filters.dateTo).getTime();
        announcements = announcements.filter(
          (a) => new Date(a.createdAt).getTime() <= to
        );
      }

      // Sort
      announcements.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return params.sort === 'newest' ? dateB - dateA : dateA - dateB;
      });

      return announcements;
    },
  });
}
