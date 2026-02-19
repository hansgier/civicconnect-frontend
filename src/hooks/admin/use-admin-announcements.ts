import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type {
  ApiAnnouncement,
  ApiAnnouncementListResponse,
  ApiAnnouncementDetailResponse,
} from '@/types/api';

/**
 * Helper to normalize announcement data for the backend API.
 * Converts empty optional strings to null to ensure they are cleared in the database.
 */
function prepareAnnouncementData<T extends CreateAnnouncementInput | UpdateAnnouncementInput>(data: T): Record<string, unknown> {
  const result: Record<string, unknown> = { ...data };

  // Handle optional fields: convert empty strings to undefined so they are ignored by Zod/Prisma
  // if they are not provided, or to null if we want to explicitly clear them (updates only)
  // For simplicity and to satisfy both create/update Zod schemas, undefined is safest.
  if (result.image === '') result.image = undefined;
  if (result.category === '' || result.category === 'all') result.category = undefined;
  if (result.excerpt === '') result.excerpt = undefined;
  if (result.location === '') result.location = undefined;

  return result;
}
import type {
  AdminAnnouncementFilters,
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
  BulkDeleteResponse,
} from './types';
import type { AdminListResponse } from './types';
import { handleApiError, createRetryConfig, ApiError } from './utils';

const ADMIN_ANNOUNCEMENTS_QUERY_KEY = ['admin', 'announcements'];

const QUERY_STALE_TIME = 1000 * 60 * 2;
const QUERY_GC_TIME = 1000 * 60 * 5;

export function useAdminAnnouncementsList(filters: AdminAnnouncementFilters = {}) {
  const { page = 1, limit = 20, search, sortBy, sortOrder, category, isUrgent } = filters;

  return useQuery<AdminListResponse<ApiAnnouncement>, ApiError>({
    queryKey: [...ADMIN_ANNOUNCEMENTS_QUERY_KEY, 'list', filters],
    queryFn: async () => {
      const params: Record<string, string | number | boolean> = { page, limit };
      if (search) params.search = search;
      if (sortBy) params.sortBy = sortBy;
      if (sortOrder) params.sortOrder = sortOrder;
      if (category) params.category = category;
      if (isUrgent !== undefined) params.isUrgent = isUrgent;

      const { data } = await apiClient.get<ApiAnnouncementListResponse>('/announcements', { params });
      return {
        data: data.announcements,
        pagination: data.pagination,
      };
    },
    staleTime: QUERY_STALE_TIME,
    gcTime: QUERY_GC_TIME,
    retry: createRetryConfig(),
    refetchOnWindowFocus: false,
  });
}

export function useAdminAnnouncement(announcementId: string) {
  return useQuery<ApiAnnouncement, ApiError>({
    queryKey: [...ADMIN_ANNOUNCEMENTS_QUERY_KEY, 'detail', announcementId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiAnnouncementDetailResponse>(`/announcements/${announcementId}`);
      return data.announcement;
    },
    enabled: !!announcementId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateAnnouncementInput) => {
      try {
        const normalizedData = prepareAnnouncementData(input);
        const { data } = await apiClient.post('/announcements', normalizedData);
        return data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ANNOUNCEMENTS_QUERY_KEY });
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ announcementId, input }: { announcementId: string; input: UpdateAnnouncementInput }) => {
      try {
        const normalizedData = prepareAnnouncementData(input);
        const { data } = await apiClient.patch(`/announcements/${announcementId}`, normalizedData);
        return data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ANNOUNCEMENTS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...ADMIN_ANNOUNCEMENTS_QUERY_KEY, 'detail', variables.announcementId],
      });
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (announcementId: string) => {
      try {
        await apiClient.delete(`/announcements/${announcementId}`);
      } catch (error) {
        throw handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ANNOUNCEMENTS_QUERY_KEY });
    },
  });
}

export function useDeleteAnnouncementsBulk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      try {
        const results = await Promise.all(
          ids.map(async (id) => {
            await apiClient.delete(`/announcements/${id}`);
            return id;
          })
        );
        return {
          success: true,
          deletedCount: results.length,
          message: `Successfully deleted ${results.length} announcements`,
        } as BulkDeleteResponse;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ANNOUNCEMENTS_QUERY_KEY });
    },
  });
}
