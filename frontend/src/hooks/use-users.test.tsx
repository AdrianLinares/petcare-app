import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from './use-users';
import { userAPI } from '@/lib/api';
import { toast } from 'sonner';

// Mock the API module
vi.mock('@/lib/api', () => ({
  userAPI: {
    listUsers: vi.fn(),
    getUserById: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    getCurrentUser: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
  },
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Create a fresh QueryClient for each test to avoid shared state
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

const mockUsers = {
  users: [
    {
      id: '1',
      email: 'admin@petcare.com',
      fullName: 'Admin User',
      phone: '+1-555-0100',
      userType: 'administrator' as const,
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      email: 'owner@petcare.com',
      fullName: 'Pet Owner',
      phone: '+1-555-0101',
      userType: 'pet_owner' as const,
      createdAt: '2024-01-02T00:00:00Z',
    },
  ],
};

describe('use-users hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // useUsers — list all users
  // ==========================================
  describe('useUsers', () => {
    it('fetches and returns users list', async () => {
      vi.mocked(userAPI.listUsers).mockResolvedValue(mockUsers);

      const { result } = renderHook(() => useUsers(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockUsers);
      expect(userAPI.listUsers).toHaveBeenCalledOnce();
    });

    it('returns error when API fails', async () => {
      vi.mocked(userAPI.listUsers).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useUsers(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Network error');
    });

    it('shows loading state initially', () => {
      vi.mocked(userAPI.listUsers).mockReturnValue(new Promise(() => {})); // never resolves

      const { result } = renderHook(() => useUsers(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });
  });

  // ==========================================
  // useUser — get single user by ID
  // ==========================================
  describe('useUser', () => {
    it('fetches a single user by ID', async () => {
      vi.mocked(userAPI.getUserById).mockResolvedValue(mockUsers.users[0]);

      const { result } = renderHook(() => useUser('1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockUsers.users[0]);
      expect(userAPI.getUserById).toHaveBeenCalledWith('1');
    });

    it('does not fetch when ID is empty (enabled: false)', () => {
      vi.mocked(userAPI.getUserById).mockResolvedValue(mockUsers.users[0]);

      const { result } = renderHook(() => useUser(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(userAPI.getUserById).not.toHaveBeenCalled();
    });

    it('does not fetch when ID is undefined', () => {
      vi.mocked(userAPI.getUserById).mockResolvedValue(mockUsers.users[0]);

      const { result } = renderHook(() => useUser(undefined as string | undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(userAPI.getUserById).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // useCreateUser — create user mutation
  // ==========================================
  describe('useCreateUser', () => {
    it('calls userAPI.createUser and invalidates users query on success', async () => {
      const newUser = { ...mockUsers.users[0], id: '3' };
      vi.mocked(userAPI.createUser).mockResolvedValue(newUser);

      const { result } = renderHook(() => useCreateUser(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        email: 'new@test.com',
        password: 'pass',
        fullName: 'New User',
        phone: '+1-555-0102',
        userType: 'pet_owner',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(userAPI.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'new@test.com' })
      );
      expect(toast.success).toHaveBeenCalledWith('User created successfully');
    });

    it('shows error toast on failure', async () => {
      vi.mocked(userAPI.createUser).mockRejectedValue({
        response: { data: { error: 'Email already exists' } },
      });

      const { result } = renderHook(() => useCreateUser(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        email: 'dup@test.com',
        password: 'pass',
        fullName: 'Dup User',
        phone: '+1-555-0103',
        userType: 'pet_owner',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Email already exists');
    });

    it('shows fallback error message when response has no error data', async () => {
      vi.mocked(userAPI.createUser).mockRejectedValue(new Error('Unknown'));

      const { result } = renderHook(() => useCreateUser(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        email: 'x@test.com',
        password: 'pass',
        fullName: 'X',
        phone: '+1-555-0104',
        userType: 'pet_owner',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Failed to create user');
    });
  });

  // ==========================================
  // useUpdateUser — update user mutation
  // ==========================================
  describe('useUpdateUser', () => {
    it('calls userAPI.updateUser and invalidates queries on success', async () => {
      const updatedUser = { ...mockUsers.users[0], fullName: 'Updated' };
      vi.mocked(userAPI.updateUser).mockResolvedValue(updatedUser);

      const { result } = renderHook(() => useUpdateUser('1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ fullName: 'Updated' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(userAPI.updateUser).toHaveBeenCalledWith('1', { fullName: 'Updated' });
      expect(toast.success).toHaveBeenCalledWith('User updated successfully');
    });

    it('shows error toast on failure', async () => {
      vi.mocked(userAPI.updateUser).mockRejectedValue({
        response: { data: { error: 'User not found' } },
      });

      const { result } = renderHook(() => useUpdateUser('nonexistent'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ fullName: 'Updated' });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('User not found');
    });

    it('shows fallback error message when no response data', async () => {
      vi.mocked(userAPI.updateUser).mockRejectedValue(new Error('Network'));

      const { result } = renderHook(() => useUpdateUser('1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ fullName: 'X' });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Failed to update user');
    });
  });

  // ==========================================
  // useDeleteUser — delete user mutation
  // ==========================================
  describe('useDeleteUser', () => {
    it('calls userAPI.deleteUser and invalidates users query on success', async () => {
      vi.mocked(userAPI.deleteUser).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteUser(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(userAPI.deleteUser).toHaveBeenCalledWith('1');
      expect(toast.success).toHaveBeenCalledWith('User deleted successfully');
    });

    it('shows error toast on failure', async () => {
      vi.mocked(userAPI.deleteUser).mockRejectedValue({
        response: { data: { error: 'Cannot delete admin' } },
      });

      const { result } = renderHook(() => useDeleteUser(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('1');

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Cannot delete admin');
    });

    it('shows fallback error message when no response data', async () => {
      vi.mocked(userAPI.deleteUser).mockRejectedValue(new Error('Server error'));

      const { result } = renderHook(() => useDeleteUser(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('1');

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Failed to delete user');
    });
  });
});