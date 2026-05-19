import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  useMedicalRecords,
  useMedicalRecord,
  useCreateMedicalRecord,
  useUpdateMedicalRecord,
  useDeleteMedicalRecord,
  medicalRecordKeys,
} from './use-medical-records';
import { medicalRecordAPI } from '@/lib/api';
import { toast } from 'sonner';

vi.mock('@/lib/api', () => ({
  medicalRecordAPI: {
    getByPet: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
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

const mockMedicalRecords = [
  {
    id: 'mr-1',
    petId: 'pet-1',
    date: '2024-01-15',
    recordType: 'checkup',
    description: 'Annual checkup - all clear',
    veterinarianName: 'Dr. Smith',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
];

describe('use-medical-records hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // medicalRecordKeys — query key factory
  // ==========================================
  describe('medicalRecordKeys', () => {
    it('has all, byPet, and detail keys', () => {
      expect(medicalRecordKeys.all).toEqual(['medical-records']);
      expect(medicalRecordKeys.byPet('pet-1')).toEqual(['medical-records', 'pet-1']);
      expect(medicalRecordKeys.detail('mr-1')).toEqual(['medical-records', 'mr-1']);
    });
  });

  // ==========================================
  // useMedicalRecords — list records for a pet
  // ==========================================
  describe('useMedicalRecords', () => {
    it('fetches and returns medical records for a pet', async () => {
      vi.mocked(medicalRecordAPI.getByPet).mockResolvedValue(mockMedicalRecords);

      const { result } = renderHook(() => useMedicalRecords('pet-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockMedicalRecords);
      expect(medicalRecordAPI.getByPet).toHaveBeenCalledWith('pet-1');
    });

    it('returns error when API fails', async () => {
      vi.mocked(medicalRecordAPI.getByPet).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useMedicalRecords('pet-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Network error');
    });

    it('shows loading state initially', () => {
      vi.mocked(medicalRecordAPI.getByPet).mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useMedicalRecords('pet-1'), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('does not fetch when petId is empty', () => {
      vi.mocked(medicalRecordAPI.getByPet).mockResolvedValue([]);

      const { result } = renderHook(() => useMedicalRecords(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(medicalRecordAPI.getByPet).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // useMedicalRecord — single record by ID
  // ==========================================
  describe('useMedicalRecord', () => {
    it('fetches a single medical record by ID', async () => {
      vi.mocked(medicalRecordAPI.getById).mockResolvedValue(mockMedicalRecords[0]);

      const { result } = renderHook(() => useMedicalRecord('mr-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockMedicalRecords[0]);
      expect(medicalRecordAPI.getById).toHaveBeenCalledWith('mr-1');
    });

    it('does not fetch when ID is undefined', () => {
      vi.mocked(medicalRecordAPI.getById).mockResolvedValue(mockMedicalRecords[0]);

      const { result } = renderHook(() => useMedicalRecord(undefined as string | undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(medicalRecordAPI.getById).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // useCreateMedicalRecord — create mutation
  // ==========================================
  describe('useCreateMedicalRecord', () => {
    it('calls API and invalidates on success', async () => {
      vi.mocked(medicalRecordAPI.create).mockResolvedValue(mockMedicalRecords[0]);

      const { result } = renderHook(() => useCreateMedicalRecord(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        petId: 'pet-1',
        date: '2024-01-15',
        recordType: 'checkup',
        description: 'Annual checkup',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(medicalRecordAPI.create).toHaveBeenCalledWith(
        expect.objectContaining({ petId: 'pet-1' })
      );
      expect(toast.success).toHaveBeenCalledWith('Medical record created successfully');
    });

    it('shows error toast on failure', async () => {
      vi.mocked(medicalRecordAPI.create).mockRejectedValue({
        response: { data: { error: 'Validation error' } },
      });

      const { result } = renderHook(() => useCreateMedicalRecord(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        petId: 'pet-1',
        date: '2024-01-15',
        recordType: 'checkup',
        description: 'Annual checkup',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Validation error');
    });

    it('shows fallback error message when no response data', async () => {
      vi.mocked(medicalRecordAPI.create).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useCreateMedicalRecord(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        petId: 'pet-1',
        date: '2024-01-15',
        recordType: 'checkup',
        description: 'Annual checkup',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Failed to create medical record');
    });
  });

  // ==========================================
  // useUpdateMedicalRecord — update mutation
  // ==========================================
  describe('useUpdateMedicalRecord', () => {
    it('calls API and invalidates on success', async () => {
      const updated = { ...mockMedicalRecords[0], description: 'Updated description' };
      vi.mocked(medicalRecordAPI.update).mockResolvedValue(updated);

      const { result } = renderHook(() => useUpdateMedicalRecord('mr-1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ description: 'Updated description' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(medicalRecordAPI.update).toHaveBeenCalledWith('mr-1', { description: 'Updated description' });
      expect(toast.success).toHaveBeenCalledWith('Medical record updated successfully');
    });

    it('shows error toast on failure', async () => {
      vi.mocked(medicalRecordAPI.update).mockRejectedValue({
        response: { data: { error: 'Record not found' } },
      });

      const { result } = renderHook(() => useUpdateMedicalRecord('nonexistent'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ description: 'test' });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Record not found');
    });

    it('shows fallback error message when no response data', async () => {
      vi.mocked(medicalRecordAPI.update).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useUpdateMedicalRecord('mr-1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ description: 'test' });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Failed to update medical record');
    });
  });

  // ==========================================
  // useDeleteMedicalRecord — delete mutation
  // ==========================================
  describe('useDeleteMedicalRecord', () => {
    it('calls API and invalidates on success', async () => {
      vi.mocked(medicalRecordAPI.delete).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteMedicalRecord(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('mr-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(medicalRecordAPI.delete).toHaveBeenCalledWith('mr-1');
      expect(toast.success).toHaveBeenCalledWith('Medical record deleted successfully');
    });

    it('shows error toast on failure', async () => {
      vi.mocked(medicalRecordAPI.delete).mockRejectedValue({
        response: { data: { error: 'Cannot delete record' } },
      });

      const { result } = renderHook(() => useDeleteMedicalRecord(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('mr-1');

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Cannot delete record');
    });

    it('shows fallback error message when no response data', async () => {
      vi.mocked(medicalRecordAPI.delete).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useDeleteMedicalRecord(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('mr-1');

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Failed to delete medical record');
    });
  });
});