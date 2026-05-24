/**
 * Authentication Serverless Function
 *
 * API Endpoints:
 * POST /auth/register       - Create a new user account
 * POST /auth/login          - Sign in existing user
 * POST /auth/forgot-password - Request password reset
 * POST /auth/reset-password  - Complete password reset with token
 * POST /auth/logout         - Logout (blacklist JWT)
 */

import { Handler, HandlerEvent } from '@netlify/functions';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from './utils/database';
import { successResponse, errorResponse, corsResponse } from './utils/response';
import { sendWelcomeNotification, sendPasswordChanged } from './utils/notifications';
import { validateEnvVars } from './utils/env-validation';
import { requireAuth } from './utils/auth';
import { camelCaseRow } from './utils/db-helpers';

// Validate environment variables at module load time
const envResult = validateEnvVars();
if (!envResult.valid) {
  console.error('❌ Environment validation failed:');
  envResult.errors.forEach(e => console.error(`  - ${e}`));
}
envResult.warnings.forEach(w => console.warn(`⚠️  ${w}`));

const handler: Handler = async (event: HandlerEvent) => {
  console.log('Auth request:', {
    method: event.httpMethod,
    path: event.path,
    hasBody: !!event.body,
  });

  if (event.httpMethod === 'OPTIONS') {
    return corsResponse();
  }

  try {
    const path = event.path.replace('/.netlify/functions/auth', '').replace('/api/auth', '');
    const body = event.body ? JSON.parse(event.body) : {};

    // POST /auth/register
    if (path === '/register' && event.httpMethod === 'POST') {
      const { email, password, fullName, phone, userType, address, specialization, licenseNumber } = body;

      if (!email || !password || !fullName || !phone || !userType) {
        throw new Error('Missing required fields');
      }

      if (!['pet_owner', 'veterinarian', 'administrator'].includes(userType)) {
        throw new Error('Invalid user type');
      }

      const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        throw new Error('User with this email already exists');
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const result = await query(
        `INSERT INTO users
         (email, password_hash, full_name, phone, user_type, address, specialization, license_number)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, email, full_name, phone, user_type, address, specialization, license_number, created_at`,
        [email, passwordHash, fullName, phone, userType, address || null, specialization || null, licenseNumber || null]
      );

      const user = camelCaseRow(result.rows[0]);

      const token = jwt.sign(
        { userId: user.id, email: user.email, userType: user.userType, jti: crypto.randomUUID() },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
      );

      sendWelcomeNotification(user.id, user.fullName || '').catch(err => {
        console.error('Failed to send welcome notification:', err);
      });

      return successResponse({ token, user }, 201);
    }

    // POST /auth/login
    if (path === '/login' && event.httpMethod === 'POST') {
      console.log('Login attempt for:', body.email?.substring(0, 3) + '***');
      const { email, password } = body;

      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      console.log('Querying database for user...');
      const result = await query(
        'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
        [email]
      );
      console.log('Database query result:', result.rows.length > 0 ? 'User found' : 'User not found');

      if (result.rows.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = result.rows[0];

      console.log('Verifying password...');
      const validPassword = await bcrypt.compare(password, user.password_hash);
      console.log('Password validation:', validPassword ? 'Success' : 'Failed');
      if (!validPassword) {
        throw new Error('Invalid email or password');
      }

      console.log('Generating JWT token...');
      const token = jwt.sign(
        { userId: user.id, email: user.email, userType: user.user_type, jti: crypto.randomUUID() },
        process.env.JWT_SECRET!,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
      );

      console.log('Login successful for user:', user.id);

      // Selectively expose user fields (never expose password_hash)
      const safeUser = {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        userType: user.user_type,
        accessLevel: user.access_level,
        address: user.address,
        specialization: user.specialization,
        licenseNumber: user.license_number,
        createdAt: user.created_at,
      };

      return successResponse({ token, user: safeUser });
    }

    // POST /auth/forgot-password
    if (path === '/forgot-password' && event.httpMethod === 'POST') {
      const { email } = body;

      if (!email) {
        throw new Error('Email is required');
      }

      const result = await query(
        'SELECT id, email, full_name FROM users WHERE email = $1 AND deleted_at IS NULL',
        [email]
      );

      if (result.rows.length === 0) {
        return successResponse({ message: 'If that email exists, a password reset link has been sent' });
      }

      const user = result.rows[0];

      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await query(
        `INSERT INTO password_reset_tokens (user_id, email, token, expires_at)
         VALUES ($1, $2, $3, $4)`,
        [user.id, user.email, token, expiresAt]
      );

      console.log(`Password reset link: ${process.env.FRONTEND_URL}/#reset-password?token=${token}`);

      return successResponse({ message: 'If that email exists, a password reset link has been sent' });
    }

    // POST /auth/reset-password
    if (path === '/reset-password' && event.httpMethod === 'POST') {
      const { token, password } = body;

      if (!token || !password) {
        throw new Error('Token and password are required');
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      const tokenResult = await query(
        `SELECT * FROM password_reset_tokens
         WHERE token = $1 AND used = false AND expires_at > NOW()`,
        [token]
      );

      if (tokenResult.rows.length === 0) {
        throw new Error('Invalid or expired token');
      }

      const resetToken = tokenResult.rows[0];

      const passwordHash = await bcrypt.hash(password, 10);

      await query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [passwordHash, resetToken.user_id]
      );

      await query(
        'UPDATE password_reset_tokens SET used = true, used_at = NOW() WHERE id = $1',
        [resetToken.id]
      );

      const userResult = await query('SELECT email FROM users WHERE id = $1', [resetToken.user_id]);
      const userEmail = userResult.rows[0]?.email || 'your account';

      sendPasswordChanged(resetToken.user_id, userEmail).catch(err => {
        console.error('Failed to send password changed notification:', err);
      });

      return successResponse({ message: 'Password reset successful' });
    }

    // POST /auth/logout
    if (path === '/logout' && event.httpMethod === 'POST') {
      try {
        const user = await requireAuth(event);

        const token = event.headers.authorization?.replace('Bearer ', '');
        if (!token) {
          return errorResponse(new Error('Token is required for logout'), 400);
        }

        const decoded = jwt.decode(token) as any;
        if (decoded && decoded.jti) {
          await query(
            'INSERT INTO token_blacklist (token_jti, user_id, expires_at) VALUES ($1, $2, $3)',
            [decoded.jti, user.id, new Date(decoded.exp * 1000)]
          );
        }

        return successResponse({ message: 'Logged out successfully' });
      } catch (error: any) {
        if (error.message === 'Authentication required') {
          return errorResponse(error, 401);
        }
        return errorResponse(new Error('Logout failed'), 500);
      }
    }

    return errorResponse(new Error('Route not found'), 404);
  } catch (error: any) {
    return errorResponse(error);
  }
};

export { handler };