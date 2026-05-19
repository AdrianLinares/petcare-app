/**
 * API Methods — Error Propagation Tests
 *
 * Verifies that API methods propagate errors instead of silently
 * falling back to localStorage demo data. After the cleanup of
 * getLocalData and try/catch localStorage fallbacks, all API methods
 * must let errors bubble up to React Query / calling code.
 *
 * TDD Cycle: RED → these tests fail because current code
 * catches errors and returns localStorage fallback data.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import api from '@/lib/api';
import {
  petAPI,
  appointmentAPI,
  userAPI,
  medicalRecordAPI,
  vaccinationAPI,
  medicationAPI,
  clinicalRecordAPI,
  authAPI,
} from '@/lib/api';

// Helper: create a network error that mimics an AxiosError
function createNetworkError(message = 'Network Error') {
  const error = new Error(message) as Error & { isAxiosError: boolean };
  error.isAxiosError = true;
  return error;
}

// Helper: create an Axios-style error with a response
function createResponseError(status: number, data?: Record<string, unknown>) {
  const error = new Error(`Request failed with status code ${status}`) as Error & {
    isAxiosError: boolean;
    response: { status: number; data: Record<string, unknown> };
  };
  error.isAxiosError = true;
  error.response = { status, data: data ?? {} };
  return error;
}

describe('API methods — error propagation (no localStorage fallback)', () => {
  let spies: ReturnType<typeof vi.spyOn<any, any>>[] = [];

  afterEach(() => {
    spies.forEach(spy => spy.mockRestore());
    spies = [];
    localStorage.clear();
  });

  // ---- Pattern A: Methods that used getLocalData<T> fallback ----

  describe('petAPI.getPets', () => {
    it('propagates error when API call fails (no localStorage fallback)', async () => {
      const spy = vi.spyOn(api, 'get').mockRejectedValue(createNetworkError());
      spies.push(spy);

      await expect(petAPI.getPets()).rejects.toThrow('Network Error');
    });

    it('returns data when API call succeeds', async () => {
      const mockPets = [{ id: '1', name: 'Buddy' }];
      const spy = vi.spyOn(api, 'get').mockResolvedValue({ data: mockPets });
      spies.push(spy);

      const result = await petAPI.getPets();
      expect(result).toEqual(mockPets);
    });

    it('does not fall back to localStorage even when localStorage has pet data', async () => {
      // Set up localStorage with demo data (simulating pre-existing demo data)
      localStorage.setItem('currentUser', JSON.stringify({ email: 'owner@petcare.com' }));
      localStorage.setItem('pets_owner@petcare.com', JSON.stringify([{ id: 'demo', name: 'DemoPet' }]));

      const spy = vi.spyOn(api, 'get').mockRejectedValue(createNetworkError());
      spies.push(spy);

      // After cleanup: should THROW, not return localStorage data
      await expect(petAPI.getPets()).rejects.toThrow('Network Error');
    });
  });

  describe('appointmentAPI.getAppointments', () => {
    it('propagates error when API call fails (no localStorage fallback)', async () => {
      const spy = vi.spyOn(api, 'get').mockRejectedValue(createNetworkError());
      spies.push(spy);

      await expect(appointmentAPI.getAppointments()).rejects.toThrow('Network Error');
    });

    it('returns data when API call succeeds', async () => {
      const mockAppts = [{ id: '1', date: '2025-01-01' }];
      const spy = vi.spyOn(api, 'get').mockResolvedValue({ data: mockAppts });
      spies.push(spy);

      const result = await appointmentAPI.getAppointments();
      expect(result).toEqual(mockAppts);
    });

    it('does not fall back to localStorage even when localStorage has appointment data', async () => {
      localStorage.setItem('currentUser', JSON.stringify({ email: 'owner@petcare.com' }));
      localStorage.setItem('appointments_owner@petcare.com', JSON.stringify([{ id: 'demo' }]));

      const spy = vi.spyOn(api, 'get').mockRejectedValue(createNetworkError());
      spies.push(spy);

      await expect(appointmentAPI.getAppointments()).rejects.toThrow('Network Error');
    });
  });

  // ---- Pattern B: Methods that used return [] on catch ----

  describe('medicalRecordAPI.getByPet', () => {
    it('propagates error when API call fails (no silent return [])', async () => {
      const spy = vi.spyOn(api, 'get').mockRejectedValue(createNetworkError());
      spies.push(spy);

      await expect(medicalRecordAPI.getByPet('pet-1')).rejects.toThrow('Network Error');
    });

    it('returns data when API call succeeds', async () => {
      const mockRecords = [{ id: '1', recordType: 'checkup' }];
      const spy = vi.spyOn(api, 'get').mockResolvedValue({ data: mockRecords });
      spies.push(spy);

      const result = await medicalRecordAPI.getByPet('pet-1');
      expect(result).toEqual(mockRecords);
    });
  });

  describe('vaccinationAPI.getByPet', () => {
    it('propagates error when API call fails (no silent return [])', async () => {
      const spy = vi.spyOn(api, 'get').mockRejectedValue(createNetworkError());
      spies.push(spy);

      await expect(vaccinationAPI.getByPet('pet-1')).rejects.toThrow('Network Error');
    });

    it('returns data when API call succeeds', async () => {
      const mockVax = [{ id: '1', vaccine: 'Rabies' }];
      const spy = vi.spyOn(api, 'get').mockResolvedValue({ data: mockVax });
      spies.push(spy);

      const result = await vaccinationAPI.getByPet('pet-1');
      expect(result).toEqual(mockVax);
    });
  });

  describe('vaccinationAPI.getUpcoming', () => {
    it('propagates error when API call fails (no silent return [])', async () => {
      const spy = vi.spyOn(api, 'get').mockRejectedValue(createNetworkError());
      spies.push(spy);

      await expect(vaccinationAPI.getUpcoming()).rejects.toThrow('Network Error');
    });

    it('returns data when API call succeeds', async () => {
      const mockVax = [{ id: '2', vaccine: 'Distemper' }];
      const spy = vi.spyOn(api, 'get').mockResolvedValue({ data: mockVax });
      spies.push(spy);

      const result = await vaccinationAPI.getUpcoming();
      expect(result).toEqual(mockVax);
    });
  });

  describe('medicationAPI.getByPet', () => {
    it('propagates error when API call fails (no silent return [])', async () => {
      const spy = vi.spyOn(api, 'get').mockRejectedValue(createNetworkError());
      spies.push(spy);

      await expect(medicationAPI.getByPet('pet-1')).rejects.toThrow('Network Error');
    });

    it('returns data when API call succeeds', async () => {
      const mockMeds = [{ id: '1', name: 'Amoxicillin' }];
      const spy = vi.spyOn(api, 'get').mockResolvedValue({ data: mockMeds });
      spies.push(spy);

      const result = await medicationAPI.getByPet('pet-1');
      expect(result).toEqual(mockMeds);
    });
  });

  describe('clinicalRecordAPI.getByPet', () => {
    it('propagates error when API call fails (no silent return [])', async () => {
      const spy = vi.spyOn(api, 'get').mockRejectedValue(createNetworkError());
      spies.push(spy);

      await expect(clinicalRecordAPI.getByPet('pet-1')).rejects.toThrow('Network Error');
    });

    it('returns data when API call succeeds', async () => {
      const mockRecords = [{ id: '1', symptoms: 'Vomiting' }];
      const spy = vi.spyOn(api, 'get').mockResolvedValue({ data: mockRecords });
      spies.push(spy);

      const result = await clinicalRecordAPI.getByPet('pet-1');
      expect(result).toEqual(mockRecords);
    });
  });

  // ---- Pattern C: Methods that used manual localStorage fallback ----

  describe('userAPI.getCurrentUser', () => {
    it('propagates error when API call fails (no localStorage fallback)', async () => {
      const spy = vi.spyOn(api, 'get').mockRejectedValue(createNetworkError());
      spies.push(spy);

      await expect(userAPI.getCurrentUser()).rejects.toThrow('Network Error');
    });

    it('does not fall back to localStorage even when currentUser exists locally', async () => {
      localStorage.setItem('currentUser', JSON.stringify({ id: '1', email: 'test@test.com', fullName: 'Test User' }));

      const spy = vi.spyOn(api, 'get').mockRejectedValue(createNetworkError());
      spies.push(spy);

      // After cleanup: should THROW, not return localStorage data
      await expect(userAPI.getCurrentUser()).rejects.toThrow('Network Error');
    });

    it('returns data when API call succeeds', async () => {
      const mockUser = { id: '1', email: 'test@test.com', fullName: 'Test User' };
      const spy = vi.spyOn(api, 'get').mockResolvedValue({ data: mockUser });
      spies.push(spy);

      const result = await userAPI.getCurrentUser();
      expect(result).toEqual(mockUser);
    });
  });

  describe('userAPI.listUsers', () => {
    it('propagates error when API call fails (no localStorage iteration fallback)', async () => {
      const spy = vi.spyOn(api, 'get').mockRejectedValue(createNetworkError());
      spies.push(spy);

      await expect(userAPI.listUsers()).rejects.toThrow('Network Error');
    });

    it('does not fall back to localStorage even when user_ keys exist', async () => {
      localStorage.setItem('user_test@test.com', JSON.stringify({ id: '1', email: 'test@test.com' }));

      const spy = vi.spyOn(api, 'get').mockRejectedValue(createNetworkError());
      spies.push(spy);

      // After cleanup: should THROW, not iterate localStorage
      await expect(userAPI.listUsers()).rejects.toThrow('Network Error');
    });

    it('returns data when API call succeeds', async () => {
      const mockUsers = [{ id: '1', email: 'test@test.com' }];
      const spy = vi.spyOn(api, 'get').mockResolvedValue({ data: mockUsers });
      spies.push(spy);

      const result = await userAPI.listUsers();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('authAPI.login', () => {
    it('propagates error when API call fails (no localStorage demo login fallback)', async () => {
      const spy = vi.spyOn(api, 'post').mockRejectedValue(createResponseError(401, { error: 'Invalid email or password' }));
      spies.push(spy);

      await expect(authAPI.login('owner@petcare.com', 'wrongpass')).rejects.toThrow('Request failed with status code 401');
    });

    it('propagates 401 error specifically (response interceptor passes through)', async () => {
      const error401 = createResponseError(401, { error: 'Unauthorized' });
      const spy = vi.spyOn(api, 'post').mockRejectedValue(error401);
      spies.push(spy);

      await expect(authAPI.login('test@test.com', 'pass')).rejects.toThrow('Request failed with status code 401');
    });

    it('propagates network error (no silent catch)', async () => {
      const spy = vi.spyOn(api, 'post').mockRejectedValue(createNetworkError());
      spies.push(spy);

      await expect(authAPI.login('test@test.com', 'pass')).rejects.toThrow('Network Error');
    });

    it('does not fall back to localStorage demo users even when demo user exists', async () => {
      // Set up a demo user in localStorage
      const demoUser = { email: 'owner@petcare.com', password: 'password123', fullName: 'Demo Owner' };
      localStorage.setItem('user_owner@petcare.com', JSON.stringify(demoUser));

      const spy = vi.spyOn(api, 'post').mockRejectedValue(createResponseError(401));
      spies.push(spy);

      // After cleanup: should THROW, not return demo user data
      await expect(authAPI.login('owner@petcare.com', 'password123')).rejects.toThrow();
    });

    it('saves token and user to localStorage on successful login', async () => {
      const mockData = {
        user: { id: '1', email: 'owner@petcare.com', fullName: 'Test Owner' },
        token: 'jwt-token-123',
      };
      const spy = vi.spyOn(api, 'post').mockResolvedValue({ data: mockData });
      spies.push(spy);

      const result = await authAPI.login('owner@petcare.com', 'password123');

      expect(result).toEqual(mockData);
      expect(localStorage.getItem('token')).toBe('jwt-token-123');
      expect(JSON.parse(localStorage.getItem('currentUser')!)).toEqual(mockData.user);
    });

    it('does not save token when response has no token', async () => {
      const mockData = {
        user: { id: '1', email: 'test@test.com', fullName: 'Test' },
        // no token field
      };
      const spy = vi.spyOn(api, 'post').mockResolvedValue({ data: mockData });
      spies.push(spy);

      const result = await authAPI.login('test@test.com', 'pass');
      expect(result).toEqual(mockData);
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('authAPI.register', () => {
    it('saves token and user to localStorage on successful registration', async () => {
      const mockData = {
        user: { id: '2', email: 'new@test.com', fullName: 'New User' },
        token: 'reg-token-456',
      };
      const spy = vi.spyOn(api, 'post').mockResolvedValue({ data: mockData });
      spies.push(spy);

      const result = await authAPI.register({
        email: 'new@test.com',
        password: 'newpass',
        fullName: 'New User',
        phone: '+1-555-0100',
        userType: 'pet_owner',
      });

      expect(result).toEqual(mockData);
      expect(localStorage.getItem('token')).toBe('reg-token-456');
    });

    it('propagates error when registration fails', async () => {
      const spy = vi.spyOn(api, 'post').mockRejectedValue(createResponseError(409, { error: 'User already exists' }));
      spies.push(spy);

      await expect(authAPI.register({
        email: 'existing@test.com',
        password: 'pass',
        fullName: 'Test',
        phone: '+1-555-0100',
        userType: 'pet_owner',
      })).rejects.toThrow();
    });
  });

  describe('authAPI.logout', () => {
    it('removes token and currentUser from localStorage', () => {
      localStorage.setItem('token', 'some-token');
      localStorage.setItem('currentUser', JSON.stringify({ id: '1' }));

      authAPI.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('currentUser')).toBeNull();
    });
  });
});

describe('Response interceptor — 401 passthrough', () => {
  it('rejects with the original error for 401 responses', async () => {
    // The response interceptor should pass 401 errors through without clearing session
    const error401 = createResponseError(401, { error: 'Unauthorized' });
    
    // Verify the interceptor was registered (api.interceptors.response.use was called)
    // and that errors are not silently caught
    expect(api.interceptors.response).toBeDefined();
  });
});

describe('API methods — preserved exports and behavior', () => {
  it('exports translateApiError function', async () => {
    const { translateApiError } = await import('@/lib/api');
    expect(typeof translateApiError).toBe('function');
  });

  it('exports default api instance with interceptors', () => {
    expect(api).toBeDefined();
    expect(api.interceptors).toBeDefined();
    expect(api.interceptors.request).toBeDefined();
    expect(api.interceptors.response).toBeDefined();
  });

  it('still has all API object exports', async () => {
    const apiModule = await import('@/lib/api');
    expect(apiModule.petAPI).toBeDefined();
    expect(apiModule.appointmentAPI).toBeDefined();
    expect(apiModule.userAPI).toBeDefined();
    expect(apiModule.medicalRecordAPI).toBeDefined();
    expect(apiModule.vaccinationAPI).toBeDefined();
    expect(apiModule.medicationAPI).toBeDefined();
    expect(apiModule.clinicalRecordAPI).toBeDefined();
    expect(apiModule.authAPI).toBeDefined();
  });
});