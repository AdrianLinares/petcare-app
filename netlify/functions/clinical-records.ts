/**
 * Clinical Records Serverless Function
 *
 * API Endpoints:
 * GET    /clinical-records          - List all clinical records (filtered by role)
 * GET    /clinical-records?petId=x  - Get clinical records for specific pet
 * POST   /clinical-records          - Create new clinical record
 * PATCH  /clinical-records/:id      - Update clinical record
 * DELETE /clinical-records/:id      - Delete clinical record
 *
 * Role-Based Access:
 * - Pet Owners: Can VIEW clinical records for their pets (read-only)
 * - Veterinarians: Can CREATE and EDIT clinical records
 * - Administrators: Full access to all records
 */

import { Handler } from '@netlify/functions';
import { query } from './utils/database';
import { requireAuth } from './utils/auth';
import { successResponse, errorResponse, corsResponse } from './utils/response';
import { camelCaseRows, camelCaseRow, buildUpdateSet, parsePath } from './utils/db-helpers';

/** Handle OR fallbacks for veterinarian name after camelCase conversion */
function formatClinical(row: any) {
  if (!row) return null;
  const { veterinarianName: vetNameFromCol, vetName, ...rest } = row;
  return {
    ...rest,
    veterinarianName: vetNameFromCol || vetName || null,
    medications: rest.medications || [],
  };
}

const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return corsResponse();
  try {
    const user = await requireAuth(event);
    const path = event.path.replace('/.netlify/functions/clinical-records', '').replace('/api/clinical-records', '');
    const body = event.body ? JSON.parse(event.body) : {};

    // GET /clinical-records
    if (path === '' && event.httpMethod === 'GET') {
      let queryText = `SELECT cr.*, u.full_name AS veterinarian_name FROM clinical_records cr
                       LEFT JOIN users u ON cr.veterinarian_id = u.id
                       JOIN pets p ON cr.pet_id = p.id
                       WHERE cr.deleted_at IS NULL`;
      const values: any[] = [];
      let paramCount = 1;
      if (user.userType === 'pet_owner') {
        queryText += ` AND p.owner_id = $${paramCount++}`;
        values.push(user.id);
      }
      queryText += ' ORDER BY cr.date DESC';
      const result = await query(queryText, values);
      return successResponse(camelCaseRows(result.rows).map(formatClinical));
    }

    // GET /clinical-records/pet/:petId
    const petMatch = path.match(/^\/pet\/([^\/]+)$/);
    if (petMatch && event.httpMethod === 'GET') {
      const petId = petMatch[1];
      let queryText = `SELECT cr.*, u.full_name AS veterinarian_name FROM clinical_records cr
                       LEFT JOIN users u ON cr.veterinarian_id = u.id
                       JOIN pets p ON cr.pet_id = p.id
                       WHERE cr.pet_id = $1 AND cr.deleted_at IS NULL`;
      const values: any[] = [petId];
      if (user.userType === 'pet_owner') { queryText += ' AND p.owner_id = $2'; values.push(user.id); }
      queryText += ' ORDER BY cr.date DESC';
      const result = await query(queryText, values);
      return successResponse(camelCaseRows(result.rows).map(formatClinical));
    }

    // POST /clinical-records
    if (path === '' && event.httpMethod === 'POST') {
      const { petId, appointmentId, date, symptoms, diagnosis, treatment, medications, notes, followUpDate } = body;
      if (!petId || !date || !symptoms || !diagnosis || !treatment) throw new Error('Missing required fields');
      const result = await query(
        `INSERT INTO clinical_records (pet_id, appointment_id, date, symptoms, diagnosis, treatment, medications, follow_up_date, veterinarian_id, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [petId, appointmentId || null, date, symptoms, diagnosis, treatment, medications || null, followUpDate || null, user.id, notes || null]
      );
      return successResponse(formatClinical(camelCaseRow(result.rows[0])), 201);
    }

    // /:id routes
    const routeParams = parsePath({ path }, '/:clinicalId');
    if (routeParams) {
      const clinicalId = routeParams.clinicalId;
      if (event.httpMethod === 'GET') {
        const result = await query(
          `SELECT cr.*, u.full_name AS veterinarian_name FROM clinical_records cr
           LEFT JOIN users u ON cr.veterinarian_id = u.id
           WHERE cr.id = $1 AND cr.deleted_at IS NULL`,
          [clinicalId]
        );
        if (result.rows.length === 0) throw new Error('Clinical record not found');
        return successResponse(formatClinical(camelCaseRow(result.rows[0])));
      }
      if (event.httpMethod === 'PATCH') {
        const { date, symptoms, diagnosis, treatment, medications, notes, followUpDate } = body;

        const { clause, values, nextParam } = buildUpdateSet({
          date,
          symptoms,
          diagnosis,
          treatment,
          medications,
          notes,
          follow_up_date: followUpDate,
        });

        values.push(clinicalId);
        const result = await query(
          `UPDATE clinical_records SET ${clause}, updated_at = CURRENT_TIMESTAMP
           WHERE id = $${nextParam} AND deleted_at IS NULL RETURNING *`,
          values
        );
        if (result.rows.length === 0) throw new Error('Clinical record not found');
        return successResponse(formatClinical(camelCaseRow(result.rows[0])));
      }
      if (event.httpMethod === 'DELETE') {
        await query('UPDATE clinical_records SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [clinicalId]);
        return successResponse({ message: 'Clinical record deleted successfully' });
      }
    }

    return errorResponse(new Error('Route not found'), 404);
  } catch (error: any) {
    return errorResponse(error);
  }
};

export { handler };