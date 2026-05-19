import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  usePets,
  usePet,
  useCreatePet,
  useUpdatePet,
  useDeletePet,
} from './use-pets';
import { petAPI } from '@/lib/api';
import { toast } from 'sonner';

vi.mock('@/lib/api', () => ({
  petAPI: {
    getPets: vi.fn(),
    getPetById: vi.fn(),
    createPet: vi.fn(),
    updatePet: vi.fn(),
    deletePet: vi.fn(),
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

const mockPets = [
  {
    id: 'pet-1',
    ownerId: 'owner-1',
    name: 'Buddy',
    species: 'Dog',
    breed: 'Golden Retriever',
    age: 3,
    weight: 30,
    color: 'Golden',
    gender: 'Male' as const,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

describe('use-pets hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // usePets — list all pets
  // ==========================================
  describe('usePets', () => {
    it('fetches and returns pets list', async () => {
      vi.mocked(petAPI.getPets).mockResolvedValue(mockPets);

      const { result } = renderHook(() => usePets(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockPets);
      expect(petAPI.getPets).toHaveBeenCalledOnce();
    });

    it('returns error when API fails', async () => {
      vi.mocked(petAPI.getPets).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => usePets(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe('Network error');
    });

    it('shows loading state initially', () => {
      vi.mocked(petAPI.getPets).mockReturnValue(new Promise(() => {})); // never resolves

      const { result } = renderHook(() => usePets(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });
  });

  // ==========================================
  // usePet — get single pet by ID
  // ==========================================
  describe('usePet', () => {
    it('fetches a single pet by ID', async () => {
      vi.mocked(petAPI.getPetById).mockResolvedValue(mockPets[0]);

      const { result } = renderHook(() => usePet('pet-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockPets[0]);
      expect(petAPI.getPetById).toHaveBeenCalledWith('pet-1');
    });

    it('does not fetch when ID is empty string', () => {
      vi.mocked(petAPI.getPetById).mockResolvedValue(mockPets[0]);

      const { result } = renderHook(() => usePet(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(petAPI.getPetById).not.toHaveBeenCalled();
    });

    it('does not fetch when ID is undefined', () => {
      vi.mocked(petAPI.getPetById).mockResolvedValue(mockPets[0]);

      const { result } = renderHook(() => usePet(undefined as string | undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(petAPI.getPetById).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // useCreatePet — create pet mutation
  // ==========================================
  describe('useCreatePet', () => {
    it('calls petAPI.createPet and invalidates on success', async () => {
      vi.mocked(petAPI.createPet).mockResolvedValue(mockPets[0]);

      const { result } = renderHook(() => useCreatePet(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ name: 'Buddy', species: 'Dog', breed: 'Golden Retriever' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(petAPI.createPet).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Buddy' })
      );
      expect(toast.success).toHaveBeenCalledWith('Pet created successfully');
    });

    it('shows error toast on failure', async () => {
      vi.mocked(petAPI.createPet).mockRejectedValue({
        response: { data: { error: 'Pet already exists' } },
      });

      const { result } = renderHook(() => useCreatePet(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ name: 'Buddy' });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Pet already exists');
    });

    it('shows fallback error message when no response data', async () => {
      vi.mocked(petAPI.createPet).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useCreatePet(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ name: 'Buddy' });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Failed to create pet');
    });
  });

  // ==========================================
  // useUpdatePet — update pet mutation
  // ==========================================
  describe('useUpdatePet', () => {
    it('calls petAPI.updatePet and invalidates on success', async () => {
      const updatedPet = { ...mockPets[0], name: 'Buddy Updated' };
      vi.mocked(petAPI.updatePet).mockResolvedValue(updatedPet);

      const { result } = renderHook(() => useUpdatePet('pet-1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ name: 'Buddy Updated' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(petAPI.updatePet).toHaveBeenCalledWith('pet-1', { name: 'Buddy Updated' });
      expect(toast.success).toHaveBeenCalledWith('Pet updated successfully');
    });

    it('shows error toast on failure', async () => {
      vi.mocked(petAPI.updatePet).mockRejectedValue({
        response: { data: { error: 'Pet not found' } },
      });

      const { result } = renderHook(() => useUpdatePet('nonexistent'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ name: 'Ghost' });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Pet not found');
    });

    it('shows fallback error message when no response data', async () => {
      vi.mocked(petAPI.updatePet).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useUpdatePet('pet-1'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ name: 'X' });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Failed to update pet');
    });
  });

  // ==========================================
  // useDeletePet — delete pet mutation
  // ==========================================
  describe('useDeletePet', () => {
    it('calls petAPI.deletePet and invalidates on success', async () => {
      vi.mocked(petAPI.deletePet).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeletePet(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('pet-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(petAPI.deletePet).toHaveBeenCalledWith('pet-1');
      expect(toast.success).toHaveBeenCalledWith('Pet deleted successfully');
    });

    it('shows error toast on failure', async () => {
      vi.mocked(petAPI.deletePet).mockRejectedValue({
        response: { data: { error: 'Cannot delete pet' } },
      });

      const { result } = renderHook(() => useDeletePet(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('pet-1');

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Cannot delete pet');
    });

    it('shows fallback error message when no response data', async () => {
      vi.mocked(petAPI.deletePet).mockRejectedValue(new Error('Server error'));

      const { result } = renderHook(() => useDeletePet(), {
        wrapper: createWrapper(),
      });

      result.current.mutate('pet-1');

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Failed to delete pet');
    });
  });
});