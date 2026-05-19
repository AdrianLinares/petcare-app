/**
 * Test Helpers for Netlify Functions
 *
 * Mock utilities for testing serverless function handlers
 * without a real database or HTTP server.
 */

import { vi } from 'vitest';
import type { HandlerEvent, HandlerResponse } from '@netlify/functions';

/**
 * Mock pg Pool — returns the given rows on any query call.
 *
 * @param rows - Array of row objects the mock query will resolve with
 * @returns Object with a vi.fn() mock for the query method
 */
export function mockPool(rows: any[]) {
  return {
    query: vi.fn().mockResolvedValue({ rows, rowCount: rows.length }),
  };
}

/**
 * Build a minimal HandlerEvent for Netlify Functions testing.
 *
 * Provides sensible defaults that can be overridden per-test.
 * Matches the @netlify/functions HandlerEvent interface.
 *
 * @param overrides - Partial HandlerEvent fields to merge into defaults
 * @returns A HandlerEvent-compatible object
 */
export function mockEvent(overrides?: Partial<HandlerEvent>): HandlerEvent {
  return {
    rawUrl: 'http://localhost:8888/.netlify/functions/auth',
    rawQuery: '',
    path: '/.netlify/functions/auth',
    httpMethod: 'POST',
    headers: { 'content-type': 'application/json' },
    multiValueHeaders: {},
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    body: null,
    isBase64Encoded: false,
    ...overrides,
  } as HandlerEvent;
}

/**
 * Build a mock event with auth token in headers.
 *
 * Convenience wrapper around mockEvent that sets the Authorization
 * header with a Bearer token.
 *
 * @param token - JWT token string to include in Authorization header
 * @param overrides - Additional HandlerEvent fields to override
 * @returns A HandlerEvent with Authorization header set
 */
export function mockAuthEvent(token: string, overrides?: Partial<HandlerEvent>): HandlerEvent {
  return mockEvent({
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`,
    },
    ...overrides,
  });
}

/**
 * Mock HandlerResponse for assertions.
 *
 * Provides a baseline 200 response that callers can spread
 * and override for specific test scenarios.
 *
 * @returns A HandlerResponse object with default values
 */
export function mockResponse(): HandlerResponse {
  return {
    statusCode: 200,
    headers: { 'content-type': 'application/json' },
    body: '',
  };
}