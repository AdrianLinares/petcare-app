/**
 * Users Endpoint Tests — AUDIT-4.2.1
 *
 * Tests the users handler (users.ts) with module-level mocks for
 * database, bcrypt, jsonwebtoken, and auth utilities.
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
      userId: 'user-1',
      email: 'test@example.com',
      userType: 'pet_owner',
    }),
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('$2b$10$mockhash'),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

// ─── Imports (after mocks are registered) ──────────────────────────────

import { query } from '../utils/database';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { handler } from '../users';

// ─── Helpers ───────────────────────────────────────────────────────────

function parseBody(response: { body: string }) {
  return JSON.parse(response.body);
}

/** Standard pet_owner user row returned by getUserFromToken DB query */
const ownerAuthRow = {
  id: 'owner-1',
  email: 'owner@example.com',
  password_hash: '$2b$10$hash',
  full_name: 'Pet Owner',
  phone: '555-0100',
  user_type: 'pet_owner',
  access_level: 'standard',
  address: null,
  specialization: null,
  license_number: null,
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
};

/** Standard admin user row returned by getUserFromToken DB query */
const adminAuthRow = {
  id: 'admin-1',
  email: 'admin@example.com',
  password_hash: '$2b$10$hash',
  full_name: 'Admin User',
  phone: '555-0200',
  user_type: 'administrator',
  access_level: 'super_admin',
  address: null,
  specialization: null,
  license_number: null,
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
};

/** Vet user row */
const vetAuthRow = {
  id: 'vet-1',
  email: 'vet@example.com',
  password_hash: '$2b$10$hash',
  full_name: 'Dr. Vet',
  phone: '555-0300',
  user_type: 'veterinarian',
  access_level: 'standard',
  address: null,
  specialization: 'Surgery',
  license_number: 'VET-123',
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
};

/**
 * Set up jwt.verify to return the specified user type.
 * This controls what requireAuth / requireAdmin sees from the token.
 */
function setJwtUser(userType: 'pet_owner' | 'administrator' | 'veterinarian', overrides: Record<string, any> = {}) {
  const base = userType === 'administrator'
    ? { userId: 'admin-1', email: 'admin@example.com', userType: 'administrator' }
    : userType === 'veterinarian'
      ? { userId: 'vet-1', email: 'vet@example.com', userType: 'veterinarian' }
      : { userId: 'owner-1', email: 'owner@example.com', userType: 'pet_owner' };

  (jwt.verify as any).mockReturnValue({ ...base, ...overrides });
}

/**
 * Queue a DB query result for auth lookups.
 * getUserFromToken does: query('SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL', [decoded.userId])
 */
function mockAuthQuery(userRow: any) {
  (query as any).mockResolvedValueOnce({ rows: [userRow], rowCount: 1 });
}

// ─── Users Handler Tests ────────────────────────────────────────────────

