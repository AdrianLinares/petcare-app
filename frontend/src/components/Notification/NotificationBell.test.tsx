import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotificationBell from '@/components/Notification/NotificationBell';
import { __TESTING__ } from 'react-i18next';

// Polyfill ResizeObserver for Radix UI components (ScrollArea, DropdownMenu)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock React Query hooks
const mockUseNotifications = vi.fn();
const mockUseUnreadCount = vi.fn();
const mockMarkAsReadMutate = vi.fn();
const mockMarkAllAsReadMutate = vi.fn();
const mockDeleteMutate = vi.fn();

vi.mock('@/hooks/use-notifications', () => ({
  useNotifications: () => mockUseNotifications(),
  useUnreadCount: () => mockUseUnreadCount(),
  useMarkAsRead: () => ({
    mutate: mockMarkAsReadMutate,
    isLoading: false,
  }),
  useMarkAllAsRead: () => ({
    mutate: mockMarkAllAsReadMutate,
    isLoading: false,
  }),
  useDeleteNotification: () => ({
    mutate: mockDeleteMutate,
    isLoading: false,
  }),
}));

// Mock Pusher hook
vi.mock('@/hooks/use-pusher', () => ({
  usePusher: () => ({
    onNotificationReceived: vi.fn().mockReturnValue(vi.fn()),
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const mockNotifications = [
  {
    id: 'notif-1',
    userId: 'user-1',
    type: 'appointment_reminder' as const,
    title: 'Upcoming Appointment',
    message: 'You have an appointment tomorrow',
    read: false,
    priority: 'high' as const,
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    type: 'system_alert' as const,
    title: 'System Update',
    message: 'New features available',
    read: true,
    priority: 'normal' as const,
    createdAt: '2025-01-14T08:00:00Z',
  },
];

function setupMocks(overrides: Record<string, any> = {}) {
  mockUseNotifications.mockReturnValue({
    data: mockNotifications,
    isLoading: false,
    isError: false,
    ...overrides.useNotifications,
  });
  mockUseUnreadCount.mockReturnValue({
    data: 1,
    isLoading: false,
    ...overrides.useUnreadCount,
  });
}

describe('NotificationBell — React Query migration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __TESTING__.setLanguage('en');
    setupMocks();
  });

  it('renders bell button with unread count badge', () => {
    render(<NotificationBell userId="user-1" />);

    const bellButton = screen.getByRole('button');
    expect(bellButton).toBeInTheDocument();

    // Unread count of 1 should display "1" in the badge
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('does not show badge when unread count is 0', () => {
    mockUseUnreadCount.mockReturnValue({
      data: 0,
      isLoading: false,
    });

    render(<NotificationBell userId="user-1" />);

    // Badge should not be visible when count is 0
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('shows loading state when notifications are loading', async () => {
    setupMocks({
      useNotifications: { data: undefined, isLoading: true },
      useUnreadCount: { data: 0, isLoading: true },
    });

    render(<NotificationBell userId="user-1" />);

    const bellButton = screen.getByRole('button');
    await userEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('[en] notification.loading')).toBeInTheDocument();
    });
  });

  it('shows empty state when no notifications', async () => {
    setupMocks({
      useNotifications: { data: [], isLoading: false },
    });
    mockUseUnreadCount.mockReturnValue({ data: 0, isLoading: false });

    render(<NotificationBell userId="user-1" />);

    const bellButton = screen.getByRole('button');
    await userEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('[en] notification.empty')).toBeInTheDocument();
    });
  });

  it('calls markAsRead mutation when clicking check button', async () => {
    render(<NotificationBell userId="user-1" />);

    const bellButton = screen.getByRole('button');
    await userEvent.click(bellButton);

    // Wait for notifications to render, then find the "Mark as read" button (first unread notification)
    const markReadButtons = await screen.findAllByRole('button', { name: /mark as read/i });
    await userEvent.click(markReadButtons[0]);

    expect(mockMarkAsReadMutate).toHaveBeenCalledWith('notif-1');
  });

  it('calls markAllAsRead mutation when clicking "Mark all read" button', async () => {
    // unreadCount > 0 so "Mark all read" appears
    render(<NotificationBell userId="user-1" />);

    const bellButton = screen.getByRole('button');
    await userEvent.click(bellButton);

    const markAllButton = await screen.findByText('[en] notification.markAllRead');
    await userEvent.click(markAllButton);

    expect(mockMarkAllAsReadMutate).toHaveBeenCalledOnce();
  });

  it('calls deleteNotification mutation when clicking delete button', async () => {
    render(<NotificationBell userId="user-1" />);

    const bellButton = screen.getByRole('button');
    await userEvent.click(bellButton);

    // Wait for notifications to render, then find delete buttons
    const deleteButtons = await screen.findAllByRole('button', { name: /delete/i });
    await userEvent.click(deleteButtons[0]);

    expect(mockDeleteMutate).toHaveBeenCalledWith('notif-1');
  });

  it('displays notification titles from hook data', async () => {
    render(<NotificationBell userId="user-1" />);

    const bellButton = screen.getByRole('button');
    await userEvent.click(bellButton);

    await waitFor(() => {
      expect(screen.getByText('Upcoming Appointment')).toBeInTheDocument();
      expect(screen.getByText('System Update')).toBeInTheDocument();
    });
  });
});