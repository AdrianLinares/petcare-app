import { Router, Response } from 'express';
import { query } from '../config/database.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get clinical records for a specific pet
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
      `SELECT cr.*, u.full_name as veterinarian_name, a.appointment_type
       FROM clinical_records cr
       LEFT JOIN users u ON cr.veterinarian_id = u.id
       LEFT JOIN appointments a ON cr.appointment_id = a.id
       WHERE cr.pet_id = $1
       ORDER BY cr.date DESC, cr.created_at DESC`,
      [petId]
    );

    res.json(result.rows.map((record: any) => ({
      id: record.id,
      petId: record.pet_id,
      appointmentId: record.appointment_id,
      appointmentType: record.appointment_type,
      veterinarianId: record.veterinarian_id,
      veterinarianName: record.veterinarian_name,
      date: record.date,
      symptoms: record.symptoms,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      medications: record.medications,
      notes: record.notes,
      followUpDate: record.follow_up_date,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    })));
  } catch (error: any) {
    console.error('Get clinical records error:', error);
    res.status(500).json({ error: 'Failed to get clinical records' });
  }
});

// Get single clinical record by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT cr.*, u.full_name as veterinarian_name, p.owner_id, a.appointment_type
       FROM clinical_records cr
       LEFT JOIN users u ON cr.veterinarian_id = u.id
       JOIN pets p ON cr.pet_id = p.id
       LEFT JOIN appointments a ON cr.appointment_id = a.id
       WHERE cr.id = $1 AND p.deleted_at IS NULL`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Clinical record not found' });
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
      appointmentId: record.appointment_id,
      appointmentType: record.appointment_type,
      veterinarianId: record.veterinarian_id,
      veterinarianName: record.veterinarian_name,
      date: record.date,
      symptoms: record.symptoms,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      medications: record.medications,
      notes: record.notes,
      followUpDate: record.follow_up_date,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    });
  } catch (error: any) {
    console.error('Get clinical record error:', error);
    res.status(500).json({ error: 'Failed to get clinical record' });
  }
});

// Create new clinical record (vets and admins only)
router.post('/', authorize('veterinarian', 'administrator'), async (req: AuthRequest, res: Response) => {
  try {
    const { petId, appointmentId, date, symptoms, diagnosis, treatment, medications, notes, followUpDate } = req.body;

    // Validate required fields
    if (!petId || !date || !symptoms || !diagnosis || !treatment) {
      res.status(400).json({ error: 'Pet ID, date, symptoms, diagnosis, and treatment are required' });
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

    // Check if appointment exists (if provided)
    if (appointmentId) {
      const appointmentResult = await query(
        'SELECT id FROM appointments WHERE id = $1',
        [appointmentId]
      );

      if (appointmentResult.rows.length === 0) {
        res.status(404).json({ error: 'Appointment not found' });
        return;
      }
    }

    const result = await query(
      `INSERT INTO clinical_records 
       (pet_id, appointment_id, veterinarian_id, date, symptoms, diagnosis, treatment, medications, notes, follow_up_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        petId,
        appointmentId || null,
        req.user!.id,
        date,
        symptoms,
        diagnosis,
        treatment,
        medications || null,
        notes || null,
        followUpDate || null,
      ]
    );

    const record = result.rows[0];

    res.status(201).json({
      id: record.id,
      petId: record.pet_id,
      appointmentId: record.appointment_id,
      veterinarianId: record.veterinarian_id,
      date: record.date,
      symptoms: record.symptoms,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      medications: record.medications,
      notes: record.notes,
      followUpDate: record.follow_up_date,
      createdAt: record.created_at,
    });
  } catch (error: any) {
    console.error('Create clinical record error:', error);
    res.status(500).json({ error: 'Failed to create clinical record' });
  }
});

// Update clinical record (vets and admins only)
router.patch('/:id', authorize('veterinarian', 'administrator'), async (req: AuthRequest, res: Response) => {
  try {
    const { date, symptoms, diagnosis, treatment, medications, notes, followUpDate } = req.body;

    // Check if record exists
    const checkResult = await query('SELECT id FROM clinical_records WHERE id = $1', [req.params.id]);

    if (checkResult.rows.length === 0) {
      res.status(404).json({ error: 'Clinical record not found' });
      return;
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (date !== undefined) {
      updates.push(`date = $${paramCount++}`);
      values.push(date);
    }
    if (symptoms !== undefined) {
      updates.push(`symptoms = $${paramCount++}`);
      values.push(symptoms);
    }
    if (diagnosis !== undefined) {
      updates.push(`diagnosis = $${paramCount++}`);
      values.push(diagnosis);
    }
    if (treatment !== undefined) {
      updates.push(`treatment = $${paramCount++}`);
      values.push(treatment);
    }
    if (medications !== undefined) {
      updates.push(`medications = $${paramCount++}`);
      values.push(medications);
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      values.push(notes);
    }
    if (followUpDate !== undefined) {
      updates.push(`follow_up_date = $${paramCount++}`);
      values.push(followUpDate);
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    values.push(req.params.id);

    const result = await query(
      `UPDATE clinical_records SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    const record = result.rows[0];

    res.json({
      id: record.id,
      petId: record.pet_id,
      appointmentId: record.appointment_id,
      veterinarianId: record.veterinarian_id,
      date: record.date,
      symptoms: record.symptoms,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      medications: record.medications,
      notes: record.notes,
      followUpDate: record.follow_up_date,
      updatedAt: record.updated_at,
    });
  } catch (error: any) {
    console.error('Update clinical record error:', error);
    res.status(500).json({ error: 'Failed to update clinical record' });
  }
});

// Delete clinical record (admins only)
router.delete('/:id', authorize('administrator'), async (req: AuthRequest, res: Response) => {
  try {
    const result = await query('DELETE FROM clinical_records WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Clinical record not found' });
      return;
    }

    res.json({ message: 'Clinical record deleted successfully' });
  } catch (error: any) {
    console.error('Delete clinical record error:', error);
    res.status(500).json({ error: 'Failed to delete clinical record' });
  }
});

export default router;
