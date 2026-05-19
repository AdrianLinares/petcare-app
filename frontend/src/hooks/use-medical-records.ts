import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { medicalRecordAPI } from '@/lib/api';
import { toast } from 'sonner';

/** Query key factory for medical record queries */
export const medicalRecordKeys = {
  all: ['medical-records'] as const,
  byPet: (petId: string) => ['medical-records', petId] as const,
  detail: (id: string) => ['medical-records', id] as const,
};

/** Fetch medical records for a specific pet */
export function useMedicalRecords(petId: string) {
  return useQuery({
    queryKey: medicalRecordKeys.byPet(petId),
    queryFn: () => medicalRecordAPI.getByPet(petId),
    enabled: !!petId,
  });
}

/** Fetch a single medical record by ID */
export function useMedicalRecord(id: string | undefined) {
  return useQuery({
    queryKey: medicalRecordKeys.detail(id!),
    queryFn: () => medicalRecordAPI.getById(id!),
    enabled: !!id,
  });
}

/** Create a new medical record */
export function useCreateMedicalRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof medicalRecordAPI.create>[0]) =>
      medicalRecordAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicalRecordKeys.all });
      toast.success('Medical record created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create medical record');
    },
  });
}

/** Update an existing medical record */
export function useUpdateMedicalRecord(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { date?: string; recordType?: string; description?: string }) =>
      medicalRecordAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicalRecordKeys.all });
      queryClient.invalidateQueries({ queryKey: medicalRecordKeys.detail(id) });
      toast.success('Medical record updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update medical record');
    },
  });
}

/** Delete a medical record */
export function useDeleteMedicalRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => medicalRecordAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: medicalRecordKeys.all });
      toast.success('Medical record deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete medical record');
    },
  });
}