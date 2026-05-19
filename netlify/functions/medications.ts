/**
 * Medications Serverless Function
 *
 * API Endpoints:
 * GET    /medications          - List all medications (filtered by role)
 * GET    /medications?petId=x  - Get medications for specific pet
 * GET    /medications/active   - Get active medications
 * POST   /medications          - Create new medication record
 * PATCH  /medications/:id      - Update medication record
 * PATCH  /medications/:id/deactivate - Mark medication as inactive
 * DELETE /medications/:id      - Delete medication record
 *
 * Role-Based Access:
 * - Pet Owners: See medications for their pets only
 * - Veterinarians: Can see all medications, prescribe new ones
 * - Administrators: Full access to all medication records
 */

import { Handler } from '@netlify/functions';
import { query } from './utils/database';
import { requireAuth } from './utils/auth';
import { successResponse, errorResponse, corsResponse } from './utils/response';
import { camelCaseRows, camelCaseRow, buildUpdateSet, parsePath } from './utils/db-helpers';

const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return corsResponse();
  try {
    const user = await requireAuth(event);
    const path = event.path.replace('/.netlify/functions/medications', '').replace('/api/medications', '');
    const body = event.body ? JSON.parse(event.body) : {};
    const params = event.queryStringParameters || {};

    // GET /medications (optional ?petId=)
    if (path === '' && event.httpMethod === 'GET') {
      let queryText = `SELECT m.*, u.full_name AS prescribed_by_name FROM medications m
                       LEFT JOIN users u ON m.prescribed_by = u.id
                       JOIN pets p ON m.pet_id = p.id
                       WHERE m.deleted_at IS NULL`;
      const values: any[] = [];
      let paramCount = 1;
      if (params.petId) { queryText += ` AND m.pet_id = $${paramCount++}`; values.push(params.petId); }
      if (params.active === 'true') { queryText += ` AND m.active = true`; }
      if (user.userType === 'pet_owner') { queryText += ` AND p.owner_id = $${paramCount++}`; values.push(user.id); }
      queryText += ' ORDER BY m.start_date DESC';
      const result = await query(queryText, values);
      return successResponse(camelCaseRows(result.rows));
    }

    // GET /medications/active
    if (path === '/active' && event.httpMethod === 'GET') {
      let queryText = `SELECT m.*, u.full_name AS prescribed_by_name FROM medications m
                       LEFT JOIN users u ON m.prescribed_by = u.id
                       JOIN pets p ON m.pet_id = p.id
                       WHERE m.deleted_at IS NULL AND m.active = true`;
      const values: any[] = [];
      let paramCount = 1;
      if (user.userType === 'pet_owner') { queryText += ` AND p.owner_id = $${paramCount++}`; values.push(user.id); }
      queryText += ' ORDER BY m.start_date DESC';
      const result = await query(queryText, values);
      return successResponse(camelCaseRows(result.rows));
    }

    // GET /medications/pet/:petId
    const petMatch = path.match(/^\/pet\/([^\/]+)$/);
    if (petMatch && event.httpMethod === 'GET') {
      const petId = petMatch[1];
      let queryText = `SELECT m.*, u.full_name AS prescribed_by_name FROM medications m
                       LEFT JOIN users u ON m.prescribed_by = u.id
                       JOIN pets p ON m.pet_id = p.id
                       WHERE m.pet_id = $1 AND m.deleted_at IS NULL`;
      const values: any[] = [petId];
      if (user.userType === 'pet_owner') { queryText += ' AND p.owner_id = $2'; values.push(user.id); }
      queryText += ' ORDER BY m.start_date DESC';
      const result = await query(queryText, values);
      return successResponse(camelCaseRows(result.rows));
    }

    // POST /medications
    if (path === '' && event.httpMethod === 'POST') {
      const { petId, name, dosage, startDate, endDate, active } = body;
      if (!petId || !name || !dosage || !startDate) throw new Error('Missing required fields');
      const result = await query(
        `INSERT INTO medications (pet_id, name, dosage, start_date, end_date, prescribed_by, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [petId, name, dosage, startDate, endDate || null, user.id, active !== undefined ? !!active : true]
      );
      return successResponse(camelCaseRow(result.rows[0]), 201);
    }

    // Handle /:id/deactivate
    const deactivateMatch = path.match(/^\/([^\/]+)\/deactivate$/);
    if (deactivateMatch && event.httpMethod === 'PATCH') {
      const medId = deactivateMatch[1];
      const result = await query(
        `UPDATE medications SET active = false, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND deleted_at IS NULL RETURNING *`,
        [medId]
      );
      if (result.rows.length === 0) throw new Error('Medication not found');
      return successResponse(camelCaseRow(result.rows[0]));
    }

    // Handle /:id routes
    const routeParams = parsePath({ path }, '/:medId');
    if (routeParams) {
      const medId = routeParams.medId;
      if (event.httpMethod === 'GET') {
        const result = await query(
          `SELECT m.*, u.full_name AS prescribed_by_name FROM medications m
           LEFT JOIN users u ON m.prescribed_by = u.id
           WHERE m.id = $1 AND m.deleted_at IS NULL`,
          [medId]
        );
        if (result.rows.length === 0) throw new Error('Medication not found');
        return successResponse(camelCaseRow(result.rows[0]));
      }
      if (event.httpMethod === 'PATCH') {
        const { name, dosage, startDate, endDate, active } = body;

        const { clause, values, nextParam } = buildUpdateSet({
          name,
          dosage,
          start_date: startDate,
          end_date: endDate,
          active: active !== undefined ? !!active : undefined,
        });

        values.push(medId);
        const result = await query(
          `UPDATE medications SET ${clause}, updated_at = CURRENT_TIMESTAMP
           WHERE id = $${nextParam} AND deleted_at IS NULL RETURNING *`,
          values
        );
        if (result.rows.length === 0) throw new Error('Medication not found');
        return successResponse(camelCaseRow(result.rows[0]));
      }
      if (event.httpMethod === 'DELETE') {
        await query('UPDATE medications SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [medId]);
        return successResponse({ message: 'Medication record deleted successfully' });
      }
    }

    return errorResponse(new Error('Route not found'), 404);
  } catch (error: any) {
    return errorResponse(error);
  }
};

export { handler };