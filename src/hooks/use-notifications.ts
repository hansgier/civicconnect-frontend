import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type {
  ApiNotificationListResponse,
  ApiUnreadCountResponse,
} from '@/types/api';
import { transformNotification } from '@/lib/transforms';

/**
 * GET /api/notifications
 * Fetches paginated notifications for the authenticated user.
 */
export function useNotifications(params?: {
  type?: string;
  read?: boolean;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const query: Record<string, string | number> = {
        page: params?.page || 1,
        limit: params?.limit || 20,
      };

      if (params?.type) query.type = params.type.toUpperCase();
      if (params?.read !== undefined) query.read = String(params.read);

      const { data } = await apiClient.get<ApiNotificationListResponse>(
        '/notifications',
        { params: query }
      );

      return {
        notifications: data.data.map(transformNotification),
        meta: data.meta,
      };
    },
    refetchInterval: 30 * 1000, // Poll every 30 seconds for new notifications
  });
}

/**
 * GET /api/notifications/unread-count
 * Returns the number of unread notifications.
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiUnreadCountResponse>(
        '/notifications/unread-count'
      );
      return data.data.count;
    },
    refetchInterval: 30 * 1000, // Poll every 30 seconds
  });
}

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read.
 */
export function useMarkRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      await apiClient.patch(`/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read.
 */
export function useMarkAllRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.patch('/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

/**
 * DELETE /api/notifications/:id
 * Delete a notification.
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      await apiClient.delete(`/notifications/${notificationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
