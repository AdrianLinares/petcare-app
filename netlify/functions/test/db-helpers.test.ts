/**
 * Database Helper Utilities Tests — AUDIT-2.0.1
 *
 * Tests for camelCaseRows, camelCaseRow, buildUpdateSet,
 * successResponse, errorResponse, and parsePath.
 */

import { describe, it, expect } from 'vitest';
import {
  camelCaseRows,
  camelCaseRow,
  buildUpdateSet,
  successResponse,
  errorResponse,
  parsePath,
} from '../utils/db-helpers';

// ─── camelCaseRows ─────────────────────────────────────────────────────

describe('camelCaseRows', () => {
  it('converts snake_case keys to camelCase', () => {
    const rows = [
      { first_name: 'Alice', last_name: 'Smith', created_at: '2025-01-01' },
    ];
    const result = camelCaseRows(rows);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      firstName: 'Alice',
      lastName: 'Smith',
      createdAt: '2025-01-01',
    });
  });

  it('handles multiple rows', () => {
    const rows = [
      { pet_id: '1', pet_name: 'Buddy' },
      { pet_id: '2', pet_name: 'Mittens' },
    ];
    const result = camelCaseRows(rows);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ petId: '1', petName: 'Buddy' });
    expect(result[1]).toEqual({ petId: '2', petName: 'Mittens' });
  });

  it('returns empty array for null input', () => {
    const result = camelCaseRows(null as any);
    expect(result).toEqual([]);
  });

  it('returns empty array for undefined input', () => {
    const result = camelCaseRows(undefined as any);
    expect(result).toEqual([]);
  });

  it('returns empty array for empty array input', () => {
    const result = camelCaseRows([]);
    expect(result).toEqual([]);
  });

  it('preserves null values in rows', () => {
    const rows = [{ medical_history: null, owner_name: 'Bob' }];
    const result = camelCaseRows(rows);

    expect(result[0]).toEqual({ medicalHistory: null, ownerName: 'Bob' });
  });

  it('handles keys that are already camelCase (no double conversion)', () => {
    const rows = [{ name: 'Rex', age: 3 }];
    const result = camelCaseRows(rows);

    expect(result[0]).toEqual({ name: 'Rex', age: 3 });
  });

  it('handles keys with multiple underscores', () => {
    const rows = [{ current_medications: ['med1'], microchip_id: 'MC-123' }];
    const result = camelCaseRows(rows);

    expect(result[0]).toEqual({ currentMedications: ['med1'], microchipId: 'MC-123' });
  });

  it('skips non-object entries in the array', () => {
    const rows = [{ id: 1 }, null, undefined, 'string', 42] as any[];
    const result = camelCaseRows(rows);

    expect(result).toHaveLength(5);
    expect(result[0]).toEqual({ id: 1 });
    expect(result[1]).toBeNull();
    expect(result[2]).toBeUndefined();
    expect(result[3]).toBe('string');
    expect(result[4]).toBe(42);
  });
});

// ─── camelCaseRow ───────────────────────────────────────────────────────

describe('camelCaseRow', () => {
  it('returns null for null input', () => {
    const result = camelCaseRow(null);
    expect(result).toBeNull();
  });

  it('returns null for undefined input', () => {
    const result = camelCaseRow(undefined);
    expect(result).toBeNull();
  });

  it('converts a single snake_case row to camelCase', () => {
    const row = { owner_id: 'user-1', created_at: '2025-01-01' };
    const result = camelCaseRow(row);

    expect(result).toEqual({ ownerId: 'user-1', createdAt: '2025-01-01' });
  });

  it('preserves values including nulls', () => {
    const row = { pet_name: 'Buddy', allergies: null, age: 5 };
    const result = camelCaseRow(row);

    expect(result).toEqual({ petName: 'Buddy', allergies: null, age: 5 });
  });
});

// ─── buildUpdateSet ─────────────────────────────────────────────────────

describe('buildUpdateSet', () => {
  it('builds SET clause for a single field', () => {
    const result = buildUpdateSet({ name: 'Rex' });

    expect(result.clause).toBe('name = $1');
    expect(result.values).toEqual(['Rex']);
    expect(result.nextParam).toBe(2);
  });

  it('builds SET clause for multiple fields', () => {
    const result = buildUpdateSet({ name: 'Rex', age: 3, breed: 'Lab' });

    expect(result.clause).toBe('name = $1, age = $2, breed = $3');
    expect(result.values).toEqual(['Rex', 3, 'Lab']);
    expect(result.nextParam).toBe(4);
  });

  it('throws when no valid fields to update', () => {
    expect(() => buildUpdateSet({})).toThrow('No fields to update');
  });

  it('throws when all values are undefined', () => {
    expect(() => buildUpdateSet({ name: undefined, age: undefined })).toThrow(
      'No fields to update'
    );
  });

  it('skips undefined values while keeping null values', () => {
    const result = buildUpdateSet({ name: 'Rex', age: undefined, breed: null });

    expect(result.clause).toBe('name = $1, breed = $2');
    expect(result.values).toEqual(['Rex', null]);
    expect(result.nextParam).toBe(3);
  });

  it('respects startParam offset for parameter numbering', () => {
    const result = buildUpdateSet({ name: 'Rex', age: 3 }, 3);

    expect(result.clause).toBe('name = $3, age = $4');
    expect(result.values).toEqual(['Rex', 3]);
    expect(result.nextParam).toBe(5);
  });

  it('uses default startParam of 1 when not specified', () => {
    const result = buildUpdateSet({ weight: 30 });

    expect(result.clause).toBe('weight = $1');
    expect(result.values).toEqual([30]);
    expect(result.nextParam).toBe(2);
  });
});

