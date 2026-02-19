import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type {
  ApiUserResponse,
  ApiUserStats,
  ApiUserActivity,
  ApiUserComment,
  ApiProjectListItem,
} from '@/types/api';
import { transformUser } from '@/lib/transforms';
import type { Project } from '@/types';
import { useAuth } from '@/lib/auth';

/**
 * GET /api/users/:id
 * Returns full user profile.
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiUserResponse>(`/users/${id}`);
      return transformUser(data.user, {
        email: data.user.email,
        createdAt: data.user.createdAt,
      });
    },
    enabled: !!id,
  });
}

/**
 * GET /api/users/:id/stats
 * Returns: projectsFollowed, totalApprovals, totalComments
 */
export function useUserStats(id: string) {
  return useQuery({
    queryKey: ['user', id, 'stats'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: ApiUserStats }>(
        `/users/${id}/stats`
      );
      return data.data;
    },
    enabled: !!id,
  });
}

/**
 * GET /api/users/:id/liked-projects
 * Returns projects the user has approved (LIKE reactions).
 */
export function useUserLikedProjects(id: string) {
  return useQuery({
    queryKey: ['user', id, 'liked-projects'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: (ApiProjectListItem & { media: { type: string, url: string }[] })[] }>(
        `/users/${id}/liked-projects`
      );
      // The liked-projects response has a slightly different shape
      // with media[], barangays[], _count, approveCount, disapproveCount
      return data.data.map((project): Project => ({
        id: project.id,
        title: project.title,
        description: project.description || '',
        images: (project.media || [])
          .filter((m) => m.type === 'IMAGE')
          .map((m) => m.url),
        status: (project.status as string)?.toLowerCase().replace('_', '-') as Project['status'] || 'planned',
        progress: 0,
        category: project.category || 'Uncategorized',
        location: (project.barangays || []).map((b) => b.barangay?.name).join(', ') || 'Citywide',
        budget: '',
        timeline: '',
        approveCount: project.approveCount || 0,
        disapproveCount: project.disapproveCount || 0,
        comments: project._count?.comments || 0,
        createdAt: project.createdAt,
        updates: [],
      }));
    },
    enabled: !!id,
  });
}

/**
 * GET /api/users/:id/comments
 * Returns comments made by the user (with project context).
 */
export function useUserComments(id: string) {
  return useQuery({
    queryKey: ['user', id, 'comments'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: ApiUserComment[] }>(
        `/users/${id}/comments`
      );
      return data.data;
    },
    enabled: !!id,
  });
}

/**
 * GET /api/users/:id/activity
 * Returns recent activity (approved, disapproved, commented).
 */
export function useUserActivity(id: string) {
  return useQuery({
    queryKey: ['user', id, 'activity'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ success: boolean; data: ApiUserActivity[] }>(
        `/users/${id}/activity`
      );
      return data.data;
    },
    enabled: !!id,
  });
}

/**
 * PATCH /api/users/:id
 * Update user profile (name, email, avatar).
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: { name?: string; email?: string; avatar?: string | null };
    }) => {
      const { data } = await apiClient.patch<ApiUserResponse>(`/users/${id}`, updates);
      return data.user;
    },
    onSuccess: (updatedUser) => {
      // Update the user in auth context
      setUser({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        barangayId: updatedUser.barangayId,
        emailVerified: updatedUser.emailVerified,
        avatar: updatedUser.avatar ?? '',
        contributions: (updatedUser as unknown as { contributions?: number }).contributions ?? 0,
        joinedAt: (updatedUser as unknown as { joinedAt?: string }).joinedAt ?? updatedUser.createdAt ?? new Date().toISOString(),
      });

      // Invalidate user-related queries
      queryClient.invalidateQueries({ queryKey: ['user', updatedUser.id] });
    },
  });
}
