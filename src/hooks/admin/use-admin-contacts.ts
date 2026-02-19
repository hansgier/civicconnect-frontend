import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ApiContact, ApiContactListResponse } from '@/types/api';
import type {
  AdminContactFilters,
  CreateContactInput,
  UpdateContactInput,
  BulkDeleteResponse,
} from './types';
import type { AdminListResponse } from './types';
import { handleApiError, createRetryConfig, ApiError } from './utils';

const ADMIN_CONTACTS_QUERY_KEY = ['admin', 'contacts'];

const QUERY_STALE_TIME = 1000 * 60 * 2;
const QUERY_GC_TIME = 1000 * 60 * 5;

export function useAdminContactsList(filters: AdminContactFilters = {}) {
  const { page = 1, limit = 20, search, sortBy, sortOrder, type, isEmergency } = filters;

  return useQuery<AdminListResponse<ApiContact>, ApiError>({
    queryKey: [...ADMIN_CONTACTS_QUERY_KEY, 'list', filters],
    queryFn: async () => {
      const params: Record<string, string | number | boolean> = { page, limit };
      if (search) params.search = search;
      if (sortBy) params.sortBy = sortBy;
      if (sortOrder) params.sortOrder = sortOrder;
      if (type) params.type = type;
      if (isEmergency !== undefined) params.isEmergency = isEmergency;

      const { data } = await apiClient.get<ApiContactListResponse>('/contacts', { params });
      return {
        data: data.contacts,
        pagination: data.pagination,
      };
    },
    staleTime: QUERY_STALE_TIME,
    gcTime: QUERY_GC_TIME,
    retry: createRetryConfig(),
    refetchOnWindowFocus: false,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateContactInput) => {
      try {
        const { data } = await apiClient.post('/contacts', input);
        return data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_CONTACTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contactId, input }: { contactId: string; input: UpdateContactInput }) => {
      try {
        const { data } = await apiClient.patch(`/contacts/${contactId}`, input);
        return data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_CONTACTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactId: string) => {
      try {
        await apiClient.delete(`/contacts/${contactId}`);
      } catch (error) {
        throw handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_CONTACTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

export function useDeleteContactsBulk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      try {
        const results = await Promise.all(
          ids.map(async (id) => {
            await apiClient.delete(`/contacts/${id}`);
            return id;
          })
        );
        return {
          success: true,
          deletedCount: results.length,
          message: `Successfully deleted ${results.length} contacts`,
        } as BulkDeleteResponse;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_CONTACTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}
