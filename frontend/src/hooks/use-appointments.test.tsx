import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  useAppointments,
  useAppointment,
  useCreateAppointment,
  useUpdateAppointment,
} from './use-appointments';
import { appointmentAPI } from '@/lib/api';
import { toast } from 'sonner';

vi.mock('@/lib/api', () => ({
  appointmentAPI: {
    getAppointments: vi.fn(),
    createAppointment: vi.fn(),
    updateAppointment: vi.fn(),
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

const mockAppointments = [
  {
    id: 'apt-1',
    petId: 'pet-1',
    petName: 'Buddy',
    ownerId: 'owner-1',
    veterinarian: 'Dr. Smith',
    type: 'checkup',
    date: '2024-01-15',
    time: '10:00',
    status: 'scheduled' as const,
    createdAt: '2024-01-10T00:00:00Z',
  },
];

describe('use-appointments hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAppointments', () => {
    it('fetches and returns appointments', async () => {
      vi.mocked(appointmentAPI.getAppointments).mockResolvedValue(mockAppointments);

      const { result } = renderHook(() => useAppointments(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockAppointments);
      expect(appointmentAPI.getAppointments).toHaveBeenCalledOnce();
    });

    it('returns error when API fails', async () => {
      vi.mocked(appointmentAPI.getAppointments).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAppointments(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Network error');
    });
  });

  // ==========================================
  // useAppointment — get single appointment
  // ==========================================
  describe('useAppointment', () => {
    it('fetches a single appointment by ID', async () => {
      // Note: appointmentAPI doesn't have a getAppointmentById, so we test
      // that the hook is not enabled when ID is empty (no direct API method exists)
      vi.mocked(appointmentAPI.getAppointments).mockResolvedValue(mockAppointments);

      const { result } = renderHook(() => useAppointment('apt-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockAppointments[0]);
      expect(appointmentAPI.getAppointments).toHaveBeenCalled();
    });

    it('does not fetch when ID is undefined', () => {
      vi.mocked(appointmentAPI.getAppointments).mockResolvedValue(mockAppointments);

      const { result } = renderHook(() => useAppointment(undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(appointmentAPI.getAppointments).not.toHaveBeenCalled();
    });

    it('returns undefined when appointment not found in list', async () => {
      vi.mocked(appointmentAPI.getAppointments).mockResolvedValue(mockAppointments);

      const { result } = renderHook(() => useAppointment('nonexistent'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toBeUndefined();
    });
  });

  // ==========================================
  // useCreateAppointment — create appointment mutation
  // ==========================================
  describe('useCreateAppointment', () => {
    it('calls API and invalidates on success', async () => {
      vi.mocked(appointmentAPI.createAppointment).mockResolvedValue(mockAppointments[0]);

      const { result } = renderHook(() => useCreateAppointment(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        petId: 'pet-1',
        veterinarianId: 'vet-1',
        type: 'checkup',
        date: '2024-01-15',
        time: '10:00',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(appointmentAPI.createAppointment).toHaveBeenCalledWith(
        expect.objectContaining({ petId: 'pet-1' })
      );
      expect(toast.success).toHaveBeenCalledWith('Appointment created successfully');
    });

    it('shows error toast on failure', async () => {
      vi.mocked(appointmentAPI.createAppointment).mockRejectedValue({
        response: { data: { error: 'Slot not available' } },
      });

      const { result } = renderHook(() => useCreateAppointment(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        petId: 'pet-1',
        veterinarianId: 'vet-1',
        type: 'checkup',
        date: '2024-01-15',
        time: '10:00',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Slot not available');
    });

    it('shows fallback error message when no response data', async () => {
      vi.mocked(appointmentAPI.createAppointment).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useCreateAppointment(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        petId: 'pet-1',
        veterinarianId: 'vet-1',
        type: 'checkup',
        date: '2024-01-15',
        time: '10:00',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Failed to create appointment');
    });
  });

  describe('useUpdateAppointment', () => {
    it('calls API and invalidates on success', async () => {
      vi.mocked(appointmentAPI.updateAppointment).mockResolvedValue({});

      const { result } = renderHook(() => useUpdateAppointment(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ id: 'apt-1', data: { status: 'completed' } });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(appointmentAPI.updateAppointment).toHaveBeenCalledWith('apt-1', { status: 'completed' });
    });

    it('shows error toast on failure', async () => {
      vi.mocked(appointmentAPI.updateAppointment).mockRejectedValue({
        response: { data: { error: 'Not found' } },
      });

      const { result } = renderHook(() => useUpdateAppointment(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ id: 'apt-1', data: { status: 'cancelled' } });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Failed to update appointment');
    });
  });
});