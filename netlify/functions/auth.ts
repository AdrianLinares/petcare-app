import { Handler, HandlerEvent } from '@netlify/functions';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from './utils/database';
import { successResponse, errorResponse, corsResponse } from './utils/response';

const handler: Handler = async (event: HandlerEvent) => {
  // Handle CORS preflight
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

      // Check if user already exists
      const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const result = await query(
        `INSERT INTO users 
         (email, password_hash, full_name, phone, user_type, address, specialization, license_number)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, email, full_name, phone, user_type, address, specialization, license_number, created_at`,
        [email, passwordHash, fullName, phone, userType, address || null, specialization || null, licenseNumber || null]
      );

      const user = result.rows[0];

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, userType: user.user_type },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
      );

      // Create welcome notification
      await query(
        `INSERT INTO notifications (user_id, type, title, message, priority)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, 'welcome', 'Welcome to PetCare!', `Welcome ${fullName}! Your account has been created successfully.`, 'normal']
      );

      return successResponse({
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          phone: user.phone,
          userType: user.user_type,
          address: user.address,
          specialization: user.specialization,
          licenseNumber: user.license_number,
          createdAt: user.created_at,
        },
      }, 201);
    }

    // POST /auth/login
    if (path === '/login' && event.httpMethod === 'POST') {
      const { email, password } = body;

      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Find user
      const result = await query(
        'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
        [email]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = result.rows[0];

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, userType: user.user_type },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
      );

      return successResponse({
        token,
        user: {
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
        },
      });
    }

    // POST /auth/forgot-password
    if (path === '/forgot-password' && event.httpMethod === 'POST') {
      const { email } = body;

      if (!email) {
        throw new Error('Email is required');
      }

      // Find user
      const result = await query(
        'SELECT id, email, full_name FROM users WHERE email = $1 AND deleted_at IS NULL',
        [email]
      );

      // Always return success to prevent email enumeration
      if (result.rows.length === 0) {
        return successResponse({ message: 'If that email exists, a password reset link has been sent' });
      }

      const user = result.rows[0];

      // Generate reset token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Save token to database
      await query(
        `INSERT INTO password_reset_tokens (user_id, email, token, expires_at)
         VALUES ($1, $2, $3, $4)`,
        [user.id, user.email, token, expiresAt]
      );

      // In production, send email here
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

      // Find valid token
      const tokenResult = await query(
        `SELECT * FROM password_reset_tokens 
         WHERE token = $1 AND used = false AND expires_at > NOW()`,
        [token]
      );

      if (tokenResult.rows.length === 0) {
        throw new Error('Invalid or expired token');
      }

      const resetToken = tokenResult.rows[0];

      // Hash new password
      const passwordHash = await bcrypt.hash(password, 10);

      // Update user password
      await query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [passwordHash, resetToken.user_id]
      );

      // Mark token as used
      await query(
        'UPDATE password_reset_tokens SET used = true, used_at = NOW() WHERE id = $1',
        [resetToken.id]
      );

      // Create notification
      await query(
        `INSERT INTO notifications (user_id, type, title, message, priority)
         VALUES ($1, $2, $3, $4, $5)`,
        [resetToken.user_id, 'password_changed', 'Password Changed', 'Your password has been successfully changed.', 'normal']
      );

      return successResponse({ message: 'Password reset successful' });
    }

    return errorResponse(new Error('Route not found'), 404);
  } catch (error: any) {
    return errorResponse(error);
  }
};

export { handler };
