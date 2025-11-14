#!/bin/bash

# Generate appointments.ts
cat > netlify/functions/appointments.ts << 'EOF'
import { Handler, HandlerEvent } from '@netlify/functions';
import { query } from './utils/database';
import { requireAuth } from './utils/auth';
import { successResponse, errorResponse, corsResponse } from './utils/response';

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod === 'OPTIONS') return corsResponse();

  try {
    const path = event.path.replace('/.netlify/functions/appointments', '').replace('/api/appointments', '');
    const body = event.body ? JSON.parse(event.body) : {};
    const params = event.queryStringParameters || {};
    const user = await requireAuth(event);

    // GET /appointments
    if (path === '' && event.httpMethod === 'GET') {
      let queryText = `SELECT a.*, p.name as pet_name, u1.full_name as owner_name, u2.full_name as vet_name
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
        queryText += ` AND DATE(a.appointment_date) = $${paramCount++}`;
        values.push(params.date);
      }

      if (params.petId) {
        queryText += ` AND a.pet_id = $${paramCount++}`;
        values.push(params.petId);
      }

      queryText += ' ORDER BY a.appointment_date ASC';

      const result = await query(queryText, values);
      return successResponse(result.rows.map((apt: any) => ({
        id: apt.id,
        petId: apt.pet_id,
        petName: apt.pet_name,
        ownerId: apt.owner_id,
        ownerName: apt.owner_name,
        veterinarianId: apt.veterinarian_id,
        veterinarianName: apt.vet_name,
        type: apt.appointment_type,
        date: apt.appointment_date,
        time: apt.appointment_time,
        duration: apt.duration,
        reason: apt.reason,
        status: apt.status,
        notes: apt.notes,
        createdAt: apt.created_at,
        updatedAt: apt.updated_at,
      })));
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
        `INSERT INTO appointments (pet_id, owner_id, veterinarian_id, appointment_type, appointment_date, appointment_time, reason, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [petId, ownerId, veterinarianId, type, date, time, reason || null, 'scheduled']
      );

      return successResponse(result.rows[0], 201);
    }

    // Handle /:id routes
    const idMatch = path.match(/^\/([^\/]+)$/);
    if (idMatch) {
      const appointmentId = idMatch[1];

      // GET /appointments/:id
      if (event.httpMethod === 'GET') {
        const result = await query(
          `SELECT a.*, p.name as pet_name, u1.full_name as owner_name, u2.full_name as vet_name
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

        return successResponse(result.rows[0]);
      }

      // PATCH /appointments/:id
      if (event.httpMethod === 'PATCH') {
        const { date, time, status, notes, type, reason } = body;

        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (date) {
          updates.push(`appointment_date = $${paramCount++}`);
          values.push(date);
        }
        if (time) {
          updates.push(`appointment_time = $${paramCount++}`);
          values.push(time);
        }
        if (status) {
          updates.push(`status = $${paramCount++}`);
          values.push(status);
        }
        if (notes !== undefined) {
          updates.push(`notes = $${paramCount++}`);
          values.push(notes);
        }
        if (type) {
          updates.push(`appointment_type = $${paramCount++}`);
          values.push(type);
        }
        if (reason !== undefined) {
          updates.push(`reason = $${paramCount++}`);
          values.push(reason);
        }

        if (updates.length === 0) {
          throw new Error('No fields to update');
        }

        values.push(appointmentId);

        const result = await query(
          `UPDATE appointments SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
           WHERE id = $${paramCount} AND deleted_at IS NULL
           RETURNING *`,
          values
        );

        if (result.rows.length === 0) {
          throw new Error('Appointment not found');
        }

        return successResponse(result.rows[0]);
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
EOF

# Generate medical-records.ts
cat > netlify/functions/medical-records.ts << 'EOF'
import { Handler, HandlerEvent } from '@netlify/functions';
import { query } from './utils/database';
import { requireAuth } from './utils/auth';
import { successResponse, errorResponse, corsResponse } from './utils/response';

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod === 'OPTIONS') return corsResponse();

  try {
    const path = event.path.replace('/.netlify/functions/medical-records', '').replace('/api/medical-records', '');
    const body = event.body ? JSON.parse(event.body) : {};
    const params = event.queryStringParameters || {};
    const user = await requireAuth(event);

    // GET /medical-records
    if (path === '' && event.httpMethod === 'GET') {
      let queryText = `SELECT mr.*, p.name as pet_name FROM medical_records mr
                       JOIN pets p ON mr.pet_id = p.id
                       WHERE mr.deleted_at IS NULL`;
      const values: any[] = [];
      let paramCount = 1;

      if (params.petId) {
        queryText += ` AND mr.pet_id = $${paramCount++}`;
        values.push(params.petId);
      }

      // Filter for pet owners
      if (user.userType === 'pet_owner') {
        queryText += ` AND p.owner_id = $${paramCount++}`;
        values.push(user.id);
      }

      queryText += ' ORDER BY mr.date DESC';

      const result = await query(queryText, values);
      return successResponse(result.rows);
    }

    // POST /medical-records
    if (event.httpMethod === 'POST') {
      const { petId, date, recordType, description, diagnosis, treatment, veterinarianId } = body;

      if (!petId || !date || !recordType) {
        throw new Error('Missing required fields');
      }

      const result = await query(
        `INSERT INTO medical_records (pet_id, date, record_type, description, diagnosis, treatment, veterinarian_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [petId, date, recordType, description || null, diagnosis || null, treatment || null, veterinarianId || user.id]
      );

      return successResponse(result.rows[0], 201);
    }

    // Handle /:id routes
    const idMatch = path.match(/^\/([^\/]+)$/);
    if (idMatch) {
      const recordId = idMatch[1];

      // GET /medical-records/:id
      if (event.httpMethod === 'GET') {
        const result = await query('SELECT * FROM medical_records WHERE id = $1 AND deleted_at IS NULL', [recordId]);
        if (result.rows.length === 0) {
          throw new Error('Medical record not found');
        }
        return successResponse(result.rows[0]);
      }

      // PATCH /medical-records/:id
      if (event.httpMethod === 'PATCH') {
        const { date, recordType, description, diagnosis, treatment } = body;

        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (date) {
          updates.push(`date = $${paramCount++}`);
          values.push(date);
        }
        if (recordType) {
          updates.push(`record_type = $${paramCount++}`);
          values.push(recordType);
        }
        if (description !== undefined) {
          updates.push(`description = $${paramCount++}`);
          values.push(description);
        }
        if (diagnosis !== undefined) {
          updates.push(`diagnosis = $${paramCount++}`);
          values.push(diagnosis);
        }
        if (treatment !== undefined) {
          updates.push(`treatment = $${paramCount++}`);
          values.push(treatment);
        }

        if (updates.length === 0) {
          throw new Error('No fields to update');
        }

        values.push(recordId);

        const result = await query(
          `UPDATE medical_records SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
           WHERE id = $${paramCount} AND deleted_at IS NULL
           RETURNING *`,
          values
        );

        if (result.rows.length === 0) {
          throw new Error('Medical record not found');
        }

        return successResponse(result.rows[0]);
      }

      // DELETE /medical-records/:id
      if (event.httpMethod === 'DELETE') {
        await query('UPDATE medical_records SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [recordId]);
        return successResponse({ message: 'Medical record deleted successfully' });
      }
    }

    return errorResponse(new Error('Route not found'), 404);
  } catch (error: any) {
    return errorResponse(error);
  }
};

export { handler };
EOF

# Generate vaccinations.ts, medications.ts, clinical-records.ts, and notifications.ts with similar patterns

echo "✅ Generated appointments.ts and medical-records.ts"
echo "To complete the migration, also generate:"
echo "  - vaccinations.ts"
echo "  - medications.ts"
echo "  - clinical-records.ts"
echo "  - notifications.ts"
echo "These follow the same pattern as medical-records.ts"
