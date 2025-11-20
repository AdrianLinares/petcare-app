import { Handler } from '@netlify/functions';
import { query } from './utils/database';
import { requireAuth } from './utils/auth';
import { successResponse, errorResponse, corsResponse } from './utils/response';

function mapMedication(row: any) {
  return {
    id: row.id,
    petId: row.pet_id,
    name: row.name,
    dosage: row.dosage,
    startDate: row.start_date,
    endDate: row.end_date,
    prescribedBy: row.prescribed_by,
    prescribedByName: row.prescribed_by_name || null,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

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
      return successResponse(result.rows.map(mapMedication));
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
      return successResponse(result.rows.map(mapMedication));
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
      return successResponse(result.rows.map(mapMedication));
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
      return successResponse(mapMedication(result.rows[0]), 201);
    }

    // Handle /:id and /:id/deactivate
    const deactivateMatch = path.match(/^\/([^\/]+)\/deactivate$/);
    if (deactivateMatch && event.httpMethod === 'PATCH') {
      const medId = deactivateMatch[1];
      const result = await query(
        `UPDATE medications SET active = false, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND deleted_at IS NULL RETURNING *`,
        [medId]
      );
      if (result.rows.length === 0) throw new Error('Medication not found');
      return successResponse(mapMedication(result.rows[0]));
    }

    const idMatch = path.match(/^\/([^\/]+)$/);
    if (idMatch) {
      const medId = idMatch[1];
      if (event.httpMethod === 'GET') {
        const result = await query(
          `SELECT m.*, u.full_name AS prescribed_by_name FROM medications m
           LEFT JOIN users u ON m.prescribed_by = u.id
           WHERE m.id = $1 AND m.deleted_at IS NULL`,
          [medId]
        );
        if (result.rows.length === 0) throw new Error('Medication not found');
        return successResponse(mapMedication(result.rows[0]));
      }
      if (event.httpMethod === 'PATCH') {
        const { name, dosage, startDate, endDate, active } = body;
        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;
        if (name !== undefined) { updates.push(`name = $${paramCount++}`); values.push(name); }
        if (dosage !== undefined) { updates.push(`dosage = $${paramCount++}`); values.push(dosage); }
        if (startDate !== undefined) { updates.push(`start_date = $${paramCount++}`); values.push(startDate); }
        if (endDate !== undefined) { updates.push(`end_date = $${paramCount++}`); values.push(endDate); }
        if (active !== undefined) { updates.push(`active = $${paramCount++}`); values.push(!!active); }
        if (updates.length === 0) throw new Error('No fields to update');
        values.push(medId);
        const result = await query(
          `UPDATE medications SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
           WHERE id = $${paramCount} AND deleted_at IS NULL RETURNING *`,
          values
        );
        if (result.rows.length === 0) throw new Error('Medication not found');
        return successResponse(mapMedication(result.rows[0]));
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
