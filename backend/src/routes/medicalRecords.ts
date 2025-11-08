import { Router, Response } from 'express';
import { query } from '../config/database.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get medical records for a specific pet
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
      `SELECT mr.*, u.full_name as veterinarian_name_full 
       FROM medical_records mr
       LEFT JOIN users u ON mr.veterinarian_id = u.id
       WHERE mr.pet_id = $1
       ORDER BY mr.date DESC, mr.created_at DESC`,
      [petId]
    );

    res.json(result.rows.map((record: any) => ({
      id: record.id,
      petId: record.pet_id,
      date: record.date,
      recordType: record.record_type,
      description: record.description,
      veterinarianId: record.veterinarian_id,
      veterinarianName: record.veterinarian_name_full || record.veterinarian_name,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    })));
  } catch (error: any) {
    console.error('Get medical records error:', error);
    res.status(500).json({ error: 'Failed to get medical records' });
  }
});

// Get single medical record by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT mr.*, u.full_name as veterinarian_name_full, p.owner_id
       FROM medical_records mr
       LEFT JOIN users u ON mr.veterinarian_id = u.id
       JOIN pets p ON mr.pet_id = p.id
       WHERE mr.id = $1 AND p.deleted_at IS NULL`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Medical record not found' });
      return;
    }

    const record = result.rows[0];

    // Check authorization
    if (req.user!.userType === 'pet_owner' && record.owner_id !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({
      id: record.id,
      petId: record.pet_id,
      date: record.date,
      recordType: record.record_type,
      description: record.description,
      veterinarianId: record.veterinarian_id,
      veterinarianName: record.veterinarian_name_full || record.veterinarian_name,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    });
  } catch (error: any) {
    console.error('Get medical record error:', error);
    res.status(500).json({ error: 'Failed to get medical record' });
  }
});

// Create new medical record (vets and admins only)
router.post('/', authorize('veterinarian', 'administrator'), async (req: AuthRequest, res: Response) => {
  try {
    const { petId, date, recordType, description } = req.body;

    // Validate required fields
    if (!petId || !date || !recordType || !description) {
      res.status(400).json({ error: 'Pet ID, date, record type, and description are required' });
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
      `INSERT INTO medical_records (pet_id, date, record_type, description, veterinarian_id, veterinarian_name)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [petId, date, recordType, description, req.user!.id, req.user!.fullName]
    );

    const record = result.rows[0];

    res.status(201).json({
      id: record.id,
      petId: record.pet_id,
      date: record.date,
      recordType: record.record_type,
      description: record.description,
      veterinarianId: record.veterinarian_id,
      veterinarianName: record.veterinarian_name,
      createdAt: record.created_at,
    });
  } catch (error: any) {
    console.error('Create medical record error:', error);
    res.status(500).json({ error: 'Failed to create medical record' });
  }
});

// Update medical record (vets and admins only)
router.patch('/:id', authorize('veterinarian', 'administrator'), async (req: AuthRequest, res: Response) => {
  try {
    const { date, recordType, description } = req.body;

    // Check if record exists
    const checkResult = await query('SELECT id FROM medical_records WHERE id = $1', [req.params.id]);

    if (checkResult.rows.length === 0) {
      res.status(404).json({ error: 'Medical record not found' });
      return;
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (date !== undefined) {
      updates.push(`date = $${paramCount++}`);
      values.push(date);
    }
    if (recordType !== undefined) {
      updates.push(`record_type = $${paramCount++}`);
      values.push(recordType);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    values.push(req.params.id);

    const result = await query(
      `UPDATE medical_records SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    const record = result.rows[0];

    res.json({
      id: record.id,
      petId: record.pet_id,
      date: record.date,
      recordType: record.record_type,
      description: record.description,
      veterinarianId: record.veterinarian_id,
      veterinarianName: record.veterinarian_name,
      updatedAt: record.updated_at,
    });
  } catch (error: any) {
    console.error('Update medical record error:', error);
    res.status(500).json({ error: 'Failed to update medical record' });
  }
});

// Delete medical record (admins only)
router.delete('/:id', authorize('administrator'), async (req: AuthRequest, res: Response) => {
  try {
    const result = await query('DELETE FROM medical_records WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Medical record not found' });
      return;
    }

    res.json({ message: 'Medical record deleted successfully' });
  } catch (error: any) {
    console.error('Delete medical record error:', error);
    res.status(500).json({ error: 'Failed to delete medical record' });
  }
});

export default router;
