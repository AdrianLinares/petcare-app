import { useQuery } from '@tanstack/react-query';

/** Query key factory for demo data queries */
export const demoDataKeys = {
  all: ['demo-data'] as const,
  byType: (type: string) => ['demo-data', type] as const,
};

/**
 * useDemoData — explicit opt-in hook for reading localStorage demo data.
 *
 * This hook is NOT a silent fallback. It is only called explicitly by components
 * that need demo/localStorage data. React Query hooks (usePets, useAppointments, etc.)
 * should NOT fall back to this — they should use the API only.
 *
 * @param type - The data type to read: 'pets', 'appointments', etc.
 * @returns useQuery result with typed data from localStorage
 */
export function useDemoData<T>(type: string) {
  return useQuery({
    queryKey: demoDataKeys.byType(type),
    queryFn: (): T[] => {
      try {
        const userStr = localStorage.getItem('currentUser');
        if (!userStr) return [];
        const user = JSON.parse(userStr);
        const dataStr = localStorage.getItem(`${type}_${user.email}`);
        if (!dataStr) return [];
        return JSON.parse(dataStr) as T[];
      } catch {
        return [];
      }
    },
    staleTime: Infinity, // localStorage data is always the same until manually changed
    gcTime: Infinity,
  });
}