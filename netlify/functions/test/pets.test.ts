/**
 * Pets Endpoint Tests — AUDIT-4.3.1 (part 1)
 *
 * Tests the pets handler (pets.ts) with module-level mocks for
 * database and auth utilities.
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

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('mock-jwt-token'),
    verify: vi.fn().mockReturnValue({
      userId: 'owner-1',
      email: 'owner@example.com',
      userType: 'pet_owner',
    }),
  },
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
import { handler } from '../pets';

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

/** Standard vet user returned by requireAuth */
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

/** Standard admin user returned by requireAuth */
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

/** Pet row from DB with owner join */
const mockPetRow = {
  id: 'pet-1',
  name: 'Buddy',
  species: 'Dog',
  breed: 'Golden Retriever',
  age: 3,
  gender: 'Male',
  color: 'Golden',
  microchip_id: 'MC-12345',
  weight: 30,
  owner_id: 'owner-1',
  owner_name: 'Pet Owner',
  owner_email: 'owner@example.com',
  medical_history: null,
  allergies: null,
  conditions: null,
  current_medications: null,
  notes: 'Friendly dog',
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
};

// ─── Pets Handler Tests ────────────────────────────────────────────────

describe('Pets Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.DATABASE_URL = 'postgres://test:test@localhost/test';
  });

  // ─── OPTIONS / CORS ───────────────────────────────────────────────────

  describe('OPTIONS request (CORS)', () => {
    it('returns 200 with CORS headers', async () => {
      const event = mockEvent({
        path: '/.netlify/functions/pets',
        httpMethod: 'OPTIONS',
      });
      const result = await handler(event);

      expect(result.statusCode).toBe(200);
      expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      expect(result.headers).toHaveProperty('Access-Control-Allow-Headers');
      expect(result.headers).toHaveProperty('Access-Control-Allow-Methods');
    });
  });

  // ─── GET /pets (list) ─────────────────────────────────────────────────

  describe('GET /pets (list)', () => {
    it('owner sees own pets only', async () => {
      (requireAuth as any).mockResolvedValue(mockOwner);

      (query as any).mockResolvedValueOnce({
        rows: [mockPetRow],
        rowCount: 1,
      });

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/pets',
        httpMethod: 'GET',
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      expect(body).toHaveLength(1);
      expect(body[0].name).toBe('Buddy');
      expect(body[0].ownerId).toBe('owner-1');

      // Verify query filters by owner_id for pet_owner role
      const queryCall = (query as any).mock.calls[0];
      expect(queryCall[0]).toContain('owner_id');
      expect(queryCall[1]).toContain('owner-1');
    });

    it('vet sees all patients', async () => {
      (requireAuth as any).mockResolvedValue(mockVet);

      const vetPetRow = { ...mockPetRow, id: 'pet-vet-1' };
      (query as any).mockResolvedValueOnce({
        rows: [vetPetRow],
        rowCount: 1,
      });

      const event = mockAuthEvent('vet-token', {
        path: '/.netlify/functions/pets',
        httpMethod: 'GET',
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      expect(body).toHaveLength(1);

      // Vet query should NOT filter by owner_id
      const queryCall = (query as any).mock.calls[0];
      expect(queryCall[0]).not.toContain('owner_id = $1');
    });

    it('admin sees all pets', async () => {
      (requireAuth as any).mockResolvedValue(mockAdmin);

      const allPetsRow = [{ ...mockPetRow, id: 'pet-1' }, { ...mockPetRow, id: 'pet-2', name: 'Mittens', species: 'Cat' }];
      (query as any).mockResolvedValueOnce({
        rows: allPetsRow,
        rowCount: 2,
      });

      const event = mockAuthEvent('admin-token', {
        path: '/.netlify/functions/pets',
        httpMethod: 'GET',
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
      expect(body).toHaveLength(2);
      expect(body[0].name).toBe('Buddy');
      expect(body[1].name).toBe('Mittens');
    });

    it('empty list returns empty array', async () => {
      (requireAuth as any).mockResolvedValue(mockOwner);

      (query as any).mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      });

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/pets',
        httpMethod: 'GET',
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
      expect(body).toHaveLength(0);
    });
  });

  // ─── GET /pets/:petId (single) ────────────────────────────────────────

  describe('GET /pets/:petId', () => {
    it('owner can see own pet', async () => {
      (requireAuth as any).mockResolvedValue(mockOwner);

      (query as any).mockResolvedValueOnce({
        rows: [mockPetRow],
        rowCount: 1,
      });

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/pets/pet-1',
        httpMethod: 'GET',
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
      expect(body.id).toBe('pet-1');
      expect(body.name).toBe('Buddy');
      expect(body.species).toBe('Dog');
      expect(body.ownerName).toBe('Pet Owner');
    });

    it('owner cannot see another owner\'s pet (returns 404)', async () => {
      (requireAuth as any).mockResolvedValue(mockOwner);

      // Query returns empty because of AND p.owner_id = $2 filter
      (query as any).mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      });

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/pets/other-pet-id',
        httpMethod: 'GET',
      });

      const result = await handler(event);
      const body = parseBody(result);

      // Empty rows → throw new Error('Pet not found') → errorResponse maps "not found" → 404
      expect(result.statusCode).toBe(404);
      expect(body.error).toBe('Pet not found');
    });

    it('vet can see any pet regardless of owner', async () => {
      (requireAuth as any).mockResolvedValue(mockVet);

      (query as any).mockResolvedValueOnce({
        rows: [mockPetRow],
        rowCount: 1,
      });

      const event = mockAuthEvent('vet-token', {
        path: '/.netlify/functions/pets/pet-1',
        httpMethod: 'GET',
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
      expect(body.id).toBe('pet-1');

      // Vet query should NOT have owner_id filter
      const queryCall = (query as any).mock.calls[0];
      expect(queryCall[0]).not.toContain('owner_id = $2');
    });

    it('soft-deleted pet excluded (returns 404)', async () => {
      (requireAuth as any).mockResolvedValue(mockOwner);

      // DB returns empty because WHERE deleted_at IS NULL filters it out
      (query as any).mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      });

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/pets/deleted-pet-id',
        httpMethod: 'GET',
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(404);
      expect(body.error).toBe('Pet not found');

      // Verify the query includes deleted_at IS NULL
      const queryCall = (query as any).mock.calls[0];
      expect(queryCall[0]).toContain('deleted_at IS NULL');
    });
  });

  // ─── POST /pets (create) ──────────────────────────────────────────────

  describe('POST /pets (create)', () => {
    it('owner can create pet → 201', async () => {
      (requireAuth as any).mockResolvedValue(mockOwner);

      const newPetRow = {
        id: 'pet-new',
        name: 'Rex',
        species: 'Dog',
        breed: 'Labrador',
        age: 2,
        gender: 'Male',
        color: null,
        microchip_id: null,
        weight: null,
        owner_id: 'owner-1',
        created_at: '2025-04-01T00:00:00.000Z',
      };
      (query as any).mockResolvedValueOnce({
        rows: [newPetRow],
        rowCount: 1,
      });

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/pets',
        httpMethod: 'POST',
        body: JSON.stringify({
          name: 'Rex',
          species: 'Dog',
          breed: 'Labrador',
          age: 2,
          gender: 'Male',
        }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(201);
      expect(body.name).toBe('Rex');
      expect(body.species).toBe('Dog');
      expect(body.ownerId).toBe('owner-1');
    });

    it('missing name → error', async () => {
      (requireAuth as any).mockResolvedValue(mockOwner);

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/pets',
        httpMethod: 'POST',
        body: JSON.stringify({
          species: 'Dog',
        }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(body.error).toBe('Name and species are required');
    });

    it('missing species → error', async () => {
      (requireAuth as any).mockResolvedValue(mockOwner);

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/pets',
        httpMethod: 'POST',
        body: JSON.stringify({
          name: 'Rex',
        }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(body.error).toBe('Name and species are required');
    });

    it('vet can create pet with specified ownerId', async () => {
      (requireAuth as any).mockResolvedValue(mockVet);

      const newPetRow = {
        id: 'pet-vet-created',
        name: 'Fluffy',
        species: 'Cat',
        breed: 'Persian',
        age: 1,
        gender: 'Female',
        color: null,
        microchip_id: null,
        weight: null,
        owner_id: 'owner-1',
        created_at: '2025-04-01T00:00:00.000Z',
      };
      (query as any).mockResolvedValueOnce({
        rows: [newPetRow],
        rowCount: 1,
      });

      const event = mockAuthEvent('vet-token', {
        path: '/.netlify/functions/pets',
        httpMethod: 'POST',
        body: JSON.stringify({
          name: 'Fluffy',
          species: 'Cat',
          ownerId: 'owner-1',
        }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(201);
      expect(body.name).toBe('Fluffy');
      expect(body.ownerId).toBe('owner-1');
    });

    it('vet without ownerId → error', async () => {
      (requireAuth as any).mockResolvedValue(mockVet);

      const event = mockAuthEvent('vet-token', {
        path: '/.netlify/functions/pets',
        httpMethod: 'POST',
        body: JSON.stringify({
          name: 'Fluffy',
          species: 'Cat',
          // no ownerId provided
        }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(body.error).toBe('Owner ID is required');
    });
  });

  // ─── PATCH /pets/:petId (update) ──────────────────────────────────────

  describe('PATCH /pets/:petId', () => {
    it('owner can update own pet → 200', async () => {
      (requireAuth as any).mockResolvedValue(mockOwner);

      const updatedPetRow = {
        id: 'pet-1',
        name: 'Buddy Updated',
        species: 'Dog',
        breed: 'Golden Retriever',
        age: 4,
        gender: 'Male',
        color: 'Golden',
        microchip_id: 'MC-12345',
        weight: 32,
        owner_id: 'owner-1',
        medical_history: null,
        allergies: null,
        conditions: null,
        current_medications: null,
        notes: 'Updated notes',
        updated_at: '2025-06-01T00:00:00.000Z',
      };
      (query as any).mockResolvedValueOnce({
        rows: [updatedPetRow],
        rowCount: 1,
      });

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/pets/pet-1',
        httpMethod: 'PATCH',
        body: JSON.stringify({
          name: 'Buddy Updated',
          age: 4,
          weight: 32,
          notes: 'Updated notes',
        }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
      expect(body.name).toBe('Buddy Updated');
      expect(body.age).toBe(4);
      expect(body.weight).toBe(32);
    });

    it('owner cannot update another owner\'s pet', async () => {
      (requireAuth as any).mockResolvedValue(mockOwner);

      // UPDATE with owner_id filter returns no rows (pet not owned by this owner)
      (query as any).mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      });

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/pets/other-pet-id',
        httpMethod: 'PATCH',
        body: JSON.stringify({ name: 'Hacked Name' }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      // Empty rows → throw 'Pet not found or access denied'
      expect(result.statusCode).toBe(404);
      expect(body.error).toContain('Pet not found or access denied');
    });

    it('update with no fields → error', async () => {
      (requireAuth as any).mockResolvedValue(mockOwner);

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/pets/pet-1',
        httpMethod: 'PATCH',
        body: JSON.stringify({}),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(body.error).toBe('No fields to update');
    });
  });

  // ─── DELETE /pets/:petId ──────────────────────────────────────────────

  describe('DELETE /pets/:petId', () => {
    it('owner can delete own pet (soft delete)', async () => {
      (requireAuth as any).mockResolvedValue(mockOwner);

      (query as any).mockResolvedValueOnce({
        rows: [],
        rowCount: 1,
      });

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/pets/pet-1',
        httpMethod: 'DELETE',
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
      expect(body.message).toBe('Pet deleted successfully');

      // Verify soft-delete: UPDATE pets SET deleted_at = CURRENT_TIMESTAMP
      const deleteCall = (query as any).mock.calls[0];
      expect(deleteCall[0]).toContain('deleted_at');
      expect(deleteCall[0]).toContain('CURRENT_TIMESTAMP');
    });

    it('owner cannot delete another owner\'s pet', async () => {
      (requireAuth as any).mockResolvedValue(mockOwner);

      // rowCount 0 because AND owner_id = $2 blocks deletion
      (query as any).mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      });

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/pets/other-pet-id',
        httpMethod: 'DELETE',
      });

      const result = await handler(event);
      const body = parseBody(result);

      // rowCount 0 → throw 'Pet not found or access denied'
      expect(result.statusCode).toBe(404);
      expect(body.error).toContain('Pet not found or access denied');
    });

    it('deleted pet excluded from list queries', async () => {
      (requireAuth as any).mockResolvedValue(mockOwner);

      // List returns empty because deleted_at IS NULL filters deleted pets
      (query as any).mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      });

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/pets',
        httpMethod: 'GET',
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
      expect(body).toHaveLength(0);

      // Verify the query includes deleted_at IS NULL
      const queryCall = (query as any).mock.calls[0];
      expect(queryCall[0]).toContain('deleted_at IS NULL');
    });
  });

  // ─── Unknown route ────────────────────────────────────────────────────

  describe('Unknown routes', () => {
    it('returns 404 for unknown paths', async () => {
      (requireAuth as any).mockResolvedValue(mockOwner);

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/pets/unknown/route/here',
        httpMethod: 'GET',
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(404);
      expect(body.error).toBe('Route not found');
    });
  });
});