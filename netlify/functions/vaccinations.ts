/**
 * Vaccinations Serverless Function
 *
 * API Endpoints:
 * GET    /vaccinations          - List all vaccinations (filtered by role)
 * GET    /vaccinations?petId=x  - Get vaccinations for specific pet
 * GET    /vaccinations/upcoming - Get vaccines due soon or overdue
 * POST   /vaccinations          - Create new vaccination record
 * PATCH  /vaccinations/:id      - Update vaccination record
 * DELETE /vaccinations/:id      - Delete vaccination record
 *
 * Role-Based Access:
 * - Pet Owners: See vaccinations for their pets only
 * - Veterinarians/Admins: See all vaccinations
 */

import { Handler } from '@netlify/functions';
import { query } from './utils/database';
import { requireAuth } from './utils/auth';
import { successResponse, errorResponse, corsResponse } from './utils/response';
import { camelCaseRows, camelCaseRow, buildUpdateSet, parsePath } from './utils/db-helpers';

/** Handle OR fallbacks for veterinarian name after camelCase conversion */
function formatVaccination(row: any) {
  if (!row) return null;
  const { administeredByName: administeredByNameOrig, vetName, veterinarianName, ...rest } = row;
  return {
    ...rest,
    administeredByName: administeredByNameOrig || vetName || veterinarianName || null,
  };
}

const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return corsResponse();
  try {
    const user = await requireAuth(event);
    const path = event.path.replace('/.netlify/functions/vaccinations', '').replace('/api/vaccinations', '');
    const body = event.body ? JSON.parse(event.body) : {};
    const params = event.queryStringParameters || {};

    // GET /vaccinations (optional ?petId=)
    if (path === '' && event.httpMethod === 'GET') {
      let queryText = `SELECT v.*, u.full_name AS administered_by_name FROM vaccinations v
                       LEFT JOIN users u ON v.administered_by = u.id
                       JOIN pets p ON v.pet_id = p.id
                       WHERE v.deleted_at IS NULL`;
      const values: any[] = [];
      let paramCount = 1;
      if (params.petId) {
        queryText += ` AND v.pet_id = $${paramCount++}`;
        values.push(params.petId);
      }
      if (user.userType === 'pet_owner') {
        queryText += ` AND p.owner_id = $${paramCount++}`;
        values.push(user.id);
      }
      queryText += ' ORDER BY v.date DESC';
      const result = await query(queryText, values);
      return successResponse(camelCaseRows(result.rows).map(formatVaccination));
    }

    // GET /vaccinations/upcoming
    if (path === '/upcoming' && event.httpMethod === 'GET') {
      let queryText = `SELECT v.*, u.full_name AS administered_by_name FROM vaccinations v
                       LEFT JOIN users u ON v.administered_by = u.id
                       JOIN pets p ON v.pet_id = p.id
                       WHERE v.deleted_at IS NULL AND v.next_due IS NOT NULL`;
      const values: any[] = [];
      let paramCount = 1;
      if (user.userType === 'pet_owner') {
        queryText += ` AND p.owner_id = $${paramCount++}`;
        values.push(user.id);
      }
      queryText += ' ORDER BY v.next_due ASC';
      const result = await query(queryText, values);
      return successResponse(camelCaseRows(result.rows).map(formatVaccination));
    }

    // GET /vaccinations/pet/:petId
    const petMatch = path.match(/^\/pet\/([^\/]+)$/);
    if (petMatch && event.httpMethod === 'GET') {
      const petId = petMatch[1];
      let queryText = `SELECT v.*, u.full_name AS administered_by_name FROM vaccinations v
                       LEFT JOIN users u ON v.administered_by = u.id
                       JOIN pets p ON v.pet_id = p.id
                       WHERE v.pet_id = $1 AND v.deleted_at IS NULL`;
      const values: any[] = [petId];
      if (user.userType === 'pet_owner') {
        queryText += ' AND p.owner_id = $2';
        values.push(user.id);
      }
      queryText += ' ORDER BY v.date DESC';
      const result = await query(queryText, values);
      return successResponse(camelCaseRows(result.rows).map(formatVaccination));
    }

    // POST /vaccinations
    if (path === '' && event.httpMethod === 'POST') {
      const { petId, vaccine, date, nextDue } = body;
      if (!petId || !vaccine || !date) throw new Error('Missing required fields');
      const result = await query(
        `INSERT INTO vaccinations (pet_id, vaccine, date, next_due, administered_by)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [petId, vaccine, date, nextDue || null, user.id]
      );
      return successResponse(formatVaccination(camelCaseRow(result.rows[0])), 201);
    }

    // Handle /:id routes
    const routeParams = parsePath({ path }, '/:vaccinationId');
    if (routeParams) {
      const vaccinationId = routeParams.vaccinationId;
      if (event.httpMethod === 'GET') {
        const result = await query(
          `SELECT v.*, u.full_name AS administered_by_name FROM vaccinations v
           LEFT JOIN users u ON v.administered_by = u.id
           WHERE v.id = $1 AND v.deleted_at IS NULL`,
          [vaccinationId]
        );
        if (result.rows.length === 0) throw new Error('Vaccination not found');
        return successResponse(formatVaccination(camelCaseRow(result.rows[0])));
      }
      if (event.httpMethod === 'PATCH') {
        const { vaccine, date, nextDue } = body;

        const { clause, values, nextParam } = buildUpdateSet({
          vaccine,
          date,
          next_due: nextDue,
        });

        values.push(vaccinationId);
        const result = await query(
          `UPDATE vaccinations SET ${clause}, updated_at = CURRENT_TIMESTAMP
           WHERE id = $${nextParam} AND deleted_at IS NULL RETURNING *`,
          values
        );
        if (result.rows.length === 0) throw new Error('Vaccination not found');
        return successResponse(formatVaccination(camelCaseRow(result.rows[0])));
      }
      if (event.httpMethod === 'DELETE') {
        await query('UPDATE vaccinations SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [vaccinationId]);
        return successResponse({ message: 'Vaccination record deleted successfully' });
      }
    }

    return errorResponse(new Error('Route not found'), 404);
  } catch (error: any) {
    return errorResponse(error);
  }
};

export { handler };