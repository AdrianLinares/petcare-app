/**
 * Auth Endpoint Tests — Slice 4.1 of the full codebase audit.
 *
 * Tests the auth handler (auth.ts) and auth utility functions (utils/auth.ts)
 * with module-level mocks for database, bcrypt, jsonwebtoken, and notifications.
 *
 * NO production code is modified — this file adds test coverage only.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockEvent, mockAuthEvent } from './helpers';

// ─── Module Mocks ─────────────────────────────────────────────────────
// Mocked before imports so the module system resolves our mocks first.

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
    decode: vi.fn().mockReturnValue({
      userId: 'user-1',
      email: 'test@example.com',
      userType: 'pet_owner',
      jti: 'decoded-jti',
      exp: Math.floor(Date.now() / 1000) + 3600,
    }),
  },
}));

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('$2b$10$mockhash'),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock('../utils/notifications', () => ({
  sendWelcomeNotification: vi.fn().mockResolvedValue(undefined),
  sendPasswordChanged: vi.fn().mockResolvedValue(undefined),
}));

// ─── Imports (after mocks are registered) ──────────────────────────────

import { query } from '../utils/database';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { handler } from '../auth';
import { getUserFromToken, requireAuth, requireRole, requireAdmin } from '../utils/auth';
import { sendWelcomeNotification, sendPasswordChanged } from '../utils/notifications';

// ─── Helpers ───────────────────────────────────────────────────────────

function parseBody(response: { body: string }) {
  return JSON.parse(response.body);
}

/** Standard user row returned by database queries in auth handler */
const mockUserRow = {
  id: 'user-1',
  email: 'test@example.com',
  password_hash: '$2b$10$ hashedpassword',
  full_name: 'Test User',
  phone: '555-0100',
  user_type: 'pet_owner',
  access_level: 'standard',
  address: null,
  specialization: null,
  license_number: null,
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
};

/** Admin user row for requireAdmin tests */
const mockAdminRow = {
  id: 'admin-1',
  email: 'admin@example.com',
  full_name: 'Admin User',
  phone: '555-0100',
  user_type: 'administrator',
  access_level: 'super_admin',
  address: null,
  specialization: null,
  license_number: null,
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
};

// ─── Auth Handler Tests ────────────────────────────────────────────────

