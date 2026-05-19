import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  useMedications,
  useActiveMedications,
  useMedication,
  useCreateMedication,
  useUpdateMedication,
  useDeactivateMedication,
  useDeleteMedication,
  medicationKeys,
} from './use-medications';
import { medicationAPI } from '@/lib/api';
import { toast } from 'sonner';

vi.mock('@/lib/api', () => ({
  medicationAPI: {
    getByPet: vi.fn(),
    getActive: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deactivate: vi.fn(),
    delete: vi.fn(),
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

const mockMedications = [
  {
    id: 'med-1',
    petId: 'pet-1',
    name: 'Amoxicillin',
    dosage: '250mg twice daily',
    startDate: '2024-01-01',
    endDate: '2024-01-10',
    active: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

describe('use-medications hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // medicationKeys — query key factory
  // ==========================================
  describe('medicationKeys', () => {
    it('has all, byPet, active, and detail keys', () => {
      expect(medicationKeys.all).toEqual(['medications']);
      expect(medicationKeys.byPet('pet-1')).toEqual(['medications', 'pet-1']);
      expect(medicationKeys.active).toEqual(['medications', 'active']);
      expect(medicationKeys.detail('med-1')).toEqual(['medications', 'med-1']);
    });
  });

  // ==========================================
  // useMedications — list medications for a pet
  // ==========================================
  describe('useMedications', () => {
    it('fetches and returns medications for a pet', async () => {
      vi.mocked(medicationAPI.getByPet).mockResolvedValue(mockMedications);

      const { result } = renderHook(() => useMedications('pet-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockMedications);
      expect(medicationAPI.getByPet).toHaveBeenCalledWith('pet-1');
    });

    it('returns error when API fails', async () => {
      vi.mocked(medicationAPI.getByPet).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useMedications('pet-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Network error');
    });

    it('does not fetch when petId is empty', () => {
      vi.mocked(medicationAPI.getByPet).mockResolvedValue([]);

      const { result } = renderHook(() => useMedications(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(medicationAPI.getByPet).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // useActiveMedications — only active medications
  // ==========================================
  describe('useActiveMedications', () => {
    it('fetches and returns active medications', async () => {
      vi.mocked(medicationAPI.getActive).mockResolvedValue(mockMedications);

      const { result } = renderHook(() => useActiveMedications(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockMedications);
      expect(medicationAPI.getActive).toHaveBeenCalledOnce();
    });

    it('returns error when API fails', async () => {
      vi.mocked(medicationAPI.getActive).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useActiveMedications(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Network error');
    });
  });

  // ==========================================
  // useMedication — single medication by ID
  // ==========================================
  describe('useMedication', () => {
    it('fetches a single medication by ID', async () => {
      vi.mocked(medicationAPI.getById).mockResolvedValue(mockMedications[0]);

      const { result } = renderHook(() => useMedication('med-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockMedications[0]);
      expect(medicationAPI.getById).toHaveBeenCalledWith('med-1');
    });

    it('does not fetch when ID is undefined', () => {
      vi.mocked(medicationAPI.getById).mockResolvedValue(mockMedications[0]);

      const { result } = renderHook(() => useMedication(undefined as string | undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(medicationAPI.getById).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // useCreateMedication — create mutation
  // ==========================================
  describe('useCreateMedication', () => {
    it('calls API and invalidates on success', async () => {
      vi.mocked(medicationAPI.create).mockResolvedValue(mockMedications[0]);

      const { result } = renderHook(() => useCreateMedication(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        petId: 'pet-1',
        name: 'Amoxicillin',
        dosage: '250mg twice daily',
        startDate: '2024-01-01',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(medicationAPI.create).toHaveBeenCalledWith(
        expect.objectContaining({ petId: 'pet-1', name: 'Amoxicillin' })
      );
      expect(toast.success).toHaveBeenCalledWith('Medication created successfully');
    });

    it('shows error toast on failure', async () => {
      vi.mocked(medicationAPI.create).mockRejectedValue({
        response: { data: { error: 'Validation error' } },
      });

      const { result } = renderHook(() => useCreateMedication(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        petId: 'pet-1',
        name: 'Amoxicillin',
        dosage: '250mg twice daily',
        startDate: '2024-01-01',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Validation error');
    });

    it('shows fallback error message when no response data', async () => {
      vi.mocked(medicationAPI.create).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useCreateMedication(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        petId: 'pet-1',
        name: 'Amoxicillin',
        dosage: '250mg twice daily',
        startDate: '2024-01-01',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Failed to create medication');
    });
  });

  // ==========================================
  // useUpdateMedication — update mutation
  // ==========================================
  describe('useUpdateMedication', () => {
    it('calls API and invalidates on success', async () => {
      vi.mocked(medicationAPI.update).mockResolvedValue(mockMedications[0]);

      const { result } = renderHook(() => useUpdateMedication('med-1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ dosage: '500mg once daily' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(medicationAPI.update).toHaveBeenCalledWith('med-1', { dosage: '500mg once daily' });
      expect(toast.success).toHaveBeenCalledWith('Medication updated successfully');
    });

    it('shows error toast on failure', async () => {
      vi.mocked(medicationAPI.update).mockRejectedValue({
        response: { data: { error: 'Not found' } },
      });

      const { result } = renderHook(() => useUpdateMedication('nonexistent'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ dosage: '500mg' });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Not found');
    });

    it('shows fallback error message when no response data', async () => {
      vi.mocked(medicationAPI.update).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useUpdateMedication('med-1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ dosage: '500mg' });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Failed to update medication');
    });
  });

  // ==========================================
  // useDeactivateMedication — deactivate mutation
  // ==========================================
  describe('useDeactivateMedication', () => {
    it('calls API and invalidates on success', async () => {
      vi.mocked(medicationAPI.deactivate).mockResolvedValue({ active: false });

      const { result } = renderHook(() => useDeactivateMedication(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('med-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(medicationAPI.deactivate).toHaveBeenCalledWith('med-1');
      expect(toast.success).toHaveBeenCalledWith('Medication deactivated successfully');
    });

    it('shows error toast on failure', async () => {
      vi.mocked(medicationAPI.deactivate).mockRejectedValue({
        response: { data: { error: 'Cannot deactivate' } },
      });

      const { result } = renderHook(() => useDeactivateMedication(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('med-1');

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Cannot deactivate');
    });

    it('shows fallback error message when no response data', async () => {
      vi.mocked(medicationAPI.deactivate).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useDeactivateMedication(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('med-1');

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Failed to deactivate medication');
    });
  });

  // ==========================================
  // useDeleteMedication — delete mutation
  // ==========================================
  describe('useDeleteMedication', () => {
    it('calls API and invalidates on success', async () => {
      vi.mocked(medicationAPI.delete).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteMedication(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('med-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(medicationAPI.delete).toHaveBeenCalledWith('med-1');
      expect(toast.success).toHaveBeenCalledWith('Medication deleted successfully');
    });

    it('shows error toast on failure', async () => {
      vi.mocked(medicationAPI.delete).mockRejectedValue({
        response: { data: { error: 'Cannot delete' } },
      });

      const { result } = renderHook(() => useDeleteMedication(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('med-1');

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Cannot delete');
    });

    it('shows fallback error message when no response data', async () => {
      vi.mocked(medicationAPI.delete).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useDeleteMedication(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('med-1');

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Failed to delete medication');
    });
  });
});