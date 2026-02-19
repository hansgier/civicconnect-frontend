import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ApiProjectUpdate } from '@/types/api';

/**
 * Helper to normalize update data for the backend API.
 * Converts date strings to full ISO strings and ensures optional fields can be cleared.
 */
function prepareUpdateData<T extends CreateUpdateInput | UpdateUpdateInput>(data: T): Record<string, unknown> {
  const result: Record<string, unknown> = { ...data };

  // Handle dates: backend expects full ISO datetime strings
  // Date input normally gives "YYYY-MM-DD"
  if (typeof result.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(result.date)) {
    result.date = `${result.date}T00:00:00.000Z`;
  }

  // Ensure optional fields can be cleared (send empty string for Text fields)
  if (result.description === '') result.description = '';

  return result;
}
import type {
  AdminUpdateFilters,
  CreateUpdateInput,
  UpdateUpdateInput,
  BulkDeleteResponse,
} from './types';
import type { AdminListResponse } from './types';
import { handleApiError, createRetryConfig, ApiError } from './utils';

const ADMIN_UPDATES_QUERY_KEY = ['admin', 'updates'];

const QUERY_STALE_TIME = 1000 * 60 * 2;
const QUERY_GC_TIME = 1000 * 60 * 5;

export function useAdminUpdatesList(filters: AdminUpdateFilters = {}) {
  const { page = 1, limit = 20, projectId, search } = filters;

  return useQuery<AdminListResponse<ApiProjectUpdate>, ApiError>({
    queryKey: [...ADMIN_UPDATES_QUERY_KEY, 'list', filters],
    queryFn: async () => {
      if (!projectId || projectId === 'none') {
        return {
          data: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        };
      }

      const params: Record<string, string | number> = { page, limit };
      if (search) params.search = search;

      const { data } = await apiClient.get<{ updates: ApiProjectUpdate[] }>(
        `/projects/${projectId}/updates`,
        { params }
      );

      return {
        data: data.updates,
        pagination: {
          page,
          limit,
          total: data.updates.length,
          totalPages: Math.ceil(data.updates.length / limit),
        },
      };
    },
    enabled: !!projectId && projectId !== 'none',
    staleTime: QUERY_STALE_TIME,
    gcTime: QUERY_GC_TIME,
    retry: createRetryConfig(),
    refetchOnWindowFocus: false,
  });
}

export function useCreateUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateUpdateInput) => {
      try {
        const { projectId, ...rest } = input;
        const normalizedData = prepareUpdateData(rest as CreateUpdateInput);
        const { data } = await apiClient.post(`/projects/${projectId}/updates`, normalizedData);
        return data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_UPDATES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
    },
  });
}

export function useUpdateUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ updateId, projectId, ...rest }: UpdateUpdateInput) => {
      try {
        const normalizedData = prepareUpdateData(rest as UpdateUpdateInput);
        const { data } = await apiClient.patch(`/projects/${projectId}/updates/${updateId}`, normalizedData);
        return data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_UPDATES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
    },
  });
}

export function useDeleteUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ updateId, projectId }: { updateId: string; projectId: string }) => {
      try {
        await apiClient.delete(`/projects/${projectId}/updates/${updateId}`);
      } catch (error) {
        throw handleApiError(error);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_UPDATES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
    },
  });
}

export function useDeleteUpdatesBulk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: Array<{ id: string; projectId: string }>) => {
      try {
        const results = await Promise.all(
          items.map(async ({ id, projectId }) => {
            await apiClient.delete(`/projects/${projectId}/updates/${id}`);
            return id;
          })
        );
        return {
          success: true,
          deletedCount: results.length,
          message: `Successfully deleted ${results.length} updates`,
        } as BulkDeleteResponse;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_UPDATES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['project'] });
    },
  });
}
