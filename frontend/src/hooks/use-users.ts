import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '@/lib/api';
import { toast } from 'sonner';
import type { User } from '@/types';

/** Query key factory for user-related queries */
export const userKeys = {
  all: ['users'] as const,
  detail: (id: string) => ['users', id] as const,
};

/** Fetch all users (admin) */
export function useUsers() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: () => userAPI.listUsers(),
  });
}

/** Fetch a single user by ID */
export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: userKeys.detail(id!),
    queryFn: () => userAPI.getUserById(id!),
    enabled: !!id,
  });
}

/** Create a new user (admin) */
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof userAPI.createUser>[0]) =>
      userAPI.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success('User created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create user');
    },
  });
}

/** Update an existing user (admin) */
export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof userAPI.updateUser>[1]) =>
      userAPI.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      toast.success('User updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update user');
    },
  });
}

/** Delete a user (admin) */
export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userAPI.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete user');
    },
  });
}