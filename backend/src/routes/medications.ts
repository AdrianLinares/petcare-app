import { Router, Response } from 'express';
import { query } from '../config/database.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get medications for a specific pet
router.get('/pet/:petId', async (req: AuthRequest, res: Response) => {
  try {
    const { petId } = req.params;

    // Check if pet exists and user has access
    const petResult = await query(
      'SELECT owner_id FROM pets WHERE id = $1 AND deleted_at IS NULL',
      [petId]
    );

    if (petResult.rows.length === 0) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }

    const pet = petResult.rows[0];

    // Pet owners can only see their own pets' records
    if (req.user!.userType === 'pet_owner' && pet.owner_id !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const result = await query(
      `SELECT m.*, u.full_name as prescribed_by_name
       FROM medications m
       LEFT JOIN users u ON m.prescribed_by = u.id
       WHERE m.pet_id = $1
       ORDER BY m.active DESC, m.start_date DESC, m.created_at DESC`,
      [petId]
    );

    res.json(result.rows.map((medication: any) => ({
      id: medication.id,
      petId: medication.pet_id,
      name: medication.name,
      dosage: medication.dosage,
      startDate: medication.start_date,
      endDate: medication.end_date,
      prescribedBy: medication.prescribed_by,
      prescribedByName: medication.prescribed_by_name,
      active: medication.active,
      createdAt: medication.created_at,
      updatedAt: medication.updated_at,
    })));
  } catch (error: any) {
    console.error('Get medications error:', error);
    res.status(500).json({ error: 'Failed to get medications' });
  }
});

// Get active medications across all pets (for reminders)
router.get('/active', async (req: AuthRequest, res: Response) => {
  try {
    let queryText = `
      SELECT m.*, p.name as pet_name, p.owner_id, u.full_name as owner_name
      FROM medications m
      JOIN pets p ON m.pet_id = p.id
      JOIN users u ON p.owner_id = u.id
      WHERE p.deleted_at IS NULL
        AND m.active = TRUE
        AND (m.end_date IS NULL OR m.end_date >= CURRENT_DATE)
    `;
    const values: any[] = [];

    // Pet owners only see their own pets
    if (req.user!.userType === 'pet_owner') {
      queryText += ' AND p.owner_id = $1';
      values.push(req.user!.id);
    }

    queryText += ' ORDER BY m.start_date DESC';

    const result = await query(queryText, values);

    res.json(result.rows.map((medication: any) => ({
      id: medication.id,
      petId: medication.pet_id,
      petName: medication.pet_name,
      ownerId: medication.owner_id,
      ownerName: medication.owner_name,
      name: medication.name,
      dosage: medication.dosage,
      startDate: medication.start_date,
      endDate: medication.end_date,
      active: medication.active,
    })));
  } catch (error: any) {
    console.error('Get active medications error:', error);
    res.status(500).json({ error: 'Failed to get active medications' });
  }
});

// Get single medication by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT m.*, u.full_name as prescribed_by_name, p.owner_id
       FROM medications m
       LEFT JOIN users u ON m.prescribed_by = u.id
       JOIN pets p ON m.pet_id = p.id
       WHERE m.id = $1 AND p.deleted_at IS NULL`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Medication record not found' });
      return;
    }

    const medication = result.rows[0];

    // Check authorization
    if (req.user!.userType === 'pet_owner' && medication.owner_id !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({
      id: medication.id,
      petId: medication.pet_id,
      name: medication.name,
      dosage: medication.dosage,
      startDate: medication.start_date,
      endDate: medication.end_date,
      prescribedBy: medication.prescribed_by,
      prescribedByName: medication.prescribed_by_name,
      active: medication.active,
      createdAt: medication.created_at,
      updatedAt: medication.updated_at,
    });
  } catch (error: any) {
    console.error('Get medication error:', error);
    res.status(500).json({ error: 'Failed to get medication record' });
  }
});

// Create new medication (vets and admins only)
router.post('/', authorize('veterinarian', 'administrator'), async (req: AuthRequest, res: Response) => {
  try {
    const { petId, name, dosage, startDate, endDate, active } = req.body;

    // Validate required fields
    if (!petId || !name || !dosage || !startDate) {
      res.status(400).json({ error: 'Pet ID, medication name, dosage, and start date are required' });
      return;
    }

    // Check if pet exists
    const petResult = await query(
      'SELECT id FROM pets WHERE id = $1 AND deleted_at IS NULL',
      [petId]
    );

    if (petResult.rows.length === 0) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }

    const result = await query(
      `INSERT INTO medications (pet_id, name, dosage, start_date, end_date, prescribed_by, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [petId, name, dosage, startDate, endDate || null, req.user!.id, active !== undefined ? active : true]
    );

    const medication = result.rows[0];

    res.status(201).json({
      id: medication.id,
      petId: medication.pet_id,
      name: medication.name,
      dosage: medication.dosage,
      startDate: medication.start_date,
      endDate: medication.end_date,
      prescribedBy: medication.prescribed_by,
      active: medication.active,
      createdAt: medication.created_at,
    });
  } catch (error: any) {
    console.error('Create medication error:', error);
    res.status(500).json({ error: 'Failed to create medication record' });
  }
});

// Update medication (vets and admins only)
router.patch('/:id', authorize('veterinarian', 'administrator'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, dosage, startDate, endDate, active } = req.body;

    // Check if record exists
    const checkResult = await query('SELECT id FROM medications WHERE id = $1', [req.params.id]);

    if (checkResult.rows.length === 0) {
      res.status(404).json({ error: 'Medication record not found' });
      return;
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (dosage !== undefined) {
      updates.push(`dosage = $${paramCount++}`);
      values.push(dosage);
    }
    if (startDate !== undefined) {
      updates.push(`start_date = $${paramCount++}`);
      values.push(startDate);
    }
    if (endDate !== undefined) {
      updates.push(`end_date = $${paramCount++}`);
      values.push(endDate);
    }
    if (active !== undefined) {
      updates.push(`active = $${paramCount++}`);
      values.push(active);
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    values.push(req.params.id);

    const result = await query(
      `UPDATE medications SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    const medication = result.rows[0];

    res.json({
      id: medication.id,
      petId: medication.pet_id,
      name: medication.name,
      dosage: medication.dosage,
      startDate: medication.start_date,
      endDate: medication.end_date,
      prescribedBy: medication.prescribed_by,
      active: medication.active,
      updatedAt: medication.updated_at,
    });
  } catch (error: any) {
    console.error('Update medication error:', error);
    res.status(500).json({ error: 'Failed to update medication record' });
  }
});

// Deactivate medication (vets and admins only) - soft delete by setting active to false
router.patch('/:id/deactivate', authorize('veterinarian', 'administrator'), async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'UPDATE medications SET active = FALSE WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Medication record not found' });
      return;
    }

    res.json({ message: 'Medication deactivated successfully', id: result.rows[0].id });
  } catch (error: any) {
    console.error('Deactivate medication error:', error);
    res.status(500).json({ error: 'Failed to deactivate medication' });
  }
});

// Delete medication (admins only)
router.delete('/:id', authorize('administrator'), async (req: AuthRequest, res: Response) => {
  try {
    const result = await query('DELETE FROM medications WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Medication record not found' });
      return;
    }

    res.json({ message: 'Medication record deleted successfully' });
  } catch (error: any) {
    console.error('Delete medication error:', error);
    res.status(500).json({ error: 'Failed to delete medication record' });
  }
});

export default router;
