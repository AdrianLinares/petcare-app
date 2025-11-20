import { Handler } from '@netlify/functions';
import { query } from './utils/database';
import { requireAuth } from './utils/auth';
import { successResponse, errorResponse, corsResponse } from './utils/response';

function mapClinical(row: any) {
  return {
    id: row.id,
    petId: row.pet_id,
    appointmentId: row.appointment_id,
    appointmentType: row.appointment_type || null,
    veterinarianId: row.veterinarian_id,
    veterinarianName: row.veterinarian_name || row.vet_name || null,
    date: row.date,
    symptoms: row.symptoms,
    diagnosis: row.diagnosis,
    treatment: row.treatment,
    medications: row.medications || [],
    notes: row.notes,
    followUpDate: row.follow_up_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
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
      return successResponse(result.rows.map(mapClinical));
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
      return successResponse(result.rows.map(mapClinical));
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
      return successResponse(mapClinical(result.rows[0]), 201);
    }

    // /:id routes
    const idMatch = path.match(/^\/([^\/]+)$/);
    if (idMatch) {
      const clinicalId = idMatch[1];
      if (event.httpMethod === 'GET') {
        const result = await query(
          `SELECT cr.*, u.full_name AS veterinarian_name FROM clinical_records cr
           LEFT JOIN users u ON cr.veterinarian_id = u.id
           WHERE cr.id = $1 AND cr.deleted_at IS NULL`,
          [clinicalId]
        );
        if (result.rows.length === 0) throw new Error('Clinical record not found');
        return successResponse(mapClinical(result.rows[0]));
      }
      if (event.httpMethod === 'PATCH') {
        const { date, symptoms, diagnosis, treatment, medications, notes, followUpDate } = body;
        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;
        if (date !== undefined) { updates.push(`date = $${paramCount++}`); values.push(date); }
        if (symptoms !== undefined) { updates.push(`symptoms = $${paramCount++}`); values.push(symptoms); }
        if (diagnosis !== undefined) { updates.push(`diagnosis = $${paramCount++}`); values.push(diagnosis); }
        if (treatment !== undefined) { updates.push(`treatment = $${paramCount++}`); values.push(treatment); }
        if (medications !== undefined) { updates.push(`medications = $${paramCount++}`); values.push(medications); }
        if (notes !== undefined) { updates.push(`notes = $${paramCount++}`); values.push(notes); }
        if (followUpDate !== undefined) { updates.push(`follow_up_date = $${paramCount++}`); values.push(followUpDate); }
        if (updates.length === 0) throw new Error('No fields to update');
        values.push(clinicalId);
        const result = await query(
          `UPDATE clinical_records SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
           WHERE id = $${paramCount} AND deleted_at IS NULL RETURNING *`,
          values
        );
        if (result.rows.length === 0) throw new Error('Clinical record not found');
        return successResponse(mapClinical(result.rows[0]));
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