describe('Auth Handler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.DATABASE_URL = 'postgres://test:test@localhost/test';

    // Reset default mock implementations after clearing
    (jwt.sign as any).mockReturnValue('mock-jwt-token');
    (jwt.verify as any).mockReturnValue({
      userId: 'user-1',
      email: 'test@example.com',
      userType: 'pet_owner',
    });
    (jwt.decode as any).mockReturnValue({
      userId: 'user-1',
      email: 'test@example.com',
      userType: 'pet_owner',
      jti: 'decoded-jti',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
    (bcrypt.compare as any).mockResolvedValue(true);
    (bcrypt.hash as any).mockResolvedValue('$2b$10$mockhash');
    (sendWelcomeNotification as any).mockResolvedValue(undefined);
    (sendPasswordChanged as any).mockResolvedValue(undefined);
  });

  // ─── OPTIONS / CORS ──────────────────────────────────────────────────

  describe('OPTIONS request (CORS)', () => {
    it('returns 200 with CORS headers', async () => {
      const event = mockEvent({ httpMethod: 'OPTIONS' });
      const result = await handler(event);

      expect(result.statusCode).toBe(200);
      expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      expect(result.headers).toHaveProperty('Access-Control-Allow-Headers');
      expect(result.headers).toHaveProperty('Access-Control-Allow-Methods');
    });
  });

  // ─── POST /auth/login ────────────────────────────────────────────────

  describe('POST /auth/login', () => {
    const loginPath = '/.netlify/functions/auth/login';

    function loginEvent(overrides: Record<string, unknown> = {}) {
      return mockEvent({
        path: loginPath,
        httpMethod: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'correct-password', ...overrides }),
      });
    }

    it('returns 200 with user and token on valid credentials', async () => {
      (query as any).mockResolvedValue({ rows: [mockUserRow], rowCount: 1 });
      (bcrypt.compare as any).mockResolvedValue(true);
      (jwt.sign as any).mockReturnValue('mock-jwt-token');

      const result = await handler(loginEvent());
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
      expect(body.token).toBe('mock-jwt-token');
      expect(body.user).toBeDefined();
      expect(body.user.email).toBe('test@example.com');
      expect(body.user.fullName).toBe('Test User');
      expect(body.user.userType).toBe('pet_owner');
      expect(bcrypt.compare).toHaveBeenCalledWith('correct-password', mockUserRow.password_hash);
    });

    it('returns error when password is wrong', async () => {
      (query as any).mockResolvedValue({ rows: [mockUserRow], rowCount: 1 });
      (bcrypt.compare as any).mockResolvedValue(false);

      const result = await handler(loginEvent({ password: 'wrong-password' }));
      const body = parseBody(result);

      // "Invalid email or password" does not match the lowercase 'invalid' check
      // in errorResponse, so it falls through to the default 500.
      expect(result.statusCode).toBe(500);
      expect(body.error).toBe('Invalid email or password');
    });

    it('returns error when user is not found', async () => {
      (query as any).mockResolvedValue({ rows: [], rowCount: 0 });

      const result = await handler(loginEvent({ email: 'nobody@example.com' }));
      const body = parseBody(result);

      expect(result.statusCode).toBe(500);
      expect(body.error).toBe('Invalid email or password');
    });

    it('returns error when user is soft-deleted (deleted_at is set)', async () => {
      // The login query uses WHERE deleted_at IS NULL, so soft-deleted
      // users are filtered at the DB level — query returns no rows.
      (query as any).mockResolvedValue({ rows: [], rowCount: 0 });

      const result = await handler(loginEvent({ email: 'deleted@example.com' }));
      const body = parseBody(result);

      expect(result.statusCode).toBe(500);
      expect(body.error).toBe('Invalid email or password');
    });

    it('returns error when email is missing', async () => {
      const event = mockEvent({
        path: loginPath,
        httpMethod: 'POST',
        body: JSON.stringify({ password: 'some-password' }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(500);
      expect(body.error).toBe('Email and password are required');
    });

    it('returns error when password is missing', async () => {
      const event = mockEvent({
        path: loginPath,
        httpMethod: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(500);
      expect(body.error).toBe('Email and password are required');
    });
  });

  // ─── POST /auth/register ──────────────────────────────────────────────

  describe('POST /auth/register', () => {
    const registerPath = '/.netlify/functions/auth/register';

    const newUserRow = {
      id: 'new-user-1',
      email: 'newuser@example.com',
      full_name: 'New User',
      phone: '555-0200',
      user_type: 'pet_owner',
      address: null,
      specialization: null,
      license_number: null,
      created_at: '2025-01-01T00:00:00.000Z',
    };

    it('creates a new user and returns 201 with token', async () => {
      (query as any)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // email uniqueness check
        .mockResolvedValueOnce({ rows: [newUserRow], rowCount: 1 }); // INSERT
      (bcrypt.hash as any).mockResolvedValue('$2b$10$hashedpassword');
      (jwt.sign as any).mockReturnValue('mock-jwt-token');

      const event = mockEvent({
        path: registerPath,
        httpMethod: 'POST',
        body: JSON.stringify({
          email: 'newuser@example.com',
          password: 'password123',
          fullName: 'New User',
          phone: '555-0200',
          userType: 'pet_owner',
        }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(201);
      expect(body.token).toBe('mock-jwt-token');
      expect(body.user).toBeDefined();
      expect(body.user.email).toBe('newuser@example.com');
      expect(body.user.fullName).toBe('New User');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('returns 409 when email already exists', async () => {
      (query as any).mockResolvedValueOnce({
        rows: [{ id: 'existing-user' }],
        rowCount: 1,
      });

      const event = mockEvent({
        path: registerPath,
        httpMethod: 'POST',
        body: JSON.stringify({
          email: 'existing@example.com',
          password: 'password123',
          fullName: 'Existing User',
          phone: '555-0300',
          userType: 'pet_owner',
        }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      // errorResponse maps "already exists" → 409
      expect(result.statusCode).toBe(409);
      expect(body.error).toContain('already exists');
    });

    it('returns error when required fields are missing', async () => {
      const event = mockEvent({
        path: registerPath,
        httpMethod: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(body.error).toBe('Missing required fields');
    });

    it('returns error when userType is invalid', async () => {
      const event = mockEvent({
        path: registerPath,
        httpMethod: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          fullName: 'Test User',
          phone: '555-0100',
          userType: 'hacker',
        }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(body.error).toBe('Invalid user type');
    });
  });

  // ─── POST /auth/forgot-password ───────────────────────────────────────

  describe('POST /auth/forgot-password', () => {
    const forgotPath = '/.netlify/functions/auth/forgot-password';

    it('returns success for valid email', async () => {
      (query as any)
        .mockResolvedValueOnce({
          rows: [{ id: 'user-1', email: 'test@example.com', full_name: 'Test User' }],
          rowCount: 1,
        })
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // INSERT token

      const event = mockEvent({
        path: forgotPath,
        httpMethod: 'POST',
        body: JSON.stringify({ email: 'test@example.com' }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
      expect(body.message).toContain('password reset');
      expect(query).toHaveBeenCalledTimes(2); // SELECT user + INSERT token
    });

    it('returns same success message for nonexistent email (prevents enumeration)', async () => {
      (query as any).mockResolvedValueOnce({ rows: [], rowCount: 0 });

      const event = mockEvent({
        path: forgotPath,
        httpMethod: 'POST',
        body: JSON.stringify({ email: 'nonexistent@example.com' }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      // Deliberate anti-enumeration: same response regardless of email existence
      expect(result.statusCode).toBe(200);
      expect(body.message).toContain('password reset');
    });

    it('returns error when email is missing', async () => {
      const event = mockEvent({
        path: forgotPath,
        httpMethod: 'POST',
        body: JSON.stringify({}),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(body.error).toBe('Email is required');
    });
  });

  // ─── POST /auth/reset-password ─────────────────────────────────────────

  describe('POST /auth/reset-password', () => {
    const resetPath = '/.netlify/functions/auth/reset-password';

    const resetTokenRow = {
      id: 'token-1',
      user_id: 'user-1',
      email: 'test@example.com',
      token: 'valid-reset-token',
      used: false,
      expires_at: new Date(Date.now() + 3600000).toISOString(),
    };

    it('resets password with valid token', async () => {
      (query as any)
        .mockResolvedValueOnce({ rows: [resetTokenRow], rowCount: 1 }) // find token
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // update password
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // mark token used
        .mockResolvedValueOnce({ rows: [{ email: 'test@example.com' }], rowCount: 1 }); // get user email
      (bcrypt.hash as any).mockResolvedValue('$2b$10$newhashedpassword');

      const event = mockEvent({
        path: resetPath,
        httpMethod: 'POST',
        body: JSON.stringify({ token: 'valid-reset-token', password: 'newpassword123' }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
      expect(body.message).toBe('Password reset successful');
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
    });

    it('returns error when token is invalid or expired', async () => {
      (query as any).mockResolvedValueOnce({ rows: [], rowCount: 0 }); // token not found

      const event = mockEvent({
        path: resetPath,
        httpMethod: 'POST',
        body: JSON.stringify({ token: 'expired-token', password: 'newpassword123' }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      // errorResponse maps "Invalid or expired token" exact match → 401
      expect(result.statusCode).toBe(401);
      expect(body.error).toBe('Invalid or expired token');
    });

    it('returns error when token is missing', async () => {
      const event = mockEvent({
        path: resetPath,
        httpMethod: 'POST',
        body: JSON.stringify({ password: 'newpassword123' }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(body.error).toBe('Token and password are required');
    });

    it('returns error when password is missing', async () => {
      const event = mockEvent({
        path: resetPath,
        httpMethod: 'POST',
        body: JSON.stringify({ token: 'some-token' }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(body.error).toBe('Token and password are required');
    });

    it('returns error when password is too short', async () => {
      const event = mockEvent({
        path: resetPath,
        httpMethod: 'POST',
        body: JSON.stringify({ token: 'some-token', password: 'short' }),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(body.error).toBe('Password must be at least 8 characters');
    });
  });

  // ─── Unknown route ────────────────────────────────────────────────────

  describe('Unknown routes', () => {
    it('returns 404 for unknown paths', async () => {
      const event = mockEvent({
        path: '/.netlify/functions/auth/unknown-route',
        httpMethod: 'POST',
        body: JSON.stringify({}),
      });

      const result = await handler(event);
      const body = parseBody(result);

      // errorResponse is called with (Error, 404), message "Route not found"
      // also matches .includes('not found') → 404
      expect(result.statusCode).toBe(404);
      expect(body.error).toBe('Route not found');
    });
  });

  // ─── POST /auth/logout ──────────────────────────────────────────────────

  describe('POST /auth/logout', () => {
    const logoutPath = '/.netlify/functions/auth/logout';

    it('blacklists the token and returns 200 on successful logout', async () => {
      const decodedToken = {
        userId: 'user-1',
        email: 'test@example.com',
        userType: 'pet_owner',
        jti: 'unique-jti-123',
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      };

      // requireAuth → getUserFromToken: blacklist check (empty = not blacklisted), then user lookup
      (jwt.verify as any).mockReturnValue(decodedToken);
      (query as any)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // blacklist check → not blacklisted
        .mockResolvedValueOnce({ rows: [mockUserRow], rowCount: 1 }) // user lookup
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // blacklist INSERT

      // jwt.decode needs to return the token payload (including jti)
      (jwt.decode as any).mockReturnValue(decodedToken);

      const event = mockAuthEvent('valid-jwt-with-jti', {
        path: logoutPath,
        httpMethod: 'POST',
        body: JSON.stringify({}),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
      expect(body.message).toContain('Logged out');
      // Verify blacklist insert was called with jti, user id, and expiration
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('token_blacklist'),
        expect.arrayContaining(['unique-jti-123', 'user-1']),
      );
    });

    it('returns 401 when no Authorization header is provided', async () => {
      const event = mockEvent({
        path: logoutPath,
        httpMethod: 'POST',
        body: JSON.stringify({}),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(401);
      expect(body.error).toBe('Authentication required');
    });

    it('still returns 200 even when token has no jti (graceful degradation)', async () => {
      const decodedToken = {
        userId: 'user-1',
        email: 'test@example.com',
        userType: 'pet_owner',
        // no jti field — tokens issued before blacklist feature
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      (jwt.verify as any).mockReturnValue(decodedToken);
      // No jti → no blacklist check, just user lookup
      (query as any)
        .mockResolvedValueOnce({ rows: [mockUserRow], rowCount: 1 }); // user lookup only

      (jwt.decode as any).mockReturnValue(decodedToken);

      const event = mockAuthEvent('valid-jwt-no-jti', {
        path: logoutPath,
        httpMethod: 'POST',
        body: JSON.stringify({}),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(200);
      expect(body.message).toContain('Logged out');
    });

    it('returns 500 when blacklist insert fails', async () => {
      const decodedToken = {
        userId: 'user-1',
        email: 'test@example.com',
        userType: 'pet_owner',
        jti: 'unique-jti-456',
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      (jwt.verify as any).mockReturnValue(decodedToken);
      (query as any)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // blacklist check → not blacklisted
        .mockResolvedValueOnce({ rows: [mockUserRow], rowCount: 1 }) // user lookup
        .mockRejectedValueOnce(new Error('DB connection lost')); // blacklist INSERT fails

      (jwt.decode as any).mockReturnValue(decodedToken);

      const event = mockAuthEvent('valid-jwt-with-jti', {
        path: logoutPath,
        httpMethod: 'POST',
        body: JSON.stringify({}),
      });

      const result = await handler(event);
      const body = parseBody(result);

      expect(result.statusCode).toBe(500);
      expect(body.error).toBe('Logout failed');
    });
  });
});

// ─── Auth Utility Function Tests ───────────────────────────────────────

describe('Auth Utility Functions', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.JWT_SECRET = 'test-jwt-secret';

    // Reset default mock implementations
    (jwt.verify as any).mockReturnValue({
      userId: 'user-1',
      email: 'test@example.com',
      userType: 'pet_owner',
    });
    (jwt.decode as any).mockReturnValue({
      userId: 'user-1',
      email: 'test@example.com',
      userType: 'pet_owner',
      jti: 'decoded-jti',
      exp: Math.floor(Date.now() / 1000) + 3600,
    });
  });

  // ─── getUserFromToken ─────────────────────────────────────────────────

  describe('getUserFromToken', () => {
    const userRow = {
      id: 'user-1',
      email: 'test@example.com',
      full_name: 'Test User',
      phone: '555-0100',
      user_type: 'pet_owner',
      access_level: 'standard',
      address: null,
      specialization: null,
      license_number: null,
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z',
    };

    it('returns user when JWT is valid and user exists in database', async () => {
      (jwt.verify as any).mockReturnValue({
        userId: 'user-1',
        email: 'test@example.com',
        userType: 'pet_owner',
      });
      (query as any).mockResolvedValue({ rows: [userRow], rowCount: 1 });

      const event = mockAuthEvent('valid-jwt-token');
      const user = await getUserFromToken(event);

      expect(user).not.toBeNull();
      expect(user!.id).toBe('user-1');
      expect(user!.email).toBe('test@example.com');
      expect(user!.fullName).toBe('Test User');
      expect(user!.userType).toBe('pet_owner');
      // Verify query uses the decoded userId
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at IS NULL'),
        ['user-1'],
      );
    });

    it('returns null when JWT verification fails (tampered/expired)', async () => {
      (jwt.verify as any).mockImplementation(() => {
        throw new Error('jwt expired');
      });

      const event = mockAuthEvent('tampered-or-expired-token');
      const user = await getUserFromToken(event);

      expect(user).toBeNull();
    });

    it('returns null when no Authorization header is present', async () => {
      const event = mockEvent(); // no auth header
      const user = await getUserFromToken(event);

      expect(user).toBeNull();
    });

    it('returns null when user is soft-deleted (deleted_at is set)', async () => {
      (jwt.verify as any).mockReturnValue({
        userId: 'deleted-user',
        email: 'deleted@example.com',
        userType: 'pet_owner',
      });
      // The query uses WHERE deleted_at IS NULL → returns no rows for deleted users
      (query as any).mockResolvedValue({ rows: [], rowCount: 0 });

      const event = mockAuthEvent('valid-but-deleted-user-token');
      const user = await getUserFromToken(event);

      expect(user).toBeNull();
    });

    // ─── Token Blacklist Tests ────────────────────────────────────────────

    it('returns null when token jti is in the blacklist', async () => {
      (jwt.verify as any).mockReturnValue({
        userId: 'user-1',
        email: 'test@example.com',
        userType: 'pet_owner',
        jti: 'blacklisted-jti-abc',
      });
      // First call: blacklist check returns a row (token is blacklisted)
      (query as any).mockResolvedValue({ rows: [{ id: 'bl-entry-1' }], rowCount: 1 });

      const event = mockAuthEvent('blacklisted-token');
      const user = await getUserFromToken(event);

      expect(user).toBeNull();
      // Verify the blacklist query was called with the jti
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('token_blacklist'),
        expect.arrayContaining(['blacklisted-jti-abc']),
      );
    });

    it('returns user when token jti is NOT in the blacklist', async () => {
      (jwt.verify as any).mockReturnValue({
        userId: 'user-1',
        email: 'test@example.com',
        userType: 'pet_owner',
        jti: 'valid-jti-xyz',
      });
      // First call: blacklist check returns empty (token is NOT blacklisted)
      // Second call: user lookup returns the user
      (query as any)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 })   // blacklist check — not found
        .mockResolvedValueOnce({ rows: [userRow], rowCount: 1 }); // user lookup

      const event = mockAuthEvent('valid-token-with-jti');
      const user = await getUserFromToken(event);

      expect(user).not.toBeNull();
      expect(user!.id).toBe('user-1');
    });

    it('skips blacklist check when token has no jti and proceeds normally', async () => {
      (jwt.verify as any).mockReturnValue({
        userId: 'user-1',
        email: 'test@example.com',
        userType: 'pet_owner',
        // no jti field — tokens issued before blacklist feature
      });
      (query as any).mockResolvedValue({ rows: [userRow], rowCount: 1 });

      const event = mockAuthEvent('legacy-token-no-jti');
      const user = await getUserFromToken(event);

      expect(user).not.toBeNull();
      expect(user!.id).toBe('user-1');
      // Only the user lookup query should be called (no blacklist check for tokens without jti)
    });

    // ─── Token Blacklist Resilience Tests ──────────────────────────────────

    it('proceeds with auth when blacklist query throws (table missing)', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      (jwt.verify as any).mockReturnValue({
        userId: 'user-1',
        email: 'test@example.com',
        userType: 'pet_owner',
        jti: 'valid-jti-resilience',
      });
      // First call: blacklist check THROWS (table doesn't exist)
      // Second call: user lookup succeeds
      (query as any)
        .mockRejectedValueOnce(new Error('relation "token_blacklist" does not exist'))
        .mockResolvedValueOnce({ rows: [userRow], rowCount: 1 });

      const event = mockAuthEvent('token-with-jti-but-no-table');
      const user = await getUserFromToken(event);

      expect(user).not.toBeNull();
      expect(user!.id).toBe('user-1');
      expect(warnSpy).toHaveBeenCalledWith(
        'token_blacklist check failed (table may not exist):',
        expect.any(Error)
      );
      warnSpy.mockRestore();
    });

    it('proceeds with auth when blacklist query throws generic DB error', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      (jwt.verify as any).mockReturnValue({
        userId: 'user-1',
        email: 'test@example.com',
        userType: 'pet_owner',
        jti: 'valid-jti-db-error',
      });
      (query as any)
        .mockRejectedValueOnce(new Error('connection refused'))
        .mockResolvedValueOnce({ rows: [userRow], rowCount: 1 });

      const event = mockAuthEvent('token-with-jti-db-err');
      const user = await getUserFromToken(event);

      expect(user).not.toBeNull();
      expect(user!.id).toBe('user-1');
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it('still blocks auth when blacklist query succeeds AND token IS blacklisted', async () => {
      (jwt.verify as any).mockReturnValue({
        userId: 'user-1',
        email: 'test@example.com',
        userType: 'pet_owner',
        jti: 'actually-blacklisted-jti',
      });
      // Blacklist check succeeds and finds the token
      (query as any).mockResolvedValueOnce({ rows: [{ id: 'bl-1' }], rowCount: 1 });

      const event = mockAuthEvent('blacklisted-token-even-with-resilience');
      const user = await getUserFromToken(event);

      expect(user).toBeNull();
    });
  });

  // ─── ensureBlacklistTable ────────────────────────────────────────────────

  describe('ensureBlacklistTable', () => {
    it('calls query with CREATE TABLE IF NOT EXISTS on module load', async () => {
      const { ensureBlacklistTable } = await import('../utils/auth');

      (query as any).mockResolvedValueOnce({ rows: [], rowCount: 0 });

      await ensureBlacklistTable();

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS token_blacklist')
      );
    });

    it('does not throw when CREATE TABLE fails', async () => {
      const { ensureBlacklistTable } = await import('../utils/auth');

      (query as any).mockRejectedValueOnce(new Error('permission denied'));

      // Must NOT throw
      await expect(ensureBlacklistTable()).resolves.toBeUndefined();
    });
  });

  // ─── requireAuth ───────────────────────────────────────────────────────

  describe('requireAuth', () => {
    it('returns user when token is valid', async () => {
      (jwt.verify as any).mockReturnValue({
        userId: 'user-1',
        email: 'test@example.com',
        userType: 'pet_owner',
      });
      (query as any).mockResolvedValue({ rows: [mockUserRow], rowCount: 1 });

      const event = mockAuthEvent('valid-jwt-token');
      const user = await requireAuth(event);

      expect(user).toBeDefined();
      expect(user.id).toBe('user-1');
      expect(user.email).toBe('test@example.com');
    });

    it('throws "Authentication required" when token is missing', async () => {
      const event = mockEvent(); // No Authorization header

      await expect(requireAuth(event)).rejects.toThrow('Authentication required');
    });

    it('throws "Authentication required" when token is invalid', async () => {
      (jwt.verify as any).mockImplementation(() => {
        throw new Error('invalid signature');
      });

      const event = mockAuthEvent('invalid-token');

      // getUserFromToken catches the error and returns null,
      // then requireAuth throws 'Authentication required'
      await expect(requireAuth(event)).rejects.toThrow('Authentication required');
    });
  });

  // ─── requireRole ───────────────────────────────────────────────────────

  describe('requireRole', () => {
    const vetRow = {
      id: 'vet-1',
      email: 'vet@example.com',
      full_name: 'Dr. Vet',
      phone: '555-0100',
      user_type: 'veterinarian',
      access_level: 'standard',
      address: null,
      specialization: 'Surgery',
      license_number: 'VET-123',
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z',
    };

    it('returns user when their role matches an allowed role', async () => {
      (jwt.verify as any).mockReturnValue({
        userId: 'vet-1',
        email: 'vet@example.com',
        userType: 'veterinarian',
      });
      (query as any).mockResolvedValue({ rows: [vetRow], rowCount: 1 });

      const event = mockAuthEvent('valid-jwt-token');
      const user = await requireRole(event, 'veterinarian');

      expect(user.userType).toBe('veterinarian');
    });

    it('returns user when their role is in a list of allowed roles', async () => {
      (jwt.verify as any).mockReturnValue({
        userId: 'vet-1',
        email: 'vet@example.com',
        userType: 'veterinarian',
      });
      (query as any).mockResolvedValue({ rows: [vetRow], rowCount: 1 });

      const event = mockAuthEvent('valid-jwt-token');
      const user = await requireRole(event, 'veterinarian', 'administrator');

      expect(user.userType).toBe('veterinarian');
    });

    it('throws "Insufficient permissions" when role does not match', async () => {
      (jwt.verify as any).mockReturnValue({
        userId: 'user-1',
        email: 'test@example.com',
        userType: 'pet_owner',
      });
      (query as any).mockResolvedValue({ rows: [mockUserRow], rowCount: 1 });

      const event = mockAuthEvent('valid-jwt-token');

      await expect(requireRole(event, 'veterinarian')).rejects.toThrow('Insufficient permissions');
    });
  });

  // ─── requireAdmin ──────────────────────────────────────────────────────

  describe('requireAdmin', () => {
    it('returns admin user without minLevel check', async () => {
      (jwt.verify as any).mockReturnValue({
        userId: 'admin-1',
        email: 'admin@example.com',
        userType: 'administrator',
      });
      (query as any).mockResolvedValue({ rows: [mockAdminRow], rowCount: 1 });

      const event = mockAuthEvent('valid-jwt-token');
      const user = await requireAdmin(event);

      expect(user.userType).toBe('administrator');
    });

    it('returns elevated admin when minLevel is standard', async () => {
      const elevatedRow = { ...mockAdminRow, access_level: 'elevated' };
      (jwt.verify as any).mockReturnValue({
        userId: 'admin-1',
        email: 'admin@example.com',
        userType: 'administrator',
      });
      (query as any).mockResolvedValue({ rows: [elevatedRow], rowCount: 1 });

      const event = mockAuthEvent('valid-jwt-token');
      const user = await requireAdmin(event, 'standard');

      expect(user.userType).toBe('administrator');
    });

    it('returns elevated admin when minLevel is elevated', async () => {
      const elevatedRow = { ...mockAdminRow, access_level: 'elevated' };
      (jwt.verify as any).mockReturnValue({
        userId: 'admin-1',
        email: 'admin@example.com',
        userType: 'administrator',
      });
      (query as any).mockResolvedValue({ rows: [elevatedRow], rowCount: 1 });

      const event = mockAuthEvent('valid-jwt-token');
      const user = await requireAdmin(event, 'elevated');

      expect(user.userType).toBe('administrator');
      expect(user.accessLevel).toBe('elevated');
    });

    it('returns super_admin when minLevel is super_admin', async () => {
      (jwt.verify as any).mockReturnValue({
        userId: 'admin-1',
        email: 'admin@example.com',
        userType: 'administrator',
      });
      (query as any).mockResolvedValue({ rows: [mockAdminRow], rowCount: 1 });

      const event = mockAuthEvent('valid-jwt-token');
      const user = await requireAdmin(event, 'super_admin');

      expect(user.userType).toBe('administrator');
      expect(user.accessLevel).toBe('super_admin');
    });

    it('throws "Insufficient admin privileges" when access level is too low', async () => {
      const standardRow = { ...mockAdminRow, access_level: 'standard' };
      (jwt.verify as any).mockReturnValue({
        userId: 'admin-1',
        email: 'admin@example.com',
        userType: 'administrator',
      });
      (query as any).mockResolvedValue({ rows: [standardRow], rowCount: 1 });

      const event = mockAuthEvent('valid-jwt-token');

      // standard < super_admin in the hierarchy
      await expect(requireAdmin(event, 'super_admin')).rejects.toThrow('Insufficient admin privileges');
    });

    it('throws "Insufficient admin privileges" when elevated admin accesses super_admin route', async () => {
      const elevatedRow = { ...mockAdminRow, access_level: 'elevated' };
      (jwt.verify as any).mockReturnValue({
        userId: 'admin-1',
        email: 'admin@example.com',
        userType: 'administrator',
      });
      (query as any).mockResolvedValue({ rows: [elevatedRow], rowCount: 1 });

      const event = mockAuthEvent('valid-jwt-token');

      // elevated < super_admin
      await expect(requireAdmin(event, 'super_admin')).rejects.toThrow('Insufficient admin privileges');
    });

    it('throws "Administrator access required" for non-admin users', async () => {
      (jwt.verify as any).mockReturnValue({
        userId: 'user-1',
        email: 'test@example.com',
        userType: 'pet_owner',
      });
      (query as any).mockResolvedValue({ rows: [mockUserRow], rowCount: 1 });

      const event = mockAuthEvent('valid-jwt-token');

      await expect(requireAdmin(event)).rejects.toThrow('Administrator access required');
    });
  });
});