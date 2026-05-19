import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  notificationKeys,
} from './use-notifications';
import { notificationAPI } from '@/lib/api';
import { toast } from 'sonner';

vi.mock('@/lib/api', () => ({
  notificationAPI: {
    getNotifications: vi.fn(),
    getUnreadCount: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    deleteNotification: vi.fn(),
    createNotification: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

const mockNotifications = [
  {
    id: 'notif-1',
    userId: 'user-1',
    type: 'appointment_reminder',
    title: 'Upcoming Appointment',
    message: 'You have an appointment tomorrow',
    read: false,
    priority: 'high',
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    type: 'system',
    title: 'Welcome',
    message: 'Welcome to PetCare',
    read: true,
    priority: 'normal',
    createdAt: '2025-01-14T08:00:00Z',
  },
];

describe('use-notifications hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // notificationKeys — query key factory
  // ==========================================
  describe('notificationKeys', () => {
    it('has all and unreadCount keys', () => {
      expect(notificationKeys.all).toEqual(['notifications']);
      expect(notificationKeys.unreadCount).toEqual(['unread-count']);
    });
  });

  // ==========================================
  // useNotifications — list all notifications
  // ==========================================
  describe('useNotifications', () => {
    it('fetches and returns notifications list', async () => {
      vi.mocked(notificationAPI.getNotifications).mockResolvedValue(mockNotifications);

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockNotifications);
      expect(notificationAPI.getNotifications).toHaveBeenCalledWith(false);
    });

    it('returns error when API fails', async () => {
      vi.mocked(notificationAPI.getNotifications).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Network error');
    });

    it('shows loading state initially', () => {
      vi.mocked(notificationAPI.getNotifications).mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });
  });

  // ==========================================
  // useUnreadCount — get unread notification count
  // ==========================================
  describe('useUnreadCount', () => {
    it('fetches and returns unread count', async () => {
      vi.mocked(notificationAPI.getUnreadCount).mockResolvedValue(5);

      const { result } = renderHook(() => useUnreadCount(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toBe(5);
      expect(notificationAPI.getUnreadCount).toHaveBeenCalledOnce();
    });

    it('returns error when API fails', async () => {
      vi.mocked(notificationAPI.getUnreadCount).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useUnreadCount(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Network error');
    });

    it('shows loading state initially', () => {
      vi.mocked(notificationAPI.getUnreadCount).mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useUnreadCount(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });
  });

  // ==========================================
  // useMarkAsRead — mark single notification read
  // ==========================================
  describe('useMarkAsRead', () => {
    it('calls API and invalidates queries on success', async () => {
      vi.mocked(notificationAPI.markAsRead).mockResolvedValue(undefined);

      const { result } = renderHook(() => useMarkAsRead(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('notif-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(notificationAPI.markAsRead).toHaveBeenCalledWith('notif-1');
    });

    it('shows error toast on failure', async () => {
      vi.mocked(notificationAPI.markAsRead).mockRejectedValue({
        response: { data: { error: 'Not found' } },
      });

      const { result } = renderHook(() => useMarkAsRead(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('notif-1');

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Failed to mark as read');
    });

    it('shows fallback error message when no response data', async () => {
      vi.mocked(notificationAPI.markAsRead).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useMarkAsRead(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('notif-1');

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Failed to mark as read');
    });
  });

  // ==========================================
  // useMarkAllAsRead — mark all notifications read
  // ==========================================
  describe('useMarkAllAsRead', () => {
    it('calls API and invalidates queries on success', async () => {
      vi.mocked(notificationAPI.markAllAsRead).mockResolvedValue(undefined);

      const { result } = renderHook(() => useMarkAllAsRead(), {
        wrapper: createWrapper(),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(notificationAPI.markAllAsRead).toHaveBeenCalledOnce();
    });

    it('shows error toast on failure', async () => {
      vi.mocked(notificationAPI.markAllAsRead).mockRejectedValue({
        response: { data: { error: 'Server error' } },
      });

      const { result } = renderHook(() => useMarkAllAsRead(), {
        wrapper: createWrapper(),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Server error');
    });

    it('shows fallback error message when no response data', async () => {
      vi.mocked(notificationAPI.markAllAsRead).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useMarkAllAsRead(), {
        wrapper: createWrapper(),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Failed to mark all notifications as read');
    });
  });

  // ==========================================
  // useDeleteNotification — delete a notification
  // ==========================================
  describe('useDeleteNotification', () => {
    it('calls API and invalidates queries on success', async () => {
      vi.mocked(notificationAPI.deleteNotification).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteNotification(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('notif-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(notificationAPI.deleteNotification).toHaveBeenCalledWith('notif-1');
    });

    it('shows error toast on failure', async () => {
      vi.mocked(notificationAPI.deleteNotification).mockRejectedValue({
        response: { data: { error: 'Cannot delete' } },
      });

      const { result } = renderHook(() => useDeleteNotification(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('notif-1');

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Failed to delete notification');
    });

    it('shows fallback error message when no response data', async () => {
      vi.mocked(notificationAPI.deleteNotification).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useDeleteNotification(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('notif-1');

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Failed to delete notification');
    });
  });
});