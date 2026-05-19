import { describe, it, expect, vi } from 'vitest';
import { mockPool, mockEvent, mockAuthEvent, mockResponse } from './helpers';

describe('mockPool', () => {
  it('returns a pool mock with query that resolves to the given rows', async () => {
    const rows = [{ id: '1', name: 'Test User' }];
    const pool = mockPool(rows);

    const result = await pool.query('SELECT * FROM users');

    expect(result.rows).toEqual(rows);
    expect(result.rowCount).toBe(1);
    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM users');
  });

  it('returns empty rows when given an empty array', async () => {
    const pool = mockPool([]);

    const result = await pool.query('SELECT * FROM users WHERE id = $1', ['nonexistent']);

    expect(result.rows).toEqual([]);
    expect(result.rowCount).toBe(0);
    expect(pool.query).toHaveBeenCalledTimes(1);
    expect(pool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', ['nonexistent']);
  });

  it('tracks multiple query calls independently', async () => {
    const pool = mockPool([{ id: '1' }]);

    await pool.query('SELECT * FROM users');
    await pool.query('SELECT * FROM pets');

    expect(pool.query).toHaveBeenCalledTimes(2);
  });
});

describe('mockEvent', () => {
  it('returns a HandlerEvent-compatible object with sensible defaults', () => {
    const event = mockEvent();

    expect(event.httpMethod).toBe('POST');
    expect(event.headers).toEqual({ 'content-type': 'application/json' });
    expect(event.body).toBeNull();
    expect(event.isBase64Encoded).toBe(false);
    expect(event.path).toBe('/.netlify/functions/auth');
    expect(event.queryStringParameters).toBeNull();
  });

  it('merges provided overrides into the default event', () => {
    const event = mockEvent({
      httpMethod: 'GET',
      path: '/.netlify/functions/pets',
      queryStringParameters: { id: '123' },
    });

    expect(event.httpMethod).toBe('GET');
    expect(event.path).toBe('/.netlify/functions/pets');
    expect(event.queryStringParameters).toEqual({ id: '123' });
    // Defaults are preserved
    expect(event.headers).toEqual({ 'content-type': 'application/json' });
    expect(event.isBase64Encoded).toBe(false);
  });

  it('includes JSON body when provided', () => {
    const payload = { email: 'test@example.com', password: 'secret' };
    const event = mockEvent({
      body: JSON.stringify(payload),
      headers: { 'content-type': 'application/json' },
    });

    expect(event.body).toBe(JSON.stringify(payload));
    expect(JSON.parse(event.body!)).toEqual(payload);
  });
});

describe('mockAuthEvent', () => {
  it('returns an event with Authorization header containing Bearer token', () => {
    const token = 'jwt-token-here';
    const event = mockAuthEvent(token);

    expect(event.headers.authorization).toBe(`Bearer ${token}`);
    expect(event.headers['content-type']).toBe('application/json');
    expect(event.httpMethod).toBe('POST');
  });

  it('allows overriding additional event properties', () => {
    const token = 'my-token';
    const event = mockAuthEvent(token, {
      httpMethod: 'PUT',
      path: '/.netlify/functions/users',
    });

    expect(event.headers.authorization).toBe(`Bearer ${token}`);
    expect(event.httpMethod).toBe('PUT');
    expect(event.path).toBe('/.netlify/functions/users');
  });
});

describe('mockResponse', () => {
  it('returns a baseline HandlerResponse with default values', () => {
    const response = mockResponse();

    expect(response.statusCode).toBe(200);
    expect(response.headers).toEqual({ 'content-type': 'application/json' });
    expect(response.body).toBe('');
  });

  it('allows callers to spread and override specific fields', () => {
    const response = {
      ...mockResponse(),
      statusCode: 404,
      body: JSON.stringify({ error: 'Not found' }),
    };

    expect(response.statusCode).toBe(404);
    expect(response.body).toBe(JSON.stringify({ error: 'Not found' }));
    expect(response.headers).toEqual({ 'content-type': 'application/json' });
  });
});