describe('Users Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.DATABASE_URL = 'postgres://test:test@localhost/test';

    (jwt.sign as any).mockReturnValue('mock-jwt-token');
    (bcrypt.compare as any).mockResolvedValue(true);
    (bcrypt.hash as any).mockResolvedValue('$2b$10$mockhash');
  });

  // ─── OPTIONS / CORS ───────────────────────────────────────────────────

  describe('OPTIONS request (CORS)', () => {
    it('returns 200 with CORS headers', async () => {
      const event = mockEvent({
        path: '/.netlify/functions/users',
        httpMethod: 'OPTIONS',
      });
      const result = await handler(event);

      expect(result.statusCode).toBe(200);
      expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      expect(result.headers).toHaveProperty('Access-Control-Allow-Headers');
      expect(result.headers).toHaveProperty('Access-Control-Allow-Methods');
    });
  });

  // ─── GET /users (list) ────────────────────────────────────────────────

  describe('GET /users (list)', () => {
    it('admin can list all users → 200 with users array and pagination', async () => {
      setJwtUser('administrator');
      mockAuthQuery(adminAuthRow);

      const listRow = {
        id: 'user-1',
        email: 'test@example.com',
        full_name: 'Test User',
        phone: '555-0100',
        user_type: 'pet_owner',
        access_level: 'standard',
        created_at: '2025-01-01T00:00:00.000Z',
      };
      (query as any)
        .mockResolvedValueOnce({ rows: [listRow], rowCount: 1 }) // SELECT users list
        .mockResolvedValueOnce({ rows: [{ count: '1' }], rowCount: 1 }); // SELECT COUNT

      const event = mockAuthEvent('admin-token', {
        path: '/.netlify/functions/users',
        httpMethod: 'GET',
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
      expect(body.users).toHaveLength(1);
      expect(body.users[0].email).toBe('test@example.com');
      expect(body.users[0].fullName).toBe('Test User');
      expect(body.pagination).toBeDefined();
      expect(body.pagination.total).toBe(1);
    });

    it('non-admin (pet_owner) cannot list → 403', async () => {
      setJwtUser('pet_owner');
      mockAuthQuery(ownerAuthRow);

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/users',
        httpMethod: 'GET',
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(403);
      expect(body.error).toBe('Administrator access required');
    });

    it('veterinarian listing via userType filter → 200 with vet users', async () => {
      setJwtUser('veterinarian');
      mockAuthQuery(vetAuthRow);

      const vetRow = {
        id: 'vet-1',
        email: 'vet@example.com',
        full_name: 'Dr. Vet',
        phone: '555-0300',
        user_type: 'veterinarian',
        specialization: 'Surgery',
        license_number: 'VET-123',
      };
      (query as any).mockResolvedValueOnce({ rows: [vetRow], rowCount: 1 }); // SELECT veterinarians

      const event = mockAuthEvent('vet-token', {
        path: '/.netlify/functions/users',
        httpMethod: 'GET',
        queryStringParameters: { userType: 'veterinarian' },
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
      expect(body.users).toHaveLength(1);
      expect(body.users[0].userType).toBe('veterinarian');
      expect(body.users[0].fullName).toBe('Dr. Vet');
    });

    it('soft-deleted users excluded from list (empty result)', async () => {
      setJwtUser('administrator');
      mockAuthQuery(adminAuthRow);

      (query as any)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // empty list (all deleted)
        .mockResolvedValueOnce({ rows: [{ count: '0' }], rowCount: 1 }); // count is 0

      const event = mockAuthEvent('admin-token', {
        path: '/.netlify/functions/users',
        httpMethod: 'GET',
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
      expect(body.users).toHaveLength(0);
      expect(body.pagination.total).toBe(0);
    });
  });

  // ─── GET /users/:id (single) ──────────────────────────────────────────

  describe('GET /users/:id', () => {
    it('admin can get user by ID → 200 with user object', async () => {
      setJwtUser('administrator');
      mockAuthQuery(adminAuthRow);

      const userRow = {
        id: 'user-2',
        email: 'other@example.com',
        full_name: 'Other User',
        phone: '555-0400',
        user_type: 'pet_owner',
        access_level: 'standard',
        address: '123 Main St',
        specialization: null,
        license_number: null,
        created_at: '2025-02-01T00:00:00.000Z',
      };
      (query as any).mockResolvedValueOnce({ rows: [userRow], rowCount: 1 });

      const event = mockAuthEvent('admin-token', {
        path: '/.netlify/functions/users/user-2',
        httpMethod: 'GET',
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
      expect(body.id).toBe('user-2');
      expect(body.email).toBe('other@example.com');
      expect(body.fullName).toBe('Other User');
      expect(body.address).toBe('123 Main St');
    });

    it('non-admin cannot get other user → 403', async () => {
      setJwtUser('pet_owner');
      mockAuthQuery(ownerAuthRow);

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/users/some-other-id',
        httpMethod: 'GET',
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(403);
      expect(body.error).toBe('Administrator access required');
    });

    it('nonexistent user → 404', async () => {
      setJwtUser('administrator');
      mockAuthQuery(adminAuthRow);

      (query as any).mockResolvedValueOnce({ rows: [], rowCount: 0 });

      const event = mockAuthEvent('admin-token', {
        path: '/.netlify/functions/users/nonexistent-id',
        httpMethod: 'GET',
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(404);
      expect(body.error).toBe('User not found');
    });
  });

  // ─── GET /users/me ────────────────────────────────────────────────────

  describe('GET /users/me', () => {
    it('user can get own profile → 200', async () => {
      setJwtUser('pet_owner');
      // GET /me calls requireAuth first (1 query), then a separate SELECT for user data (1 query)
      (query as any)
        .mockResolvedValueOnce({ rows: [ownerAuthRow], rowCount: 1 }) // auth lookup via getUserFromToken
        .mockResolvedValueOnce({ rows: [{
          id: 'owner-1',
          email: 'owner@example.com',
          full_name: 'Pet Owner',
          phone: '555-0100',
          user_type: 'pet_owner',
          access_level: 'standard',
          address: null,
          specialization: null,
          license_number: null,
          created_at: '2025-01-01T00:00:00.000Z',
        }], rowCount: 1 }); // SELECT profile data

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/users/me',
        httpMethod: 'GET',
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
      expect(body.id).toBe('owner-1');
      expect(body.email).toBe('owner@example.com');
      expect(body.fullName).toBe('Pet Owner');
    });
  });

  // ─── POST /users (create) ────────────────────────────────────────────

  describe('POST /users (create)', () => {
    it('admin can create user → 201 with user object', async () => {
      setJwtUser('administrator');
      mockAuthQuery(adminAuthRow);

      const newUserRow = {
        id: 'new-user-1',
        email: 'newuser@example.com',
        full_name: 'New User',
        phone: '555-0500',
        user_type: 'pet_owner',
        access_level: 'standard',
        created_at: '2025-03-01T00:00:00.000Z',
      };

      (query as any)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // email uniqueness check
        .mockResolvedValueOnce({ rows: [newUserRow], rowCount: 1 }); // INSERT

      const event = mockAuthEvent('admin-token', {
        path: '/.netlify/functions/users',
        httpMethod: 'POST',
        body: JSON.stringify({
          email: 'newuser@example.com',
          password: 'password123',
          fullName: 'New User',
          phone: '555-0500',
          userType: 'pet_owner',
        }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(201);
      expect(body.id).toBe('new-user-1');
      expect(body.email).toBe('newuser@example.com');
      expect(body.fullName).toBe('New User');
      expect(body.userType).toBe('pet_owner');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('duplicate email → 409', async () => {
      setJwtUser('administrator');
      mockAuthQuery(adminAuthRow);

      (query as any).mockResolvedValueOnce({ rows: [{ id: 'existing-user' }], rowCount: 1 }); // email exists

      const event = mockAuthEvent('admin-token', {
        path: '/.netlify/functions/users',
        httpMethod: 'POST',
        body: JSON.stringify({
          email: 'existing@example.com',
          password: 'password123',
          fullName: 'Duplicate User',
          phone: '555-0600',
          userType: 'pet_owner',
        }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(409);
      expect(body.error).toContain('already exists');
    });

    it('missing required fields → error', async () => {
      setJwtUser('administrator');
      mockAuthQuery(adminAuthRow);

      const event = mockAuthEvent('admin-token', {
        path: '/.netlify/functions/users',
        httpMethod: 'POST',
        body: JSON.stringify({ email: 'incomplete@example.com' }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(body.error).toBe('Missing required fields');
    });

    it('non-admin cannot create user → 403', async () => {
      setJwtUser('pet_owner');
      mockAuthQuery(ownerAuthRow);

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/users',
        httpMethod: 'POST',
        body: JSON.stringify({
          email: 'unauthorized@example.com',
          password: 'password123',
          fullName: 'Unauthorized',
          phone: '555-0700',
          userType: 'pet_owner',
        }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(403);
      expect(body.error).toBe('Administrator access required');
    });
  });

  // ─── PATCH /users/:id (update) ────────────────────────────────────────

  describe('PATCH /users/:id (update)', () => {
    it('admin can update user → 200 with updated data', async () => {
      setJwtUser('administrator');
      mockAuthQuery(adminAuthRow);

      const updatedRow = {
        id: 'user-2',
        email: 'updated@example.com',
        full_name: 'Updated Name',
        phone: '555-0800',
        user_type: 'pet_owner',
        access_level: 'standard',
        address: '456 New St',
        specialization: null,
        license_number: null,
      };

      (query as any).mockResolvedValueOnce({ rows: [updatedRow], rowCount: 1 }); // UPDATE RETURNING

      const event = mockAuthEvent('admin-token', {
        path: '/.netlify/functions/users/user-2',
        httpMethod: 'PATCH',
        body: JSON.stringify({
          fullName: 'Updated Name',
          phone: '555-0800',
          address: '456 New St',
        }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
      expect(body.fullName).toBe('Updated Name');
      expect(body.phone).toBe('555-0800');
      expect(body.address).toBe('456 New St');
    });

    it('update non-existent user → 404', async () => {
      setJwtUser('administrator');
      mockAuthQuery(adminAuthRow);

      (query as any).mockResolvedValueOnce({ rows: [], rowCount: 0 }); // UPDATE returns nothing

      const event = mockAuthEvent('admin-token', {
        path: '/.netlify/functions/users/nonexistent-id',
        httpMethod: 'PATCH',
        body: JSON.stringify({ fullName: 'New Name' }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(404);
      expect(body.error).toBe('User not found');
    });

    it('update with no fields → error', async () => {
      setJwtUser('administrator');
      mockAuthQuery(adminAuthRow);

      const event = mockAuthEvent('admin-token', {
        path: '/.netlify/functions/users/user-2',
        httpMethod: 'PATCH',
        body: JSON.stringify({}),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(body.error).toBe('No fields to update');
    });
  });

  // ─── DELETE /users/:id (soft delete) ──────────────────────────────────

  describe('DELETE /users/:id (soft delete)', () => {
    it('super_admin can delete user → 200', async () => {
      setJwtUser('administrator');
      // requireAdmin checks: userType='administrator' AND access_level >= required
      // DELETE uses requireAdmin(event, 'super_admin') which needs access_level='super_admin'
      (query as any)
        .mockResolvedValueOnce({ rows: [adminAuthRow], rowCount: 1 }) // auth lookup
        .mockResolvedValueOnce({ rows: [], rowCount: 1 }); // UPDATE SET deleted_at

      const event = mockAuthEvent('admin-token', {
        path: '/.netlify/functions/users/user-2',
        httpMethod: 'DELETE',
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
      expect(body.message).toBe('User deleted successfully');

      // Verify the soft-delete query uses CURRENT_TIMESTAMP
      const deleteCall = (query as any).mock.calls.find((call: any[]) =>
        call[0].includes('deleted_at') && call[0].includes('CURRENT_TIMESTAMP')
      );
      expect(deleteCall).toBeDefined();
    });

    it('delete non-existent user still returns 200 (soft delete is idempotent)', async () => {
      setJwtUser('administrator');
      (query as any)
        .mockResolvedValueOnce({ rows: [adminAuthRow], rowCount: 1 }) // auth lookup
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // UPDATE on non-existent user

      const event = mockAuthEvent('admin-token', {
        path: '/.netlify/functions/users/nonexistent-id',
        httpMethod: 'DELETE',
      });

      const result = await handler(event);
      const body = parseBody(result);

      // Handler doesn't check rowCount for DELETE — returns 200 regardless
      expect(result.statusCode).toBe(200);
      expect(body.message).toBe('User deleted successfully');
    });

    it('regular admin (non-super_admin) cannot delete → 403', async () => {
      setJwtUser('administrator');
      const standardAdminRow = { ...adminAuthRow, access_level: 'standard' };
      (query as any).mockResolvedValueOnce({ rows: [standardAdminRow], rowCount: 1 }); // auth lookup

      const event = mockAuthEvent('admin-token', {
        path: '/.netlify/functions/users/user-2',
        httpMethod: 'DELETE',
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(403);
      expect(body.error).toContain('Insufficient admin privileges');
    });

    it('non-admin user cannot delete → 403', async () => {
      setJwtUser('pet_owner');
      mockAuthQuery(ownerAuthRow);

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/users/user-2',
        httpMethod: 'DELETE',
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(403);
      expect(body.error).toContain('Administrator access required');
    });
  });

  // ─── PATCH /users/me (update own profile) ─────────────────────────────

  describe('PATCH /users/me (update own profile)', () => {
    it('user can update their own profile → 200', async () => {
      setJwtUser('pet_owner');
      // PATCH /me: requireAuth (1 query) + UPDATE (1 query)
      (query as any)
        .mockResolvedValueOnce({ rows: [ownerAuthRow], rowCount: 1 }) // auth lookup
        .mockResolvedValueOnce({ rows: [{
          id: 'owner-1',
          email: 'owner@example.com',
          full_name: 'Updated Owner',
          phone: '555-9999',
          user_type: 'pet_owner',
          access_level: 'standard',
          address: 'New Address',
          specialization: null,
          license_number: null,
        }], rowCount: 1 }); // UPDATE RETURNING

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/users/me',
        httpMethod: 'PATCH',
        body: JSON.stringify({
          fullName: 'Updated Owner',
          phone: '555-9999',
          address: 'New Address',
        }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
      expect(body.fullName).toBe('Updated Owner');
      expect(body.phone).toBe('555-9999');
      expect(body.address).toBe('New Address');
    });
  });

  // ─── POST /users/me/change-password ────────────────────────────────────

  describe('POST /users/me/change-password', () => {
    it('user can change password with valid current password → 200', async () => {
      setJwtUser('pet_owner');
      // requireAuth (1 query) + fetch password hash (1 query) + UPDATE password (1 query)
      (query as any)
        .mockResolvedValueOnce({ rows: [ownerAuthRow], rowCount: 1 }) // auth lookup via getUserFromToken
        .mockResolvedValueOnce({ rows: [{ password_hash: '$2b$10$hash' }], rowCount: 1 }) // fetch current hash
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // UPDATE password

      (bcrypt.compare as any).mockResolvedValue(true);
      (bcrypt.hash as any).mockResolvedValue('$2b$10$newhash');

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/users/me/change-password',
        httpMethod: 'POST',
        body: JSON.stringify({
          currentPassword: 'oldpassword',
          newPassword: 'newpassword123',
        }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
      expect(body.message).toBe('Password changed successfully');
      expect(bcrypt.compare).toHaveBeenCalledWith('oldpassword', '$2b$10$hash');
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
    });

    it('rejects change with wrong current password → error', async () => {
      setJwtUser('pet_owner');
      (query as any)
        .mockResolvedValueOnce({ rows: [ownerAuthRow], rowCount: 1 }) // auth lookup
        .mockResolvedValueOnce({ rows: [{ password_hash: '$2b$10$hash' }], rowCount: 1 }); // fetch hash

      (bcrypt.compare as any).mockResolvedValue(false);

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/users/me/change-password',
        httpMethod: 'POST',
        body: JSON.stringify({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123',
        }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(body.error).toBe('Current password is incorrect');
    });

    it('rejects password shorter than 8 characters → error', async () => {
      setJwtUser('pet_owner');
      (query as any).mockResolvedValueOnce({ rows: [ownerAuthRow], rowCount: 1 }); // auth lookup only — error thrown before 2nd query

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/users/me/change-password',
        httpMethod: 'POST',
        body: JSON.stringify({
          currentPassword: 'oldpassword',
          newPassword: 'short',
        }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(body.error).toBe('New password must be at least 8 characters');
    });

    it('rejects missing currentPassword → error', async () => {
      setJwtUser('pet_owner');
      (query as any).mockResolvedValueOnce({ rows: [ownerAuthRow], rowCount: 1 }); // auth lookup

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/users/me/change-password',
        httpMethod: 'POST',
        body: JSON.stringify({
          newPassword: 'newpassword123',
        }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(body.error).toBe('Current and new passwords are required');
    });
  });

  // ─── Unknown route ────────────────────────────────────────────────────

  describe('Unknown routes', () => {
    it('returns 404 for unknown paths', async () => {
      setJwtUser('pet_owner');
      mockAuthQuery(ownerAuthRow);

      const event = mockAuthEvent('owner-token', {
        path: '/.netlify/functions/users/unknown/route/here',
        httpMethod: 'GET',
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(404);
      expect(body.error).toBe('Route not found');
    });
  });
});