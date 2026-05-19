import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clinicalRecordAPI } from '@/lib/api';
import { toast } from 'sonner';

/** Query key factory for clinical record queries */
export const clinicalRecordKeys = {
  all: ['clinical-records'] as const,
  byPet: (petId: string) => ['clinical-records', petId] as const,
  detail: (id: string) => ['clinical-records', id] as const,
};

/** Fetch clinical records for a specific pet */
export function useClinicalRecords(petId: string) {
  return useQuery({
    queryKey: clinicalRecordKeys.byPet(petId),
    queryFn: () => clinicalRecordAPI.getByPet(petId),
    enabled: !!petId,
  });
}

/** Fetch a single clinical record by ID */
export function useClinicalRecord(id: string | undefined) {
  return useQuery({
    queryKey: clinicalRecordKeys.detail(id!),
    queryFn: () => clinicalRecordAPI.getById(id!),
    enabled: !!id,
  });
}

/** Create a new clinical record */
export function useCreateClinicalRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof clinicalRecordAPI.create>[0]) =>
      clinicalRecordAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicalRecordKeys.all });
      toast.success('Clinical record created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create clinical record');
    },
  });
}

/** Update an existing clinical record */
export function useUpdateClinicalRecord(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof clinicalRecordAPI.update>[1]) =>
      clinicalRecordAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicalRecordKeys.all });
      queryClient.invalidateQueries({ queryKey: clinicalRecordKeys.detail(id) });
      toast.success('Clinical record updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update clinical record');
    },
  });
}

/** Delete a clinical record */
export function useDeleteClinicalRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clinicalRecordAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clinicalRecordKeys.all });
      toast.success('Clinical record deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete clinical record');
    },
  });
}