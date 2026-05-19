/**
 * Appointments Endpoint Tests — AUDIT-4.3.1 (part 2)
 *
 * Tests the appointments handler (appointments.ts) with module-level mocks
 * for database and auth utilities.
 *
 * NO production code is modified — this file adds test coverage only.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockEvent, mockAuthEvent } from './helpers';

// ─── Module Mocks ─────────────────────────────────────────────────────

vi.mock('../utils/database', () => ({
  query: vi.fn(),
  getPool: vi.fn(),
}));

vi.mock('../utils/auth', () => ({
  getUserFromToken: vi.fn(),
  requireAuth: vi.fn(),
  requireRole: vi.fn(),
  requireAdmin: vi.fn(),
}));

// ─── Imports (after mocks) ─────────────────────────────────────────────

import { query } from '../utils/database';
import { requireAuth } from '../utils/auth';
import { handler } from '../appointments';

// ─── Helpers ───────────────────────────────────────────────────────────

function parseBody(response: { body: string }) {
  return JSON.parse(response.body);
}

/** Standard owner user returned by requireAuth */
const mockOwner = {
  id: 'owner-1',
  email: 'owner@example.com',
  fullName: 'Pet Owner',
  phone: '555-0100',
  userType: 'pet_owner',
  accessLevel: 'standard',
  address: null,
  specialization: null,
  licenseNumber: null,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

/** Standard vet user */
const mockVet = {
  id: 'vet-1',
  email: 'vet@example.com',
  fullName: 'Dr. Vet',
  phone: '555-0300',
  userType: 'veterinarian',
  accessLevel: 'standard',
  address: null,
  specialization: 'Surgery',
  licenseNumber: 'VET-123',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

/** Standard admin user */
const mockAdmin = {
  id: 'admin-1',
  email: 'admin@example.com',
  fullName: 'Admin User',
  phone: '555-0200',
  userType: 'administrator',
  accessLevel: 'super_admin',
  address: null,
  specialization: null,
  licenseNumber: null,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

/** Appointment row with joins */
const mockAppointmentRow = {
  id: 'apt-1',
  pet_id: 'pet-1',
  pet_name: 'Buddy',
  owner_id: 'owner-1',
  owner_name: 'Pet Owner',
  veterinarian_id: 'vet-1',
  vet_name: 'Dr. Vet',
  appointment_type: 'checkup',
  date: '2025-07-01',
  time: '10:00',
  duration: 30,
  reason: 'Annual checkup',
  status: 'scheduled',
  notes: null,
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
};

// ─── Appointments Handler Tests ────────────────────────────────────────

describe('Appointments Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.DATABASE_URL = 'postgres://test:test@localhost/test';
  });

  // ─── OPTIONS / CORS ───────────────────────────────────────────────────

  describe('OPTIONS request (CORS)', () => {
    it('returns 200 with CORS headers', async () => {
      const event = mockEvent({
        path: '/.netlify/functions/appointments',
        httpMethod: 'OPTIONS',
      });
      const result = await handler(event);

      expect(result.statusCode).toBe(200);
      expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      expect(result.headers).toHaveProperty('Access-Control-Allow-Headers');
      expect(result.headers).toHaveProperty('Access-Control-Allow-Methods');
    });
  });

  // ─── GET /appointments (list) ──────────────────────────────────────────

  describe('GET /appointments (list)', () => {
    it('owner sees own appointments', async () => {
      (requireAuth as any).mockResolvedValue(mockOwner);

      (query as any).mockResolvedValueOnce({
        rows: [mockAppointmentRow],
        rowCount: 1,
      });

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/appointments',
        httpMethod: 'GET',
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      expect(body).toHaveLength(1);
      expect(body[0].ownerId).toBe('owner-1');
      expect(body[0].petName).toBe('Buddy');

      // Verify query filters by owner_id for pet_owner role
      const queryCall = (query as any).mock.calls[0];
      expect(queryCall[0]).toContain('owner_id');
    });

    it('vet sees assigned appointments', async () => {
      (requireAuth as any).mockResolvedValue(mockVet);

      (query as any).mockResolvedValueOnce({
        rows: [mockAppointmentRow],
        rowCount: 1,
      });

      const event = mockAuthEvent('vet-token', {
        path: '/.netlify/functions/appointments',
        httpMethod: 'GET',
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
      expect(body).toHaveLength(1);
      expect(body[0].veterinarianId).toBe('vet-1');

      // Verify query filters by veterinarian_id for vet role
      const queryCall = (query as any).mock.calls[0];
      expect(queryCall[0]).toContain('veterinarian_id');
    });

    it('admin sees all appointments', async () => {
      (requireAuth as any).mockResolvedValue(mockAdmin);

      (query as any).mockResolvedValueOnce({
        rows: [{ ...mockAppointmentRow, id: 'apt-1' }, { ...mockAppointmentRow, id: 'apt-2', owner_id: 'owner-2' }],
        rowCount: 2,
      });

      const event = mockAuthEvent('admin-token', {
        path: '/.netlify/functions/appointments',
        httpMethod: 'GET',
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
      expect(body).toHaveLength(2);

      // Admin query should NOT filter by owner_id or veterinarian_id
      const queryCall = (query as any).mock.calls[0];
      expect(queryCall[0]).not.toContain('owner_id = $');
      expect(queryCall[0]).not.toContain('veterinarian_id = $');
    });

    it('filters by status query parameter', async () => {
      (requireAuth as any).mockResolvedValue(mockOwner);

      (query as any).mockResolvedValueOnce({
        rows: [{ ...mockAppointmentRow, status: 'completed' }],
        rowCount: 1,
      });

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/appointments',
        httpMethod: 'GET',
        queryStringParameters: { status: 'completed' },
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
      expect(body).toHaveLength(1);
      expect(body[0].status).toBe('completed');

      // Verify status filter is in the query
      const queryCall = (query as any).mock.calls[0];
      expect(queryCall[0]).toContain('a.status');
    });

    it('returns empty array when no appointments exist', async () => {
      (requireAuth as any).mockResolvedValue(mockOwner);

      (query as any).mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      });

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/appointments',
        httpMethod: 'GET',
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
      expect(body).toHaveLength(0);
    });

    it('excludes soft-deleted appointments (deleted_at IS NULL)', async () => {
      (requireAuth as any).mockResolvedValue(mockAdmin);

      (query as any).mockResolvedValueOnce({
        rows: [mockAppointmentRow],
        rowCount: 1,
      });

      const event = mockAuthEvent('admin-token', {
        path: '/.netlify/functions/appointments',
        httpMethod: 'GET',
      });

      const result = await handler(event);
      expect(result.statusCode).toBe(200);

      // Verify the query includes deleted_at IS NULL
      const queryCall = (query as any).mock.calls[0];
      expect(queryCall[0]).toContain('deleted_at IS NULL');
    });
  });

  // ─── POST /appointments (create) ──────────────────────────────────────

  describe('POST /appointments (create)', () => {
    it('creates appointment with required fields → 201', async () => {
      (requireAuth as any).mockResolvedValue(mockOwner);

      // First query: get pet owner from pet
      (query as any)
        .mockResolvedValueOnce({
          rows: [{ owner_id: 'owner-1' }],
          rowCount: 1,
        })
        // Second query: INSERT appointment
        .mockResolvedValueOnce({
          rows: [mockAppointmentRow],
          rowCount: 1,
        });

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/appointments',
        httpMethod: 'POST',
        body: JSON.stringify({
          petId: 'pet-1',
          veterinarianId: 'vet-1',
          type: 'checkup',
          date: '2025-07-01',
          time: '10:00',
          reason: 'Annual checkup',
        }),
      });

      const result = await handler(event);

      expect(result.statusCode).toBe(201);
      // Verify the pet lookup was called first, then the insert
      expect(query).toHaveBeenCalledTimes(2);
    });

    it('missing required fields → error', async () => {
      (requireAuth as any).mockResolvedValue(mockOwner);

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/appointments',
        httpMethod: 'POST',
        body: JSON.stringify({
          petId: 'pet-1',
          date: '2025-07-01',
          // missing veterinarianId, type, time
        }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(body.error).toBe('Missing required fields');
    });

    it('nonexistent pet → error', async () => {
      (requireAuth as any).mockResolvedValue(mockOwner);

      // Pet not found
      (query as any).mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      });

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/appointments',
        httpMethod: 'POST',
        body: JSON.stringify({
          petId: 'nonexistent-pet',
          veterinarianId: 'vet-1',
          type: 'checkup',
          date: '2025-07-01',
          time: '10:00',
        }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(body.error).toContain('Pet not found');
    });

    it('creates appointment with default status scheduled', async () => {
      (requireAuth as any).mockResolvedValue(mockOwner);

      (query as any)
        .mockResolvedValueOnce({
          rows: [{ owner_id: 'owner-1' }],
          rowCount: 1,
        })
        .mockResolvedValueOnce({
          rows: [{ ...mockAppointmentRow, status: 'scheduled' }],
          rowCount: 1,
        });

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/appointments',
        httpMethod: 'POST',
        body: JSON.stringify({
          petId: 'pet-1',
          veterinarianId: 'vet-1',
          type: 'checkup',
          date: '2025-07-01',
          time: '10:00',
        }),
      });

      const result = await handler(event);

      expect(result.statusCode).toBe(201);
      // Verify the INSERT includes status 'scheduled'
      const insertCall = (query as any).mock.calls[1];
      expect(insertCall[1]).toContain('scheduled');
    });
  });

  // ─── GET /appointments/:id (single) ───────────────────────────────────

  describe('GET /appointments/:id', () => {
    it('returns appointment by ID', async () => {
      (requireAuth as any).mockResolvedValue(mockOwner);

      (query as any).mockResolvedValueOnce({
        rows: [mockAppointmentRow],
        rowCount: 1,
      });

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/appointments/apt-1',
        httpMethod: 'GET',
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
      expect(body.id).toBe('apt-1');
      // GET /:id now uses camelCaseRows (via db-helpers refactoring)
      expect(body.petName).toBe('Buddy');
      expect(body.ownerName).toBe('Pet Owner');
      expect(body.vetName).toBe('Dr. Vet');
    });

    it('nonexistent appointment → 404', async () => {
      (requireAuth as any).mockResolvedValue(mockOwner);

      (query as any).mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      });

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/appointments/nonexistent',
        httpMethod: 'GET',
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(404);
      expect(body.error).toBe('Appointment not found');
    });
  });

  // ─── PATCH /appointments/:id (update) ──────────────────────────────────

  describe('PATCH /appointments/:id (update)', () => {
    it('updates status to completed → 200', async () => {
      (requireAuth as any).mockResolvedValue(mockVet);

      const updatedRow = {
        ...mockAppointmentRow,
        status: 'completed',
      };
      (query as any).mockResolvedValueOnce({
        rows: [updatedRow],
        rowCount: 1,
      });

      const event = mockAuthEvent('vet-token', {
        path: '/.netlify/functions/appointments/apt-1',
        httpMethod: 'PATCH',
        body: JSON.stringify({ status: 'completed' }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
      expect(body.status).toBe('completed');
    });

    it('updates status to cancelled → 200', async () => {
      (requireAuth as any).mockResolvedValue(mockOwner);

      const updatedRow = {
        ...mockAppointmentRow,
        status: 'cancelled',
      };
      (query as any).mockResolvedValueOnce({
        rows: [updatedRow],
        rowCount: 1,
      });

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/appointments/apt-1',
        httpMethod: 'PATCH',
        body: JSON.stringify({ status: 'cancelled' }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
      expect(body.status).toBe('cancelled');
    });

    it('updates notes → 200', async () => {
      (requireAuth as any).mockResolvedValue(mockVet);

      const updatedRow = {
        ...mockAppointmentRow,
        notes: 'Follow-up in 2 weeks',
      };
      (query as any).mockResolvedValueOnce({
        rows: [updatedRow],
        rowCount: 1,
      });

      const event = mockAuthEvent('vet-token', {
        path: '/.netlify/functions/appointments/apt-1',
        httpMethod: 'PATCH',
        body: JSON.stringify({ notes: 'Follow-up in 2 weeks' }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
    });

    it('appointment not found → 404', async () => {
      (requireAuth as any).mockResolvedValue(mockVet);

      (query as any).mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      });

      const event = mockAuthEvent('vet-token', {
        path: '/.netlify/functions/appointments/nonexistent',
        httpMethod: 'PATCH',
        body: JSON.stringify({ status: 'completed' }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(404);
      expect(body.error).toBe('Appointment not found');
    });

    it('no fields to update → error', async () => {
      (requireAuth as any).mockResolvedValue(mockVet);

      const event = mockAuthEvent('vet-token', {
        path: '/.netlify/functions/appointments/apt-1',
        httpMethod: 'PATCH',
        body: JSON.stringify({}),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(body.error).toBe('No fields to update');
    });
  });

  // ─── DELETE /appointments/:id ──────────────────────────────────────────

  describe('DELETE /appointments/:id', () => {
    it('soft deletes an appointment', async () => {
      (requireAuth as any).mockResolvedValue(mockOwner);

      (query as any).mockResolvedValueOnce({
        rows: [],
        rowCount: 1,
      });

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/appointments/apt-1',
        httpMethod: 'DELETE',
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
      expect(body.message).toBe('Appointment deleted successfully');

      // Verify soft-delete pattern
      const deleteCall = (query as any).mock.calls[0];
      expect(deleteCall[0]).toContain('deleted_at');
      expect(deleteCall[0]).toContain('CURRENT_TIMESTAMP');
    });
  });

  // ─── Unknown route ────────────────────────────────────────────────────

  describe('Unknown routes', () => {
    it('returns 404 for unknown paths', async () => {
      (requireAuth as any).mockResolvedValue(mockOwner);

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/appointments/unknown/route/here',
        httpMethod: 'GET',
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(404);
      expect(body.error).toBe('Route not found');
    });
  });
});