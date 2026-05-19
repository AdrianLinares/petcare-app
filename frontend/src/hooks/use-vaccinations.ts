import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vaccinationAPI } from '@/lib/api';
import { toast } from 'sonner';

/** Query key factory for vaccination-related queries */
export const vaccinationKeys = {
  all: ['vaccinations'] as const,
  upcoming: ['vaccinations', 'upcoming'] as const,
  byPet: (petId: string) => ['vaccinations', petId] as const,
  detail: (id: string) => ['vaccinations', id] as const,
};

/** Fetch upcoming vaccinations */
export function useUpcomingVaccinations() {
  return useQuery({
    queryKey: vaccinationKeys.upcoming,
    queryFn: () => vaccinationAPI.getUpcoming(),
  });
}

/** Fetch vaccinations for a specific pet */
export function useVaccinations(petId: string) {
  return useQuery({
    queryKey: vaccinationKeys.byPet(petId),
    queryFn: () => vaccinationAPI.getByPet(petId),
    enabled: !!petId,
  });
}

/** Fetch a single vaccination by ID */
export function useVaccination(id: string | undefined) {
  return useQuery({
    queryKey: vaccinationKeys.detail(id!),
    queryFn: () => vaccinationAPI.getById(id!),
    enabled: !!id,
  });
}

/** Create a new vaccination record */
export function useCreateVaccination() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof vaccinationAPI.create>[0]) =>
      vaccinationAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vaccinationKeys.all });
      toast.success('Vaccination created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create vaccination');
    },
  });
}

/** Update an existing vaccination record */
export function useUpdateVaccination(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { vaccine?: string; date?: string; nextDue?: string }) =>
      vaccinationAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vaccinationKeys.all });
      queryClient.invalidateQueries({ queryKey: vaccinationKeys.detail(id) });
      toast.success('Vaccination updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to update vaccination');
    },
  });
}

/** Delete a vaccination record */
export function useDeleteVaccination() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => vaccinationAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vaccinationKeys.all });
      toast.success('Vaccination deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete vaccination');
    },
  });
}