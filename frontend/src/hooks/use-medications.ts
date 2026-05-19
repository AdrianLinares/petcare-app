import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicationAPI } from '@/lib/api';
import { toast } from 'sonner';

/** Query key factory for medication-related queries */
export const medicationKeys = {
  all: ['medications'] as const,
  byPet: (petId: string) => ['medications', petId] as const,
  active: ['medications', 'active'] as const,
  detail: (id: string) => ['medications', id] as const,
};

/** Fetch medications for a specific pet */
export function useMedications(petId: string) {
  return useQuery({
    queryKey: medicationKeys.byPet(petId),
    queryFn: () => medicationAPI.getByPet(petId),
    enabled: !!petId,
  });
}

/** Fetch only active medications */
export function useActiveMedications() {
  return useQuery({
    queryKey: medicationKeys.active,
    queryFn: () => medicationAPI.getActive(),
  });
}

/** Fetch a single medication by ID */
export function useMedication(id: string | undefined) {
  return useQuery({
    queryKey: medicationKeys.detail(id!),
    queryFn: () => medicationAPI.getById(id!),
    enabled: !!id,
  });
}

/** Create a new medication record */
export function useCreateMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof medicationAPI.create>[0]) =>
      medicationAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicationKeys.all });
      toast.success('Medication created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create medication');
    },
  });
}

/** Update an existing medication record */
export function useUpdateMedication(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name?: string; dosage?: string; startDate?: string; endDate?: string; active?: boolean }) =>
      medicationAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicationKeys.all });
      queryClient.invalidateQueries({ queryKey: medicationKeys.detail(id) });
      toast.success('Medication updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update medication');
    },
  });
}

/** Deactivate a medication (PATCH active=false) */
export function useDeactivateMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => medicationAPI.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicationKeys.all });
      toast.success('Medication deactivated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to deactivate medication');
    },
  });
}

/** Delete a medication record */
export function useDeleteMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => medicationAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicationKeys.all });
      toast.success('Medication deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete medication');
    },
  });
}