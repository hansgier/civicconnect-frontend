import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ApiReactionsResponse, ApiReaction } from '@/types/api';
import { useAuth } from '@/lib/auth';

/**
 * Fetch reaction counts and current user's reaction for a project.
 */
export function useReactions(projectId: string) {
  return useQuery({
    queryKey: ['reactions', projectId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiReactionsResponse>(
        `/projects/${projectId}/reactions`
      );
      return data;
    },
    enabled: !!projectId,
    // Enable refetch on window focus for real-time updates
    refetchOnWindowFocus: true,
    // Keep data fresh to reflect recent changes
    staleTime: 0,
  });
}

/**
 * Smart toggle: handles create, update, and delete in one hook.
 *
 * Logic:
 * - No existing reaction → CREATE with the chosen type
 * - Existing reaction with SAME type → DELETE (un-vote)
 * - Existing reaction with DIFFERENT type → UPDATE (switch vote)
 */
export function useToggleReaction(projectId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (type: 'LIKE' | 'DISLIKE') => {
      // Get current reactions to check user's existing vote
      const currentData = queryClient.getQueryData<ApiReactionsResponse>([
        'reactions',
        projectId,
      ]);

      const existingReaction = currentData?.userReactions.find(
        (r) => r.userId === user?.id
      );

      if (!existingReaction) {
        // CREATE new reaction
        return apiClient.post<ApiReaction>(`/projects/${projectId}/reactions`, { type });
      }

      if (existingReaction.type === type) {
        // DELETE (un-vote — same button pressed again)
        return apiClient.delete(
          `/projects/${projectId}/reactions/${existingReaction.reactionId}`
        );
      }

      // UPDATE (switch from LIKE to DISLIKE or vice versa)
      return apiClient.patch(
        `/projects/${projectId}/reactions/${existingReaction.reactionId}`,
        { type }
      );
    },
    onSuccess: () => {
      // Invalidate reactions to refetch fresh counts
      queryClient.invalidateQueries({ queryKey: ['reactions', projectId] });
      // Also invalidate project detail (it includes approveCount/disapproveCount)
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      // Invalidate public projects list to update counts in the feed
      // Use refetchType: 'all' to refetch all pages in infinite query
      queryClient.invalidateQueries({ 
        queryKey: ['projects'],
        refetchType: 'all'
      });
      // Invalidate dashboard stats since they track engagement scores
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useToggleCommentReaction(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, type }: { commentId: string; type: 'LIKE' }) => {
      return apiClient.post(`/projects/${projectId}/reactions/toggle`, { type, commentId });
    },
    onSuccess: () => {
      // Invalidate comments query to refresh like counts and userHasLiked status
      queryClient.invalidateQueries({ queryKey: ['comments', projectId] });
      // Invalidate dashboard stats since they track engagement scores
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
