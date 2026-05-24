/**
 * Users Serverless Function
 *
 * API Endpoints:
 * GET  /users/me             - Get current user's profile
 * PATCH /users/me            - Update current user's profile
 * POST /users/me/change-password - Change user's password
 * GET  /users                - List all users (admin only)
 * POST /users                - Create user (admin only)
 * GET  /users/:id            - Get specific user (admin only)
 * PATCH /users/:id           - Update user (admin only)
 * DELETE /users/:id          - Delete user (admin only)
 *
 * Permission Levels:
 * - All authenticated users: Can view/update their own profile
 * - Administrators only: Can view/update/delete any user
 */

import { Handler, HandlerEvent } from '@netlify/functions';
import bcrypt from 'bcryptjs';
import { query } from './utils/database';
import { requireAuth, requireAdmin } from './utils/auth';
import { successResponse, errorResponse, corsResponse } from './utils/response';
import { camelCaseRow, camelCaseRows, buildUpdateSet, parsePath } from './utils/db-helpers';

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod === 'OPTIONS') {
    return corsResponse();
  }

  try {
    const path = event.path.replace('/.netlify/functions/users', '').replace('/api/users', '');
    const body = event.body ? JSON.parse(event.body) : {};
    const params = event.queryStringParameters || {};

    // GET /users/me - Get current user
    if (path === '/me' && event.httpMethod === 'GET') {
      const user = await requireAuth(event);

      const result = await query(
        'SELECT id, email, full_name, phone, user_type, access_level, address, specialization, license_number, created_at FROM users WHERE id = $1',
        [user.id]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      return successResponse(camelCaseRow(result.rows[0]));
    }

    // PATCH /users/me - Update current user
    if (path === '/me' && event.httpMethod === 'PATCH') {
      const user = await requireAuth(event);
      const { fullName, phone, address, specialization, licenseNumber } = body;

      const { clause, values, nextParam } = buildUpdateSet({
        full_name: fullName,
        phone,
        address,
        specialization,
        license_number: licenseNumber,
      });

      values.push(user.id);

      const result = await query(
        `UPDATE users SET ${clause}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${nextParam}
         RETURNING id, email, full_name, phone, user_type, access_level, address, specialization, license_number`,
        values
      );

      return successResponse(camelCaseRow(result.rows[0]));
    }

    // POST /users/me/change-password - Change password
    if (path === '/me/change-password' && event.httpMethod === 'POST') {
      const user = await requireAuth(event);
      const { currentPassword, newPassword } = body;

      if (!currentPassword || !newPassword) {
        throw new Error('Current and new passwords are required');
      }

      if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters');
      }

      const result = await query('SELECT password_hash FROM users WHERE id = $1', [user.id]);
      const userData = result.rows[0];

      const validPassword = await bcrypt.compare(currentPassword, userData.password_hash);
      if (!validPassword) {
        throw new Error('Current password is incorrect');
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 10);
      await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPasswordHash, user.id]);

      return successResponse({ message: 'Password changed successfully' });
    }

    // GET /users - List all users (Admin only, except for veterinarians)
    if (path === '' && event.httpMethod === 'GET') {
      const { userType, page = '1', limit = '20' } = params;

      // If requesting veterinarians, only require authentication (not admin)
      if (userType === 'veterinarian') {
        await requireAuth(event);

        const result = await query(
          'SELECT id, email, full_name, phone, user_type, specialization, license_number FROM users WHERE user_type = $1 AND deleted_at IS NULL ORDER BY full_name ASC',
          ['veterinarian']
        );

        return successResponse({ users: camelCaseRows(result.rows) });
      }

      // For all other user types, require admin access
      await requireAdmin(event);

      const pageNum = parseInt(page);
      const limitNum = Math.min(parseInt(limit), 100);
      const offset = (pageNum - 1) * limitNum;

      let queryText = 'SELECT id, email, full_name, phone, user_type, access_level, created_at FROM users WHERE deleted_at IS NULL';
      const values: any[] = [];

      if (userType) {
        queryText += ' AND user_type = $1';
        values.push(userType);
      }

      queryText += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
      values.push(limitNum, offset);

      const result = await query(queryText, values);

      let countQuery = 'SELECT COUNT(*) FROM users WHERE deleted_at IS NULL';
      const countValues: any[] = [];
      if (userType) {
        countQuery += ' AND user_type = $1';
        countValues.push(userType);
      }
      const countResult = await query(countQuery, countValues);
      const total = parseInt(countResult.rows[0].count);

      return successResponse({
        users: camelCaseRows(result.rows),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });
    }

    // POST /users - Create user (Admin only)
    if (path === '' && event.httpMethod === 'POST') {
      await requireAdmin(event);

      const { email, password, fullName, phone, userType, address, specialization, licenseNumber, accessLevel } = body;

      if (!email || !password || !fullName || !phone || !userType) {
        throw new Error('Missing required fields');
      }

      const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        throw new Error('User with this email already exists');
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const result = await query(
        `INSERT INTO users
         (email, password_hash, full_name, phone, user_type, address, specialization, license_number, access_level)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, email, full_name, phone, user_type, access_level, created_at`,
        [email, passwordHash, fullName, phone, userType, address || null, specialization || null, licenseNumber || null, accessLevel || null]
      );

      return successResponse(camelCaseRow(result.rows[0]), 201);
    }

    // Handle /:id routes
    const routeParams = parsePath({ path }, '/:userId');

    if (routeParams) {
      const userId = routeParams.userId;

      // GET /users/:id - Get user by ID (Admin only)
      if (event.httpMethod === 'GET') {
        await requireAdmin(event);

        const result = await query(
          'SELECT id, email, full_name, phone, user_type, access_level, address, specialization, license_number, created_at FROM users WHERE id = $1 AND deleted_at IS NULL',
          [userId]
        );

        if (result.rows.length === 0) {
          throw new Error('User not found');
        }

        return successResponse(camelCaseRow(result.rows[0]));
      }

      // PATCH /users/:id - Update user (Admin only)
      if (event.httpMethod === 'PATCH') {
        await requireAdmin(event);

        const { email, fullName, phone, address, specialization, licenseNumber, accessLevel, userType } = body;

        const { clause, values, nextParam } = buildUpdateSet({
          email,
          full_name: fullName,
          phone,
          address,
          specialization,
          license_number: licenseNumber,
          access_level: accessLevel !== undefined && String(accessLevel).trim() !== '' ? accessLevel : undefined,
          user_type: userType,
        });

        values.push(userId);

        const result = await query(
          `UPDATE users SET ${clause}, updated_at = CURRENT_TIMESTAMP
           WHERE id = $${nextParam} AND deleted_at IS NULL
           RETURNING id, email, full_name, phone, user_type, access_level, address, specialization, license_number`,
          values
        );

        if (result.rows.length === 0) {
          throw new Error('User not found');
        }

        return successResponse(camelCaseRow(result.rows[0]));
      }

      // DELETE /users/:id - Delete user (Admin only)
      if (event.httpMethod === 'DELETE') {
        await requireAdmin(event, 'super_admin');

        await query(
          'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1',
          [userId]
        );

        return successResponse({ message: 'User deleted successfully' });
      }
    }

    return errorResponse(new Error('Route not found'), 404);
  } catch (error: any) {
    return errorResponse(error);
  }
};

export { handler };