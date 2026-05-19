/**
 * Database Helper Utilities
 *
 * Shared functions to reduce boilerplate across endpoint files.
 * - Snake_case → camelCase row mapping
 * - Dynamic SET clause builder for UPDATE queries
 * - Standard success/error response helpers
 * - Path parameter extraction
 */

/**
 * Map snake_case database rows to camelCase objects.
 * Handles null/undefined input, nested objects are NOT transformed.
 */
export function camelCaseRows<T = any>(rows: any[]): T[] {
  if (!rows || !Array.isArray(rows)) return [];
  return rows.map((row) => {
    if (!row || typeof row !== 'object') return row;
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(row)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase()
      );
      result[camelKey] = value;
    }
    return result as T;
  });
}

/**
 * Transform a single snake_case row to camelCase.
 */
export function camelCaseRow<T = any>(row: any): T | null {
  if (!row) return null;
  const rows = camelCaseRows<T>([row]);
  return rows[0] || null;
}

/**
 * Dynamic SET clause builder for UPDATE queries.
 * Builds parameterized SET clause and value array from an updates object.
 * Skips undefined values. Throws if no valid updates provided.
 *
 * @param updates - Object with column-value pairs (use snake_case keys)
 * @param startParam - The starting parameter index ($1, $2, etc.), default 1
 * @returns { clause, values, nextParam }
 *
 * @example
 * buildUpdateSet({ name: 'Rex', age: 3 })
 * // => { clause: 'name = $1, age = $2', values: ['Rex', 3], nextParam: 3 }
 */
export function buildUpdateSet(
  updates: Record<string, any>,
  startParam: number = 1
): { clause: string; values: any[]; nextParam: number } {
  const entries = Object.entries(updates).filter(([_, v]) => v !== undefined);

  if (entries.length === 0) {
    throw new Error('No fields to update');
  }

  let paramCount = startParam;
  const clauses: string[] = [];
  const values: any[] = [];

  for (const [column, value] of entries) {
    clauses.push(`${column} = $${paramCount}`);
    values.push(value);
    paramCount++;
  }

  return {
    clause: clauses.join(', '),
    values,
    nextParam: paramCount,
  };
}

/**
 * Default success response
 */
export function successResponse(data: any, statusCode: number = 200) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods':
        'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    },
    body: JSON.stringify(data),
  };
}

/**
 * Default error response.
 * Maps known error messages to appropriate HTTP status codes.
 */
export function errorResponse(error: string, statusCode?: number) {
  // Auto-map common error patterns to status codes.
  // Order matters: more-specific patterns are checked before general ones.
  if (!statusCode) {
    const lower = error.toLowerCase();
    if (
      lower.includes('authentication') ||
      lower.includes('not authorized')
    ) {
      statusCode = 401;
    } else if (
      lower.includes('permission') ||
      lower.includes('insufficient')
    ) {
      statusCode = 403;
    } else if (
      lower.includes('not found') ||
      lower.includes('does not exist')
    ) {
      statusCode = 404;
    } else if (
      lower.includes('already exists') ||
      lower.includes('duplicate')
    ) {
      statusCode = 409;
    } else if (
      lower.includes('required') ||
      lower.includes('missing')
    ) {
      statusCode = 400;
    } else {
      statusCode = 500;
    }
  }

  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods':
        'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    },
    body: JSON.stringify({ error }),
  };
}

/**
 * Extract path parameter from event.path.
 * e.g., parsePath(event, '/api/pets/:petId') with path '/api/pets/abc-123' => { petId: 'abc-123' }
 */
export function parsePath(
  event: { path: string },
  pattern: string
): Record<string, string> | null {
  const patternParts = pattern.split('/');
  const pathParts = event.path.split('/');

  if (patternParts.length !== pathParts.length) return null;

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = pathParts[i];
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }

  return params;
}