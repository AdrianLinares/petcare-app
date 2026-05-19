import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentAPI } from '@/lib/api';
import { toast } from 'sonner';
import type { Appointment } from '@/types';

/** Query key factory for appointment-related queries */
export const appointmentKeys = {
  all: ['appointments'] as const,
};

/** Fetch all appointments */
export function useAppointments() {
  return useQuery({
    queryKey: appointmentKeys.all,
    queryFn: () => appointmentAPI.getAppointments(),
  });
}

/** Fetch a single appointment by ID (derives from the full list) */
export function useAppointment(id: string | undefined) {
  return useQuery({
    queryKey: appointmentKeys.all,
    queryFn: () => appointmentAPI.getAppointments(),
    select: (appointments: Appointment[]) =>
      appointments.find(a => a.id === id),
    enabled: !!id,
  });
}

/** Create a new appointment */
export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof appointmentAPI.createAppointment>[0]) =>
      appointmentAPI.createAppointment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      toast.success('Appointment created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to create appointment');
    },
  });
}

/** Update an appointment (optimistic when cancelling) */
export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof appointmentAPI.updateAppointment>[1] }) =>
      appointmentAPI.updateAppointment(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: appointmentKeys.all });

      const previous = queryClient.getQueriesData<Appointment[]>({ queryKey: appointmentKeys.all });

      // Optimistically update only when cancelling
      if (data.status === 'cancelled') {
        queryClient.setQueriesData<Appointment[]>({ queryKey: appointmentKeys.all }, (old) => {
          if (!old) return old;
          return old.map((apt) =>
            apt.id === id ? { ...apt, status: 'cancelled' as const } : apt
          );
        });
      }

      return { previous };
    },
    onError: (_err, { data }, context) => {
      if (context?.previous) {
        for (const [key, val] of context.previous) {
          queryClient.setQueryData(key, val);
        }
      }
      toast.error('Failed to update appointment');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
    },
  });
}