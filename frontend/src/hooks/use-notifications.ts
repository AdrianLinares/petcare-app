import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationAPI } from '@/lib/api';
import { toast } from 'sonner';
import type { Notification } from '@/types';

/** Query key factory for notification-related queries */
export const notificationKeys = {
  all: ['notifications'] as const,
  unreadCount: ['unread-count'] as const,
};

/** Fetch all notifications for the current user */
export function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.all,
    queryFn: () => notificationAPI.getNotifications(false),
  });
}

/** Get count of unread notifications */
export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: () => notificationAPI.getUnreadCount(),
  });
}

/** Mark a single notification as read (optimistic) */
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => notificationAPI.markAsRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      const previous = queryClient.getQueriesData<Notification[]>({ queryKey: notificationKeys.all });

      queryClient.setQueriesData<Notification[]>({ queryKey: notificationKeys.all }, (old) => {
        if (!old) return old;
        return old.map((n) =>
          n.id === id ? { ...n, read: true } : n
        );
      });

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data);
        }
      }
      toast.error('Failed to mark as read');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
    },
  });
}

/** Mark all notifications as read */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationAPI.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to mark all notifications as read');
    },
  });
}

/** Delete a notification (optimistic) */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationAPI.deleteNotification(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      const previous = queryClient.getQueriesData<Notification[]>({ queryKey: notificationKeys.all });

      queryClient.setQueriesData<Notification[]>({ queryKey: notificationKeys.all }, (old) => {
        if (!old) return old;
        return old.filter((n) => n.id !== id);
      });

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        for (const [key, data] of context.previous) {
          queryClient.setQueryData(key, data);
        }
      }
      toast.error('Failed to delete notification');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
    },
  });
}