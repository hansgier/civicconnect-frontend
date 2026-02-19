import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/lib/auth';
import type { ApiUser, ApiUserListResponse, ApiUserResponse } from '@/types/api';
import type {
  AdminUserFilters,
  UpdateUserRoleInput,
  UpdateUserStatusInput,
  BulkDeleteResponse,
} from './types';
import type { AdminListResponse } from './types';
import { handleApiError, createRetryConfig, ApiError } from './utils';

const ADMIN_USERS_QUERY_KEY = ['admin', 'users'];

const QUERY_STALE_TIME = 1000 * 60 * 2;
const QUERY_GC_TIME = 1000 * 60 * 5;

export function useAdminUsersList(filters: AdminUserFilters = {}) {
  const { user } = useAuth();
  const { page = 1, limit = 20, search, sortBy, sortOrder, role, status, barangayId } = filters;

  const isEnabled = !!user && user.role === 'ADMIN';

  return useQuery<AdminListResponse<ApiUser>, ApiError>({
    queryKey: [...ADMIN_USERS_QUERY_KEY, 'list', filters],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit };
      if (search) params.search = search;
      if (sortBy) params.sortBy = sortBy;
      if (sortOrder) params.sortOrder = sortOrder;
      if (role) params.role = role;
      if (status) params.status = status;
      if (barangayId) params.barangayId = barangayId;

      const { data } = await apiClient.get<ApiUserListResponse>('/users', { params });
      return {
        data: data.users,
        pagination: data.pagination,
      };
    },
    enabled: isEnabled,
    staleTime: QUERY_STALE_TIME,
    gcTime: QUERY_GC_TIME,
    retry: createRetryConfig(),
    refetchOnWindowFocus: false,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: UpdateUserRoleInput) => {
      try {
        const { data } = await apiClient.patch<ApiUserResponse>(`/users/${userId}`, { role });
        return data.user;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, status }: UpdateUserStatusInput) => {
      try {
        const { data } = await apiClient.patch<ApiUserResponse>(`/users/${userId}`, { status });
        return data.user;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      try {
        await apiClient.delete(`/users/${userId}`);
      } catch (error) {
        throw handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    },
  });
}

export function useDeleteUsersBulk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      try {
        const results = await Promise.all(
          ids.map(async (id) => {
            await apiClient.delete(`/users/${id}`);
            return id;
          })
        );
        return {
          success: true,
          deletedCount: results.length,
          message: `Successfully deleted ${results.length} users`,
        } as BulkDeleteResponse;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
    },
  });
}
