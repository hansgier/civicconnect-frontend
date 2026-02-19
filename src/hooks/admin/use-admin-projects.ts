import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type {
  ApiProjectListItem,
  ApiProjectDetail,
  ApiProjectListResponse,
  ApiProjectDetailResponse,
} from '@/types/api';

/**
 * Helper to normalize project data for the backend API.
 * Converts date strings to full ISO strings, parses cost to a number,
 * and converts empty optional strings to null to ensure they are cleared in the database.
 */
function prepareProjectData<T extends CreateProjectInput | UpdateProjectInput>(data: T): Record<string, unknown> {
  const result: Record<string, unknown> = { ...data };

  // 1. Handle dates: backend expects full ISO datetime strings
  if (typeof result.startDate === 'string' && result.startDate.length === 10) {
    result.startDate = `${result.startDate}T00:00:00.000Z`;
  }
  if (typeof result.dueDate === 'string' && result.dueDate.length === 10) {
    result.dueDate = `${result.dueDate}T00:00:00.000Z`;
  }

  // 2. Handle cost: backend expects a number
  if (result.cost !== undefined && result.cost !== null) {
    const costNum = typeof result.cost === 'string' ? parseFloat(result.cost) : (result.cost as number);
    result.cost = isNaN(costNum) ? undefined : costNum;
  }

  // 3. Handle optional fields: convert empty strings to undefined so they are ignored/omitted
  if (result.category === '') result.category = undefined;
  if (result.fundingSourceId === '') result.fundingSourceId = undefined;
  if (result.description === '') result.description = ''; // Prisma Text fields usually handle "" fine
  if (result.implementingAgency === '') result.implementingAgency = undefined;
  if (result.contractor === '') result.contractor = undefined;

  return result;
}
import type {
  AdminProjectFilters,
  CreateProjectInput,
  UpdateProjectInput,
  BulkDeleteResponse,
} from './types';
import type { AdminListResponse } from './types';
import { handleApiError, createRetryConfig, ApiError } from './utils';

const ADMIN_PROJECTS_QUERY_KEY = ['admin', 'projects'];

const QUERY_STALE_TIME = 1000 * 60 * 2;
const QUERY_GC_TIME = 1000 * 60 * 5;

// ============================================================
// Queries
// ============================================================

export function useAdminProjectsList(filters: AdminProjectFilters = {}) {
  const { page = 1, limit = 20, search, sortBy, sortOrder, status, category, barangayId, fundingSourceId } = filters;

  return useQuery<AdminListResponse<ApiProjectListItem>, ApiError>({
    queryKey: [...ADMIN_PROJECTS_QUERY_KEY, 'list', filters],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit };
      if (search) params.search = search;
      if (sortBy) params.sortBy = sortBy;
      if (sortOrder) params.sortOrder = sortOrder;
      if (status) params.status = status;
      if (category) params.category = category;
      if (barangayId) params.barangayId = barangayId;
      if (fundingSourceId) params.fundingSourceId = fundingSourceId;

      const { data } = await apiClient.get<ApiProjectListResponse>('/projects', { params });
      return {
        data: data.projects,
        pagination: data.pagination,
      };
    },
    staleTime: QUERY_STALE_TIME,
    gcTime: QUERY_GC_TIME,
    retry: createRetryConfig(),
    refetchOnWindowFocus: false,
  });
}

export function useAdminProject(projectId: string) {
  return useQuery<ApiProjectDetail, ApiError>({
    queryKey: [...ADMIN_PROJECTS_QUERY_KEY, 'detail', projectId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiProjectDetailResponse>(`/projects/${projectId}`);
      return data.project;
    },
    enabled: !!projectId,
    staleTime: 1000 * 60 * 5, // 5 minutes for detail view
  });
}

// ============================================================
// Mutations
// ============================================================

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProjectInput) => {
      try {
        const normalizedData = prepareProjectData(input);
        const { data } = await apiClient.post('/projects', normalizedData);
        return data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PROJECTS_QUERY_KEY });
      queryClient.invalidateQueries({ 
        queryKey: ['projects'],
        refetchType: 'all'
      });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, input }: { projectId: string; input: UpdateProjectInput }) => {
      try {
        const normalizedData = prepareProjectData(input);
        const { data } = await apiClient.patch(`/projects/${projectId}`, normalizedData);
        return data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PROJECTS_QUERY_KEY });
      queryClient.invalidateQueries({ 
        queryKey: [...ADMIN_PROJECTS_QUERY_KEY, 'detail', variables.projectId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['projects'],
        refetchType: 'all'
      });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      try {
        await apiClient.delete(`/projects/${projectId}`);
      } catch (error) {
        throw handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PROJECTS_QUERY_KEY });
      queryClient.invalidateQueries({ 
        queryKey: ['projects'],
        refetchType: 'all'
      });
    },
  });
}

// ============================================================
// Media Mutations
// ============================================================

export function useUpdateProjectMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      projectId, 
      files, 
      deleteMediaIds 
    }: { 
      projectId: string; 
      files: File[]; 
      deleteMediaIds: string[] 
    }) => {
      try {
        const formData = new FormData();
        files.forEach((file) => formData.append('images', file));
        
        // Use standard array key format or JSON stringify for broad compatibility
        if (deleteMediaIds.length > 0) {
          formData.append('deleteMediaIds', JSON.stringify(deleteMediaIds));
        }

        const { data } = await apiClient.patch(`/projects/${projectId}/media`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate everything related to projects to ensure absolute consistency
      queryClient.invalidateQueries({ queryKey: ADMIN_PROJECTS_QUERY_KEY });
      queryClient.invalidateQueries({ 
        queryKey: [...ADMIN_PROJECTS_QUERY_KEY, 'detail', variables.projectId] 
      });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteProjectsBulk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ids: string[]) => {
      try {
        const results = await Promise.all(
          ids.map(async (id) => {
            await apiClient.delete(`/projects/${id}`);
            return id;
          })
        );
        return {
          success: true,
          deletedCount: results.length,
          message: `Successfully deleted ${results.length} projects`,
        } as BulkDeleteResponse;
      } catch (error) {
        throw handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_PROJECTS_QUERY_KEY });
      queryClient.invalidateQueries({ 
        queryKey: ['projects'],
        refetchType: 'all'
      });
    },
  });
}
