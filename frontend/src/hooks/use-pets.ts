import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { petAPI } from '@/lib/api';
import { toast } from 'sonner';
import type { Pet } from '@/types';

/** Query key factory for pet-related queries */
export const petKeys = {
  all: ['pets'] as const,
  detail: (id: string) => ['pets', id] as const,
};

/** Fetch all pets */
export function usePets() {
  return useQuery({
    queryKey: petKeys.all,
    queryFn: () => petAPI.getPets(),
  });
}

/** Fetch a single pet by ID */
export function usePet(id: string | undefined) {
  return useQuery({
    queryKey: petKeys.detail(id!),
    queryFn: () => petAPI.getPetById(id!),
    enabled: !!id,
  });
}

/** Create a new pet */
export function useCreatePet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof petAPI.createPet>[0]) =>
      petAPI.createPet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: petKeys.all });
      toast.success('Pet created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create pet');
    },
  });
}

/** Update an existing pet */
export function useUpdatePet(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Pet>) =>
      petAPI.updatePet(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: petKeys.all });
      queryClient.invalidateQueries({ queryKey: petKeys.detail(id) });
      toast.success('Pet updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update pet');
    },
  });
}

/** Delete a pet */
export function useDeletePet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => petAPI.deletePet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: petKeys.all });
      toast.success('Pet deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete pet');
    },
  });
}