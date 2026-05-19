/**
 * Environment Variable Validation
 *
 * Called at module load time for fail-fast startup.
 * Throws if required variables are missing.
 * Warns (non-blocking) if recommended variables are missing or misconfigured.
 */

export interface EnvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateEnvVars(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // === REQUIRED ===

  // JWT_SECRET is MANDATORY — no fallback allowed
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'default_secret') {
    errors.push('JWT_SECRET is required and must not be the default value. Set a strong random secret (32+ characters).');
  }

  // Database connection — must have DATABASE_URL OR all individual DB_* vars
  const hasDatabaseUrl = !!process.env.DATABASE_URL;
  const hasIndividualDb = !!(
    process.env.DB_HOST &&
    process.env.DB_NAME &&
    process.env.DB_USER &&
    process.env.DB_PASSWORD
  );

  if (!hasDatabaseUrl && !hasIndividualDb) {
    errors.push(
      'Database configuration required: either DATABASE_URL or DB_HOST + DB_NAME + DB_USER + DB_PASSWORD'
    );
  }

  // === RECOMMENDED (warnings only) ===

  if (process.env.JWT_EXPIRES_IN) {
    const match = process.env.JWT_EXPIRES_IN.match(/^(\d+)([dhms])$/);
    if (!match) {
      warnings.push('JWT_EXPIRES_IN should be a number followed by unit: d (days), h (hours), m (minutes), s (seconds). Example: "7d" or "24h".');
    } else {
      const value = parseInt(match[1], 10);
      const unit = match[2];
      if (unit === 'd' && value > 1) {
        warnings.push(`JWT_EXPIRES_IN is ${value} days. For production, consider a shorter expiry (e.g., 24h) with refresh tokens.`);
      } else if (unit === 'h' && value > 24) {
        warnings.push(`JWT_EXPIRES_IN is ${value} hours. Consider reducing to 24h or less.`);
      }
    }
  }

  if (!process.env.FRONTEND_URL) {
    warnings.push('FRONTEND_URL not set. Password reset emails will use fallback URL.');
  }

  if (!process.env.PUSHER_APP_ID || !process.env.PUSHER_KEY || !process.env.PUSHER_SECRET) {
    warnings.push('Pusher credentials incomplete (PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET). Real-time notifications will not work.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}