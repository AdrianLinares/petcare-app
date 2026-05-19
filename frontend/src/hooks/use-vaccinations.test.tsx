import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  useUpcomingVaccinations,
  useVaccinations,
  useVaccination,
  useCreateVaccination,
  useUpdateVaccination,
  useDeleteVaccination,
  vaccinationKeys,
} from './use-vaccinations';
import { vaccinationAPI } from '@/lib/api';
import { toast } from 'sonner';

vi.mock('@/lib/api', () => ({
  vaccinationAPI: {
    getUpcoming: vi.fn(),
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

const mockVaccinations = [
  {
    id: 'vax-1',
    petId: 'pet-1',
    vaccine: 'Rabies',
    date: '2024-01-01',
    nextDue: '2025-01-01',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

describe('use-vaccinations hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // vaccinationKeys — query key factory
  // ==========================================
  describe('vaccinationKeys', () => {
    it('has all, byPet, upcoming, and detail keys', () => {
      expect(vaccinationKeys.all).toEqual(['vaccinations']);
      expect(vaccinationKeys.byPet('pet-1')).toEqual(['vaccinations', 'pet-1']);
      expect(vaccinationKeys.upcoming).toEqual(['vaccinations', 'upcoming']);
      expect(vaccinationKeys.detail('vax-1')).toEqual(['vaccinations', 'vax-1']);
    });
  });

  // ==========================================
  // useUpcomingVaccinations — list upcoming
  // ==========================================
  describe('useUpcomingVaccinations', () => {
    it('fetches and returns upcoming vaccinations', async () => {
      vi.mocked(vaccinationAPI.getUpcoming).mockResolvedValue(mockVaccinations);

      const { result } = renderHook(() => useUpcomingVaccinations(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockVaccinations);
      expect(vaccinationAPI.getUpcoming).toHaveBeenCalledOnce();
    });

    it('returns error when API fails', async () => {
      vi.mocked(vaccinationAPI.getUpcoming).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useUpcomingVaccinations(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Network error');
    });

    it('shows loading state initially', () => {
      vi.mocked(vaccinationAPI.getUpcoming).mockReturnValue(new Promise(() => {}));

      const { result } = renderHook(() => useUpcomingVaccinations(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });
  });

  // ==========================================
  // useVaccinations — list vaccinations for a pet
  // ==========================================
  describe('useVaccinations', () => {
    it('fetches and returns vaccinations for a pet', async () => {
      vi.mocked(vaccinationAPI.getByPet).mockResolvedValue(mockVaccinations);

      const { result } = renderHook(() => useVaccinations('pet-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockVaccinations);
      expect(vaccinationAPI.getByPet).toHaveBeenCalledWith('pet-1');
    });

    it('returns error when API fails', async () => {
      vi.mocked(vaccinationAPI.getByPet).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useVaccinations('pet-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Network error');
    });

    it('does not fetch when petId is empty', () => {
      vi.mocked(vaccinationAPI.getByPet).mockResolvedValue([]);

      const { result } = renderHook(() => useVaccinations(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(vaccinationAPI.getByPet).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // useVaccination — single record by ID
  // ==========================================
  describe('useVaccination', () => {
    it('fetches a single vaccination by ID', async () => {
      vi.mocked(vaccinationAPI.getById).mockResolvedValue(mockVaccinations[0]);

      const { result } = renderHook(() => useVaccination('vax-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockVaccinations[0]);
      expect(vaccinationAPI.getById).toHaveBeenCalledWith('vax-1');
    });

    it('does not fetch when ID is undefined', () => {
      vi.mocked(vaccinationAPI.getById).mockResolvedValue(mockVaccinations[0]);

      const { result } = renderHook(() => useVaccination(undefined as string | undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(vaccinationAPI.getById).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // useCreateVaccination — create mutation
  // ==========================================
  describe('useCreateVaccination', () => {
    it('calls API and invalidates on success', async () => {
      vi.mocked(vaccinationAPI.create).mockResolvedValue(mockVaccinations[0]);

      const { result } = renderHook(() => useCreateVaccination(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        petId: 'pet-1',
        vaccine: 'Rabies',
        date: '2024-01-01',
        nextDue: '2025-01-01',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(vaccinationAPI.create).toHaveBeenCalledWith(
        expect.objectContaining({ petId: 'pet-1', vaccine: 'Rabies' })
      );
      expect(toast.success).toHaveBeenCalledWith('Vaccination created successfully');
    });

    it('shows error toast on failure', async () => {
      vi.mocked(vaccinationAPI.create).mockRejectedValue({
        response: { data: { error: 'Pet not found' } },
      });

      const { result } = renderHook(() => useCreateVaccination(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        petId: 'pet-1',
        vaccine: 'Rabies',
        date: '2024-01-01',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Pet not found');
    });

    it('shows fallback error message when no response data', async () => {
      vi.mocked(vaccinationAPI.create).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useCreateVaccination(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        petId: 'pet-1',
        vaccine: 'Rabies',
        date: '2024-01-01',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Failed to create vaccination');
    });
  });

  // ==========================================
  // useUpdateVaccination — update mutation
  // ==========================================
  describe('useUpdateVaccination', () => {
    it('calls API and invalidates on success', async () => {
      vi.mocked(vaccinationAPI.update).mockResolvedValue(mockVaccinations[0]);

      const { result } = renderHook(() => useUpdateVaccination('vax-1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ nextDue: '2025-12-01' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(vaccinationAPI.update).toHaveBeenCalledWith('vax-1', { nextDue: '2025-12-01' });
      expect(toast.success).toHaveBeenCalledWith('Vaccination updated successfully');
    });

    it('shows error toast on failure', async () => {
      vi.mocked(vaccinationAPI.update).mockRejectedValue({
        response: { data: { error: 'Not found' } },
      });

      const { result } = renderHook(() => useUpdateVaccination('nonexistent'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ nextDue: '2025-12-01' });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Not found');
    });

    it('shows fallback error message when no response data', async () => {
      vi.mocked(vaccinationAPI.update).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useUpdateVaccination('vax-1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ nextDue: '2025-12-01' });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Failed to update vaccination');
    });
  });

  // ==========================================
  // useDeleteVaccination — delete mutation
  // ==========================================
  describe('useDeleteVaccination', () => {
    it('calls API and invalidates on success', async () => {
      vi.mocked(vaccinationAPI.delete).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteVaccination(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('vax-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(vaccinationAPI.delete).toHaveBeenCalledWith('vax-1');
      expect(toast.success).toHaveBeenCalledWith('Vaccination deleted successfully');
    });

    it('shows error toast on failure', async () => {
      vi.mocked(vaccinationAPI.delete).mockRejectedValue({
        response: { data: { error: 'Cannot delete' } },
      });

      const { result } = renderHook(() => useDeleteVaccination(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('vax-1');

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Cannot delete');
    });

    it('shows fallback error message when no response data', async () => {
      vi.mocked(vaccinationAPI.delete).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useDeleteVaccination(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('vax-1');

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Failed to delete vaccination');
    });
  });
});