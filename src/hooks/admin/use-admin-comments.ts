import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ApiComment, ApiCommentListResponse } from '@/types/api';
import type {
  AdminCommentFilters,
  BulkDeleteResponse,
} from './types';
import type { AdminListResponse } from './types';
import { handleApiError, createRetryConfig, ApiError } from './utils';

const ADMIN_COMMENTS_QUERY_KEY = ['admin', 'comments'];

const QUERY_STALE_TIME = 1000 * 60 * 2;
const QUERY_GC_TIME = 1000 * 60 * 5;

export function useAdminCommentsList(filters: AdminCommentFilters = {}) {
  const { page = 1, limit = 20, search, projectId, isOfficial, userId } = filters;

  return useQuery<AdminListResponse<ApiComment>, ApiError>({
    queryKey: [...ADMIN_COMMENTS_QUERY_KEY, 'list', filters],
    queryFn: async () => {
      if (!projectId || projectId === 'none') {
        return {
          data: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
        };
      }

      const params: Record<string, string | number | boolean> = { page, limit };
      if (search) params.search = search;
      if (userId) params.userId = userId;

      const { data } = await apiClient.get<ApiCommentListResponse>(
        `/projects/${projectId}/comments`,
        { params }
      );

      let filteredData = data.comments;
      if (isOfficial !== undefined) {
        filteredData = filteredData.filter((c) => c.isOfficial === isOfficial);
      }

      return {
        data: filteredData,
        pagination: {
          page,
          limit,
          total: filteredData.length,
          totalPages: Math.ceil(filteredData.length / limit),
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

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, projectId }: { commentId: string; projectId: string }) => {
      try {
        await apiClient.delete(`/projects/${projectId}/comments/${commentId}`);
      } catch (error) {
        throw handleApiError(error);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_COMMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
    },
  });
}

export function useDeleteCommentsBulk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (items: Array<{ id: string; projectId: string }>) => {
      try {
        const results = await Promise.all(
          items.map(async ({ id, projectId }) => {
            await apiClient.delete(`/projects/${projectId}/comments/${id}`);
            return id;
          })
        );
        return {
          success: true,
          deletedCount: results.length,
          message: `Successfully deleted ${results.length} comments`,
        } as BulkDeleteResponse;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_COMMENTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['project'] });
    },
  });
}
