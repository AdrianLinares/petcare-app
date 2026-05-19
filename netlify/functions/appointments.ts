/**
 * Appointments Serverless Function
 *
 * API Endpoints:
 * GET    /appointments       - List appointments (filtered by role)
 * POST   /appointments       - Create new appointment
 * GET    /appointments/:id   - Get specific appointment
 * PATCH  /appointments/:id   - Update appointment (status, notes)
 * DELETE /appointments/:id   - Cancel appointment (soft delete)
 *
 * Query Parameters (GET /appointments):
 * - status: Filter by appointment status
 * - date: Filter by specific date (YYYY-MM-DD)
 * - petId: Filter by specific pet
 */

import { Handler, HandlerEvent } from '@netlify/functions';
import { query } from './utils/database';
import { requireAuth } from './utils/auth';
import { successResponse, errorResponse, corsResponse } from './utils/response';
import { camelCaseRows, camelCaseRow, buildUpdateSet, parsePath } from './utils/db-helpers';

/** Rename appointmentType → type after camelCase conversion for API compatibility */
function formatAppointment(row: any) {
  if (!row) return null;
  const { appointmentType, ...rest } = row;
  return { ...rest, type: appointmentType };
}

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod === 'OPTIONS') return corsResponse();

  try {
    const path = event.path.replace('/.netlify/functions/appointments', '').replace('/api/appointments', '');
    const body = event.body ? JSON.parse(event.body) : {};
    const params = event.queryStringParameters || {};
    const user = await requireAuth(event);

    // GET /appointments
    if (path === '' && event.httpMethod === 'GET') {
      let queryText = `SELECT a.*, p.name as pet_name, u1.full_name as owner_name, u2.full_name as veterinarian_name
                       FROM appointments a
                       JOIN pets p ON a.pet_id = p.id
                       JOIN users u1 ON a.owner_id = u1.id
                       JOIN users u2 ON a.veterinarian_id = u2.id
                       WHERE a.deleted_at IS NULL`;
      const values: any[] = [];
      let paramCount = 1;

      if (user.userType === 'pet_owner') {
        queryText += ` AND a.owner_id = $${paramCount++}`;
        values.push(user.id);
      } else if (user.userType === 'veterinarian') {
        queryText += ` AND a.veterinarian_id = $${paramCount++}`;
        values.push(user.id);
      }

      if (params.status) {
        queryText += ` AND a.status = $${paramCount++}`;
        values.push(params.status);
      }

      if (params.date) {
        queryText += ` AND DATE(a.date) = $${paramCount++}`;
        values.push(params.date);
      }

      if (params.petId) {
        queryText += ` AND a.pet_id = $${paramCount++}`;
        values.push(params.petId);
      }

      queryText += ' ORDER BY a.date ASC';

      const result = await query(queryText, values);
      return successResponse(camelCaseRows(result.rows).map(formatAppointment));
    }

    // POST /appointments
    if (path === '' && event.httpMethod === 'POST') {
      const { petId, veterinarianId, type, date, time, reason } = body;

      if (!petId || !veterinarianId || !type || !date || !time) {
        throw new Error('Missing required fields');
      }

      // Get pet owner
      const petResult = await query('SELECT owner_id FROM pets WHERE id = $1', [petId]);
      if (petResult.rows.length === 0) {
        throw new Error('Pet not found');
      }

      const ownerId = petResult.rows[0].owner_id;

      const result = await query(
        `INSERT INTO appointments (pet_id, owner_id, veterinarian_id, appointment_type, date, time, reason, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [petId, ownerId, veterinarianId, type, date, time, reason || null, 'scheduled']
      );

      return successResponse(formatAppointment(camelCaseRow(result.rows[0])), 201);
    }

    // Handle /:id routes
    const routeParams = parsePath({ path }, '/:appointmentId');
    if (routeParams) {
      const appointmentId = routeParams.appointmentId;

      // GET /appointments/:id
      if (event.httpMethod === 'GET') {
        const result = await query(
          `SELECT a.*, p.name as pet_name, u1.full_name as owner_name, u2.full_name as veterinarian_name
           FROM appointments a
           JOIN pets p ON a.pet_id = p.id
           JOIN users u1 ON a.owner_id = u1.id
           JOIN users u2 ON a.veterinarian_id = u2.id
           WHERE a.id = $1 AND a.deleted_at IS NULL`,
          [appointmentId]
        );

        if (result.rows.length === 0) {
          throw new Error('Appointment not found');
        }

        return successResponse(formatAppointment(camelCaseRow(result.rows[0])));
      }

      // PATCH /appointments/:id
      if (event.httpMethod === 'PATCH') {
        const { date, time, status, notes, type, reason } = body;

        const { clause, values, nextParam } = buildUpdateSet({
          date,
          time,
          status,
          notes,
          appointment_type: type,
          reason,
        });

        values.push(appointmentId);

        const result = await query(
          `UPDATE appointments SET ${clause}, updated_at = CURRENT_TIMESTAMP
           WHERE id = $${nextParam} AND deleted_at IS NULL
           RETURNING *`,
          values
        );

        if (result.rows.length === 0) {
          throw new Error('Appointment not found');
        }

        return successResponse(formatAppointment(camelCaseRow(result.rows[0])));
      }

      // DELETE /appointments/:id
      if (event.httpMethod === 'DELETE') {
        await query('UPDATE appointments SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [appointmentId]);
        return successResponse({ message: 'Appointment deleted successfully' });
      }
    }

    return errorResponse(new Error('Route not found'), 404);
  } catch (error: any) {
    return errorResponse(error);
  }
};

export { handler };