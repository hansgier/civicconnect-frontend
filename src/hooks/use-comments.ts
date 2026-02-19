import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ApiCommentListResponse, ApiCommentCreateResponse } from '@/types/api';
import { transformComment } from '@/lib/transforms';

/**
 * Fetch all comments for a project (with nested replies).
 */
export function useComments(projectId: string) {
  return useQuery({
    queryKey: ['comments', projectId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiCommentListResponse>(
        `/projects/${projectId}/comments`
      );
      return data.comments.map(transformComment);
    },
    enabled: !!projectId,
    // Enable refetch on window focus for real-time updates
    refetchOnWindowFocus: true,
    // Keep data fresh to reflect recent changes
    staleTime: 0,
  });
}

/**
 * Create a new comment or reply.
 */
export function useCreateComment(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { content: string; parentId?: string }) => {
      const { data } = await apiClient.post<ApiCommentCreateResponse>(
        `/projects/${projectId}/comments`,
        input
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ 
        queryKey: ['projects'],
        refetchType: 'all'
      });
    },
  });
}

/**
 * Delete a comment.
 */
export function useDeleteComment(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      await apiClient.delete(`/projects/${projectId}/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ 
        queryKey: ['projects'],
        refetchType: 'all'
      });
    },
  });
}
