import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  useDemoData,
  demoDataKeys,
} from './use-demo-data';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get store() { return store; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

vi.mock('@/lib/api', () => ({}));

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

describe('use-demo-data hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  // ==========================================
  // demoDataKeys — query key factory
  // ==========================================
  describe('demoDataKeys', () => {
    it('has all expected key types', () => {
      expect(demoDataKeys.all).toEqual(['demo-data']);
      expect(demoDataKeys.byType('pets')).toEqual(['demo-data', 'pets']);
      expect(demoDataKeys.byType('appointments')).toEqual(['demo-data', 'appointments']);
    });
  });

  // ==========================================
  // useDemoData — explicit opt-in demo data
  // ==========================================
  describe('useDemoData', () => {
    it('returns pets demo data when type is pets', async () => {
      const mockPets = [{ id: 'pet-1', name: 'Buddy' }];
      localStorageMock.setItem('currentUser', JSON.stringify({ email: 'owner@petcare.com' }));
      localStorageMock.setItem('pets_owner@petcare.com', JSON.stringify(mockPets));

      const { result } = renderHook(() => useDemoData('pets'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockPets);
    });

    it('returns appointments demo data when type is appointments', async () => {
      const mockAppointments = [{ id: 'apt-1', petName: 'Buddy' }];
      localStorageMock.setItem('currentUser', JSON.stringify({ email: 'owner@petcare.com' }));
      localStorageMock.setItem('appointments_owner@petcare.com', JSON.stringify(mockAppointments));

      const { result } = renderHook(() => useDemoData('appointments'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockAppointments);
    });

    it('returns empty array when no currentUser in localStorage', async () => {
      // currentUser is not set, so this should return empty
      const { result } = renderHook(() => useDemoData('pets'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([]);
    });

    it('returns empty array when no data key exists in localStorage', async () => {
      localStorageMock.setItem('currentUser', JSON.stringify({ email: 'owner@petcare.com' }));
      // but no pets_key set

      const { result } = renderHook(() => useDemoData('pets'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([]);
    });

    it('returns empty array and does not throw when localStorage.getItem fails', async () => {
      localStorageMock.setItem('currentUser', JSON.stringify({ email: 'owner@petcare.com' }));
      localStorageMock.getItem.mockImplementationOnce(() => { throw new Error('Access denied'); });

      const { result } = renderHook(() => useDemoData('pets'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([]);
    });
  });
});