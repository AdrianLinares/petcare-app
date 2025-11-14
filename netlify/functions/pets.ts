import { Handler, HandlerEvent } from '@netlify/functions';
import { query } from './utils/database';
import { requireAuth, requireRole } from './utils/auth';
import { successResponse, errorResponse, corsResponse } from './utils/response';

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod === 'OPTIONS') {
    return corsResponse();
  }

  try {
    const path = event.path.replace('/.netlify/functions/pets', '').replace('/api/pets', '');
    const body = event.body ? JSON.parse(event.body) : {};
    const user = await requireAuth(event);

    // GET /pets - Get all pets for current user or all if vet/admin
    if (path === '' && event.httpMethod === 'GET') {
      let queryText = `SELECT p.*, u.full_name as owner_name, u.email as owner_email 
                       FROM pets p 
                       JOIN users u ON p.owner_id = u.id 
                       WHERE p.deleted_at IS NULL`;
      const values: any[] = [];

      if (user.userType === 'pet_owner') {
        queryText += ' AND p.owner_id = $1';
        values.push(user.id);
      }

      queryText += ' ORDER BY p.created_at DESC';

      const result = await query(queryText, values);
      return successResponse(result.rows.map((pet: any) => ({
        id: pet.id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        dateOfBirth: pet.date_of_birth,
        gender: pet.gender,
        color: pet.color,
        microchipId: pet.microchip_id,
        weight: pet.weight,
        ownerId: pet.owner_id,
        ownerName: pet.owner_name,
        ownerEmail: pet.owner_email,
        medicalHistory: pet.medical_history,
        allergies: pet.allergies,
        currentMedications: pet.current_medications,
        createdAt: pet.created_at,
        updatedAt: pet.updated_at,
      })));
    }

    // POST /pets - Create new pet
    if (path === '' && event.httpMethod === 'POST') {
      const { name, species, breed, dateOfBirth, gender, color, microchipId, weight, ownerId } = body;

      if (!name || !species) {
        throw new Error('Name and species are required');
      }

      const ownerIdToUse = user.userType === 'pet_owner' ? user.id : ownerId;
      
      if (!ownerIdToUse) {
        throw new Error('Owner ID is required');
      }

      const result = await query(
        `INSERT INTO pets (name, species, breed, date_of_birth, gender, color, microchip_id, weight, owner_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [name, species, breed || null, dateOfBirth || null, gender || null, color || null, microchipId || null, weight || null, ownerIdToUse]
      );

      const pet = result.rows[0];
      return successResponse({
        id: pet.id,
        name: pet.name,
        species: pet.species,
        breed: pet.breed,
        dateOfBirth: pet.date_of_birth,
        gender: pet.gender,
        color: pet.color,
        microchipId: pet.microchip_id,
        weight: pet.weight,
        ownerId: pet.owner_id,
        createdAt: pet.created_at,
      }, 201);
    }

    // Handle /:id routes
    const idMatch = path.match(/^\/([^\/]+)$/);
    if (idMatch) {
      const petId = idMatch[1];

      // GET /pets/:id
      if (event.httpMethod === 'GET') {
        let queryText = 'SELECT p.*, u.full_name as owner_name FROM pets p JOIN users u ON p.owner_id = u.id WHERE p.id = $1 AND p.deleted_at IS NULL';
        const values = [petId];

        if (user.userType === 'pet_owner') {
          queryText += ' AND p.owner_id = $2';
          values.push(user.id);
        }

        const result = await query(queryText, values);

        if (result.rows.length === 0) {
          throw new Error('Pet not found');
        }

        const pet = result.rows[0];
        return successResponse({
          id: pet.id,
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          dateOfBirth: pet.date_of_birth,
          gender: pet.gender,
          color: pet.color,
          microchipId: pet.microchip_id,
          weight: pet.weight,
          ownerId: pet.owner_id,
          ownerName: pet.owner_name,
          medicalHistory: pet.medical_history,
          allergies: pet.allergies,
          currentMedications: pet.current_medications,
          createdAt: pet.created_at,
          updatedAt: pet.updated_at,
        });
      }

      // PATCH /pets/:id
      if (event.httpMethod === 'PATCH') {
        const { name, species, breed, dateOfBirth, gender, color, microchipId, weight, medicalHistory, allergies, currentMedications } = body;

        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (name !== undefined) {
          updates.push(`name = $${paramCount++}`);
          values.push(name);
        }
        if (species !== undefined) {
          updates.push(`species = $${paramCount++}`);
          values.push(species);
        }
        if (breed !== undefined) {
          updates.push(`breed = $${paramCount++}`);
          values.push(breed);
        }
        if (dateOfBirth !== undefined) {
          updates.push(`date_of_birth = $${paramCount++}`);
          values.push(dateOfBirth);
        }
        if (gender !== undefined) {
          updates.push(`gender = $${paramCount++}`);
          values.push(gender);
        }
        if (color !== undefined) {
          updates.push(`color = $${paramCount++}`);
          values.push(color);
        }
        if (microchipId !== undefined) {
          updates.push(`microchip_id = $${paramCount++}`);
          values.push(microchipId);
        }
        if (weight !== undefined) {
          updates.push(`weight = $${paramCount++}`);
          values.push(weight);
        }
        if (medicalHistory !== undefined) {
          updates.push(`medical_history = $${paramCount++}`);
          values.push(medicalHistory);
        }
        if (allergies !== undefined) {
          updates.push(`allergies = $${paramCount++}`);
          values.push(allergies);
        }
        if (currentMedications !== undefined) {
          updates.push(`current_medications = $${paramCount++}`);
          values.push(currentMedications);
        }

        if (updates.length === 0) {
          throw new Error('No fields to update');
        }

        values.push(petId);
        let whereClause = `id = $${paramCount}`;
        
        if (user.userType === 'pet_owner') {
          whereClause += ` AND owner_id = $${paramCount + 1}`;
          values.push(user.id);
        }

        const result = await query(
          `UPDATE pets SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
           WHERE ${whereClause} AND deleted_at IS NULL
           RETURNING *`,
          values
        );

        if (result.rows.length === 0) {
          throw new Error('Pet not found or access denied');
        }

        const pet = result.rows[0];
        return successResponse({
          id: pet.id,
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          dateOfBirth: pet.date_of_birth,
          gender: pet.gender,
          color: pet.color,
          microchipId: pet.microchip_id,
          weight: pet.weight,
          ownerId: pet.owner_id,
          medicalHistory: pet.medical_history,
          allergies: pet.allergies,
          currentMedications: pet.current_medications,
          updatedAt: pet.updated_at,
        });
      }

      // DELETE /pets/:id
      if (event.httpMethod === 'DELETE') {
        let queryText = 'UPDATE pets SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1';
        const values = [petId];

        if (user.userType === 'pet_owner') {
          queryText += ' AND owner_id = $2';
          values.push(user.id);
        }

        const result = await query(queryText, values);

        if (result.rowCount === 0) {
          throw new Error('Pet not found or access denied');
        }

        return successResponse({ message: 'Pet deleted successfully' });
      }
    }

    return errorResponse(new Error('Route not found'), 404);
  } catch (error: any) {
    return errorResponse(error);
  }
};

export { handler };