// ─── successResponse ────────────────────────────────────────────────────

describe('successResponse', () => {
  it('wraps data with default 200 status code', () => {
    const result = successResponse({ id: 'pet-1', name: 'Buddy' });

    expect(result.statusCode).toBe(200);
    expect(result.headers).toHaveProperty('Content-Type', 'application/json');
    expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
    expect(JSON.parse(result.body)).toEqual({ id: 'pet-1', name: 'Buddy' });
  });

  it('accepts custom status code', () => {
    const result = successResponse({ id: 'new' }, 201);

    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body)).toEqual({ id: 'new' });
  });

  it('handles array data', () => {
    const data = [{ id: '1' }, { id: '2' }];
    const result = successResponse(data);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual([{ id: '1' }, { id: '2' }]);
  });

  it('includes CORS headers', () => {
    const result = successResponse({ ok: true });

    expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
    expect(result.headers).toHaveProperty('Access-Control-Allow-Headers');
    expect(result.headers).toHaveProperty('Access-Control-Allow-Methods');
  });
});

// ─── errorResponse ─────────────────────────────────────────────────────

describe('errorResponse', () => {
  it('auto-maps "not found" to 404', () => {
    const result = errorResponse('Pet not found');

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).error).toBe('Pet not found');
  });

  it('auto-maps "does not exist" to 404', () => {
    const result = errorResponse('User does not exist');

    expect(result.statusCode).toBe(404);
  });

  it('auto-maps "required" to 400', () => {
    const result = errorResponse('Name and species are required');

    expect(result.statusCode).toBe(400);
  });

  it('auto-maps "missing" to 400', () => {
    const result = errorResponse('Missing required field');

    expect(result.statusCode).toBe(400);
  });

  it('auto-maps "authentication" to 401', () => {
    const result = errorResponse('Authentication required');

    expect(result.statusCode).toBe(401);
  });

  it('auto-maps "not authorized" to 401', () => {
    const result = errorResponse('not authorized to access');

    expect(result.statusCode).toBe(401);
  });

  it('auto-maps "permission" to 403', () => {
    const result = errorResponse('Insufficient permission');

    expect(result.statusCode).toBe(403);
  });

  it('auto-maps "insufficient" to 403', () => {
    const result = errorResponse('Insufficient privileges');

    expect(result.statusCode).toBe(403);
  });

  it('auto-maps "already exists" to 409', () => {
    const result = errorResponse('Pet already exists');

    expect(result.statusCode).toBe(409);
  });

  it('auto-maps "duplicate" to 409', () => {
    const result = errorResponse('Duplicate entry');

    expect(result.statusCode).toBe(409);
  });

  it('defaults to 500 for unrecognized errors', () => {
    const result = errorResponse('Something went wrong');

    expect(result.statusCode).toBe(500);
  });

  it('allows explicit status code override', () => {
    const result = errorResponse('Custom error', 422);

    expect(result.statusCode).toBe(422);
    expect(JSON.parse(result.body).error).toBe('Custom error');
  });

  it('includes CORS headers', () => {
    const result = errorResponse('Error');

    expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
    expect(result.headers).toHaveProperty('Access-Control-Allow-Headers');
    expect(result.headers).toHaveProperty('Access-Control-Allow-Methods');
  });
});

// ─── parsePath ─────────────────────────────────────────────────────────

describe('parsePath', () => {
  it('extracts path parameter from matching pattern', () => {
    const event = { path: '/api/pets/abc-123' };
    const result = parsePath(event, '/api/pets/:petId');

    expect(result).toEqual({ petId: 'abc-123' });
  });

  it('returns null when path length does not match pattern', () => {
    const event = { path: '/api/pets' };
    const result = parsePath(event, '/api/pets/:petId');

    expect(result).toBeNull();
  });

  it('returns null when static segments do not match', () => {
    const event = { path: '/api/users/abc-123' };
    const result = parsePath(event, '/api/pets/:petId');

    expect(result).toBeNull();
  });

  it('extracts multiple parameters', () => {
    const event = { path: '/api/owners/user-1/pets/pet-1' };
    const result = parsePath(event, '/api/owners/:ownerId/pets/:petId');

    expect(result).toEqual({ ownerId: 'user-1', petId: 'pet-1' });
  });

  it('matches pattern with no parameters', () => {
    const event = { path: '/api/pets' };
    const result = parsePath(event, '/api/pets');

    expect(result).toEqual({});
  });

  it('returns null for pattern with no parameters and non-matching path', () => {
    const event = { path: '/api/users' };
    const result = parsePath(event, '/api/pets');

    expect(result).toBeNull();
  });

  it('handles Netlify function path prefix', () => {
    const event = { path: '/.netlify/functions/pets/pet-123' };
    const result = parsePath(event, '/.netlify/functions/pets/:id');

    expect(result).toEqual({ id: 'pet-123' });
  });
});