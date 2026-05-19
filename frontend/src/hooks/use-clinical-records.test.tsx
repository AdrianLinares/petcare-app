import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  useClinicalRecords,
  useClinicalRecord,
  useCreateClinicalRecord,
  useUpdateClinicalRecord,
  useDeleteClinicalRecord,
  clinicalRecordKeys,
} from './use-clinical-records';
import { clinicalRecordAPI } from '@/lib/api';
import { toast } from 'sonner';

vi.mock('@/lib/api', () => ({
  clinicalRecordAPI: {
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

const mockClinicalRecords = [
  {
    id: 'cr-1',
    petId: 'pet-1',
    veterinarianId: 'vet-1',
    veterinarianName: 'Dr. Smith',
    date: '2024-01-15',
    symptoms: 'Vomiting, lethargy',
    diagnosis: 'Gastroenteritis',
    treatment: 'IV fluids, anti-nausea',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
];

describe('use-clinical-records hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // clinicalRecordKeys — query key factory
  // ==========================================
  describe('clinicalRecordKeys', () => {
    it('has all, byPet, and detail keys', () => {
      expect(clinicalRecordKeys.all).toEqual(['clinical-records']);
      expect(clinicalRecordKeys.byPet('pet-1')).toEqual(['clinical-records', 'pet-1']);
      expect(clinicalRecordKeys.detail('cr-1')).toEqual(['clinical-records', 'cr-1']);
    });
  });

  // ==========================================
  // useClinicalRecords — list records for a pet
  // ==========================================
  describe('useClinicalRecords', () => {
    it('fetches and returns clinical records for a pet', async () => {
      vi.mocked(clinicalRecordAPI.getByPet).mockResolvedValue(mockClinicalRecords);

      const { result } = renderHook(() => useClinicalRecords('pet-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockClinicalRecords);
      expect(clinicalRecordAPI.getByPet).toHaveBeenCalledWith('pet-1');
    });

    it('returns error when API fails', async () => {
      vi.mocked(clinicalRecordAPI.getByPet).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useClinicalRecords('pet-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Network error');
    });

    it('does not fetch when petId is empty', () => {
      vi.mocked(clinicalRecordAPI.getByPet).mockResolvedValue([]);

      const { result } = renderHook(() => useClinicalRecords(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(clinicalRecordAPI.getByPet).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // useClinicalRecord — single record by ID
  // ==========================================
  describe('useClinicalRecord', () => {
    it('fetches a single clinical record by ID', async () => {
      vi.mocked(clinicalRecordAPI.getById).mockResolvedValue(mockClinicalRecords[0]);

      const { result } = renderHook(() => useClinicalRecord('cr-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockClinicalRecords[0]);
      expect(clinicalRecordAPI.getById).toHaveBeenCalledWith('cr-1');
    });

    it('does not fetch when ID is undefined', () => {
      vi.mocked(clinicalRecordAPI.getById).mockResolvedValue(mockClinicalRecords[0]);

      const { result } = renderHook(() => useClinicalRecord(undefined as string | undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(clinicalRecordAPI.getById).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // useCreateClinicalRecord — create mutation
  // ==========================================
  describe('useCreateClinicalRecord', () => {
    it('calls API and invalidates on success', async () => {
      vi.mocked(clinicalRecordAPI.create).mockResolvedValue(mockClinicalRecords[0]);

      const { result } = renderHook(() => useCreateClinicalRecord(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        petId: 'pet-1',
        date: '2024-01-15',
        symptoms: 'Vomiting',
        diagnosis: 'Gastroenteritis',
        treatment: 'IV fluids',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(clinicalRecordAPI.create).toHaveBeenCalledWith(
        expect.objectContaining({ petId: 'pet-1', diagnosis: 'Gastroenteritis' })
      );
      expect(toast.success).toHaveBeenCalledWith('Clinical record created successfully');
    });

    it('shows error toast on failure', async () => {
      vi.mocked(clinicalRecordAPI.create).mockRejectedValue({
        response: { data: { error: 'Validation error' } },
      });

      const { result } = renderHook(() => useCreateClinicalRecord(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        petId: 'pet-1',
        date: '2024-01-15',
        symptoms: 'Vomiting',
        diagnosis: 'Gastroenteritis',
        treatment: 'IV fluids',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Validation error');
    });

    it('shows fallback error message when no response data', async () => {
      vi.mocked(clinicalRecordAPI.create).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useCreateClinicalRecord(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        petId: 'pet-1',
        date: '2024-01-15',
        symptoms: 'Vomiting',
        diagnosis: 'Gastroenteritis',
        treatment: 'IV fluids',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Failed to create clinical record');
    });
  });

  // ==========================================
  // useUpdateClinicalRecord — update mutation
  // ==========================================
  describe('useUpdateClinicalRecord', () => {
    it('calls API and invalidates on success', async () => {
      vi.mocked(clinicalRecordAPI.update).mockResolvedValue(mockClinicalRecords[0]);

      const { result } = renderHook(() => useUpdateClinicalRecord('cr-1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ notes: 'Follow-up required' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(clinicalRecordAPI.update).toHaveBeenCalledWith('cr-1', { notes: 'Follow-up required' });
      expect(toast.success).toHaveBeenCalledWith('Clinical record updated successfully');
    });

    it('shows error toast on failure', async () => {
      vi.mocked(clinicalRecordAPI.update).mockRejectedValue({
        response: { data: { error: 'Record not found' } },
      });

      const { result } = renderHook(() => useUpdateClinicalRecord('nonexistent'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ notes: 'test' });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Record not found');
    });

    it('shows fallback error message when no response data', async () => {
      vi.mocked(clinicalRecordAPI.update).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useUpdateClinicalRecord('cr-1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ notes: 'test' });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Failed to update clinical record');
    });
  });

  // ==========================================
  // useDeleteClinicalRecord — delete mutation
  // ==========================================
  describe('useDeleteClinicalRecord', () => {
    it('calls API and invalidates on success', async () => {
      vi.mocked(clinicalRecordAPI.delete).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteClinicalRecord(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('cr-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(clinicalRecordAPI.delete).toHaveBeenCalledWith('cr-1');
      expect(toast.success).toHaveBeenCalledWith('Clinical record deleted successfully');
    });

    it('shows error toast on failure', async () => {
      vi.mocked(clinicalRecordAPI.delete).mockRejectedValue({
        response: { data: { error: 'Cannot delete record' } },
      });

      const { result } = renderHook(() => useDeleteClinicalRecord(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('cr-1');

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Cannot delete record');
    });

    it('shows fallback error message when no response data', async () => {
      vi.mocked(clinicalRecordAPI.delete).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useDeleteClinicalRecord(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('cr-1');

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Failed to delete clinical record');
    });
  });
});