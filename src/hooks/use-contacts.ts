import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ApiContactListResponse } from '@/types/api';
import { transformContact } from '@/lib/transforms';
import type { ContactSortOption } from '@/types';

/**
 * Map frontend sort options to backend query params.
 */
const SORT_MAP: Record<ContactSortOption, { sortBy: string; sortOrder: string }> = {
  'name-asc': { sortBy: 'title', sortOrder: 'asc' },
  'name-desc': { sortBy: 'title', sortOrder: 'desc' },
};

interface UseContactsParams {
  type?: string;       // ContactType filter (lowercase from frontend)
  search?: string;
  sort?: ContactSortOption;
}

/**
 * Fetch contacts with optional filters and sorting.
 * Backend supports: type, search, sortBy, sortOrder, page, limit
 */
export function useContacts(params: UseContactsParams = {}) {
  return useQuery({
    queryKey: ['contacts', params],
    queryFn: async () => {
      const query: Record<string, string | number> = {
        limit: 100, // Get all contacts
      };

      // Type filter (convert lowercase to uppercase for API)
      if (params.type && params.type !== 'all') {
        query.type = params.type.toUpperCase();
      }

      // Search
      if (params.search) {
        query.search = params.search;
      }

      // Sort
      if (params.sort && SORT_MAP[params.sort]) {
        query.sortBy = SORT_MAP[params.sort].sortBy;
        query.sortOrder = SORT_MAP[params.sort].sortOrder;
      }

      const { data } = await apiClient.get<ApiContactListResponse>('/contacts', {
        params: query,
      });

      return data.contacts.map(transformContact);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes — contacts don't change often
  });
}
