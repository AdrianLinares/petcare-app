/**
 * Environment Validation Tests — AUDIT-3.1.1
 *
 * Tests validateEnvVars() which performs fail-fast startup checks
 * on required environment variables and warns about recommended ones.
 *
 * Pure function — no side effects, no database, no network.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { validateEnvVars } from '../utils/env-validation';

describe('validateEnvVars', () => {
  // Preserve original env so tests don't leak state
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Start each test with a clean slate
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  // ─── JWT_SECRET — Required, no fallback ───────────────────────────────

  describe('JWT_SECRET', () => {
    it('fails validation when JWT_SECRET is missing', () => {
      delete process.env.JWT_SECRET;

      const result = validateEnvVars();

      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining('JWT_SECRET is required'),
        ])
      );
    });

    it('fails validation when JWT_SECRET is the default value "default_secret"', () => {
      process.env.JWT_SECRET = 'default_secret';

      const result = validateEnvVars();

      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining('JWT_SECRET is required'),
        ])
      );
    });

    it('passes validation when JWT_SECRET is a strong custom value', () => {
      process.env.JWT_SECRET = 'a-real-secret-that-is-long-enough';
      process.env.DATABASE_URL = 'postgres://user:pass@localhost/db';

      const result = validateEnvVars();

      expect(result.valid).toBe(true);
      expect(result.errors).not.toEqual(
        expect.arrayContaining([expect.stringContaining('JWT_SECRET')])
      );
    });
  });

  // ─── DATABASE_URL — Required (or individual DB_* vars) ────────────────

  describe('Database configuration', () => {
    it('fails validation when neither DATABASE_URL nor DB_* vars are set', () => {
      process.env.JWT_SECRET = 'a-real-secret';
      delete process.env.DATABASE_URL;
      delete process.env.DB_HOST;
      delete process.env.DB_NAME;
      delete process.env.DB_USER;
      delete process.env.DB_PASSWORD;

      const result = validateEnvVars();

      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Database configuration required'),
        ])
      );
    });

    it('passes validation when DATABASE_URL is set', () => {
      process.env.JWT_SECRET = 'a-real-secret';
      process.env.DATABASE_URL = 'postgres://user:pass@localhost/db';

      const result = validateEnvVars();

      expect(result.valid).toBe(true);
      expect(result.errors).not.toEqual(
        expect.arrayContaining([expect.stringContaining('Database')])
      );
    });

    it('passes validation when all individual DB_* vars are set (no DATABASE_URL)', () => {
      process.env.JWT_SECRET = 'a-real-secret';
      delete process.env.DATABASE_URL;
      process.env.DB_HOST = 'localhost';
      process.env.DB_NAME = 'mydb';
      process.env.DB_USER = 'user';
      process.env.DB_PASSWORD = 'pass';

      const result = validateEnvVars();

      expect(result.valid).toBe(true);
      expect(result.errors).not.toEqual(
        expect.arrayContaining([expect.stringContaining('Database')])
      );
    });

    it('fails validation when only some DB_* vars are set (incomplete set)', () => {
      process.env.JWT_SECRET = 'a-real-secret';
      delete process.env.DATABASE_URL;
      process.env.DB_HOST = 'localhost';
      process.env.DB_NAME = 'mydb';
      delete process.env.DB_USER;
      delete process.env.DB_PASSWORD;

      const result = validateEnvVars();

      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Database configuration required'),
        ])
      );
    });
  });

  // ─── JWT_EXPIRES_IN — Recommended (warnings only) ─────────────────────

  describe('JWT_EXPIRES_IN warnings', () => {
    it('warns when JWT_EXPIRES_IN is greater than 1 day (e.g., 7d)', () => {
      process.env.JWT_SECRET = 'a-real-secret';
      process.env.DATABASE_URL = 'postgres://user:pass@localhost/db';
      process.env.JWT_EXPIRES_IN = '7d';

      const result = validateEnvVars();

      expect(result.valid).toBe(true);
      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.stringContaining('7 days'),
        ])
      );
    });

    it('warns when JWT_EXPIRES_IN is 30 days', () => {
      process.env.JWT_SECRET = 'a-real-secret';
      process.env.DATABASE_URL = 'postgres://user:pass@localhost/db';
      process.env.JWT_EXPIRES_IN = '30d';

      const result = validateEnvVars();

      expect(result.valid).toBe(true);
      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.stringContaining('30 days'),
        ])
      );
    });

    it('does NOT warn when JWT_EXPIRES_IN is 24 hours or less', () => {
      process.env.JWT_SECRET = 'a-real-secret';
      process.env.DATABASE_URL = 'postgres://user:pass@localhost/db';
      process.env.JWT_EXPIRES_IN = '24h';

      const result = validateEnvVars();

      expect(result.valid).toBe(true);
      expect(result.warnings).not.toEqual(
        expect.arrayContaining([expect.stringContaining('JWT_EXPIRES_IN')])
      );
    });

    it('does NOT warn when JWT_EXPIRES_IN is 1 day', () => {
      process.env.JWT_SECRET = 'a-real-secret';
      process.env.DATABASE_URL = 'postgres://user:pass@localhost/db';
      process.env.JWT_EXPIRES_IN = '1d';

      const result = validateEnvVars();

      expect(result.valid).toBe(true);
      expect(result.warnings).not.toEqual(
        expect.arrayContaining([expect.stringContaining('JWT_EXPIRES_IN')])
      );
    });

    it('warns when JWT_EXPIRES_IN is greater than 24 hours (e.g., 48h)', () => {
      process.env.JWT_SECRET = 'a-real-secret';
      process.env.DATABASE_URL = 'postgres://user:pass@localhost/db';
      process.env.JWT_EXPIRES_IN = '48h';

      const result = validateEnvVars();

      expect(result.valid).toBe(true);
      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.stringContaining('48 hours'),
        ])
      );
    });

    it('warns when JWT_EXPIRES_IN has invalid format', () => {
      process.env.JWT_SECRET = 'a-real-secret';
      process.env.DATABASE_URL = 'postgres://user:pass@localhost/db';
      process.env.JWT_EXPIRES_IN = 'forever';

      const result = validateEnvVars();

      expect(result.valid).toBe(true);
      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.stringContaining('should be a number followed by unit'),
        ])
      );
    });

    it('does not warn when JWT_EXPIRES_IN is not set (uses default)', () => {
      process.env.JWT_SECRET = 'a-real-secret';
      process.env.DATABASE_URL = 'postgres://user:pass@localhost/db';
      delete process.env.JWT_EXPIRES_IN;

      const result = validateEnvVars();

      // No JWT_EXPIRES_IN warning because it's not set at all
      // (the default '7d' is handled at jwt.sign level, not here)
      expect(result.warnings).not.toEqual(
        expect.arrayContaining([expect.stringContaining('JWT_EXPIRES_IN')])
      );
    });
  });

  // ─── FRONTEND_URL — Recommended (warning only) ──────────────────────

  describe('FRONTEND_URL warning', () => {
    it('warns when FRONTEND_URL is not set', () => {
      process.env.JWT_SECRET = 'a-real-secret';
      process.env.DATABASE_URL = 'postgres://user:pass@localhost/db';
      delete process.env.FRONTEND_URL;

      const result = validateEnvVars();

      expect(result.valid).toBe(true);
      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.stringContaining('FRONTEND_URL not set'),
        ])
      );
    });

    it('does NOT warn when FRONTEND_URL is set', () => {
      process.env.JWT_SECRET = 'a-real-secret';
      process.env.DATABASE_URL = 'postgres://user:pass@localhost/db';
      process.env.FRONTEND_URL = 'https://example.com';

      const result = validateEnvVars();

      expect(result.valid).toBe(true);
      expect(result.warnings).not.toEqual(
        expect.arrayContaining([expect.stringContaining('FRONTEND_URL')])
      );
    });
  });

  // ─── PUSHER_* — Recommended (warning only) ────────────────────────────

  describe('Pusher credentials warning', () => {
    it('warns when Pusher credentials are incomplete', () => {
      process.env.JWT_SECRET = 'a-real-secret';
      process.env.DATABASE_URL = 'postgres://user:pass@localhost/db';
      delete process.env.PUSHER_APP_ID;
      delete process.env.PUSHER_KEY;
      delete process.env.PUSHER_SECRET;

      const result = validateEnvVars();

      expect(result.valid).toBe(true);
      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Pusher credentials incomplete'),
        ])
      );
    });

    it('does NOT warn when all Pusher credentials are set', () => {
      process.env.JWT_SECRET = 'a-real-secret';
      process.env.DATABASE_URL = 'postgres://user:pass@localhost/db';
      process.env.PUSHER_APP_ID = 'app-id';
      process.env.PUSHER_KEY = 'key';
      process.env.PUSHER_SECRET = 'secret';

      const result = validateEnvVars();

      expect(result.valid).toBe(true);
      expect(result.warnings).not.toEqual(
        expect.arrayContaining([expect.stringContaining('Pusher')])
      );
    });

    it('warns when only some Pusher vars are set', () => {
      process.env.JWT_SECRET = 'a-real-secret';
      process.env.DATABASE_URL = 'postgres://user:pass@localhost/db';
      process.env.PUSHER_APP_ID = 'app-id';
      delete process.env.PUSHER_KEY;
      delete process.env.PUSHER_SECRET;

      const result = validateEnvVars();

      expect(result.valid).toBe(true);
      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Pusher credentials incomplete'),
        ])
      );
    });
  });

  // ─── Happy path — everything configured ──────────────────────────────

  describe('happy path', () => {
    it('returns valid with no errors and no warnings when all required and recommended vars are set', () => {
      process.env.JWT_SECRET = 'strong-production-secret-32chars!!';
      process.env.DATABASE_URL = 'postgres://user:pass@localhost/db';
      process.env.JWT_EXPIRES_IN = '24h';
      process.env.FRONTEND_URL = 'https://petcare.example.com';
      process.env.PUSHER_APP_ID = 'app-id';
      process.env.PUSHER_KEY = 'key';
      process.env.PUSHER_SECRET = 'secret';

      const result = validateEnvVars();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });
  });
});