import { Router, Response } from 'express';
import { query } from '../config/database.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';
import { NotificationService } from '../services/notificationService.js';

const router = Router();

router.use(authenticate);

// Get appointments
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { status, date, petId } = req.query;
    let queryText = `
      SELECT a.*, p.name as pet_name, u.full_name as owner_name, v.full_name as vet_name
      FROM appointments a
      JOIN pets p ON a.pet_id = p.id
      JOIN users u ON a.owner_id = u.id
      JOIN users v ON a.veterinarian_id = v.id
      WHERE 1=1
    `;
    const values: any[] = [];
    let paramCount = 1;

    // Filter based on user role
    if (req.user!.userType === 'pet_owner') {
      queryText += ` AND a.owner_id = $${paramCount++}`;
      values.push(req.user!.id);
    } else if (req.user!.userType === 'veterinarian') {
      queryText += ` AND a.veterinarian_id = $${paramCount++}`;
      values.push(req.user!.id);
    }

    if (status) {
      queryText += ` AND a.status = $${paramCount++}`;
      values.push(status);
    }
    if (date) {
      queryText += ` AND a.date = $${paramCount++}`;
      values.push(date);
    }
    if (petId) {
      queryText += ` AND a.pet_id = $${paramCount++}`;
      values.push(petId);
    }

    queryText += ' ORDER BY a.date DESC, a.time DESC';

    const result = await query(queryText, values);

    res.json(result.rows.map((apt: any) => ({
      id: apt.id,
      petId: apt.pet_id,
      petName: apt.pet_name,
      ownerId: apt.owner_id,
      ownerName: apt.owner_name,
      veterinarianId: apt.veterinarian_id,
      veterinarianName: apt.vet_name,
      type: apt.appointment_type,
      date: apt.date,
      time: apt.time,
      reason: apt.reason,
      notes: apt.notes,
      status: apt.status,
      diagnosis: apt.diagnosis,
      treatment: apt.treatment,
      followUpDate: apt.follow_up_date,
      createdAt: apt.created_at,
    })));
  } catch (error: any) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Failed to get appointments' });
  }
});

// Create appointment (owners only)
router.post('/', authorize('pet_owner'), async (req: AuthRequest, res: Response) => {
  try {
    const { petId, veterinarianId, type, date, time, reason } = req.body;

    if (!petId || !veterinarianId || !type || !date || !time) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Verify pet ownership
    const petCheck = await query(
      'SELECT id FROM pets WHERE id = $1 AND owner_id = $2 AND deleted_at IS NULL',
      [petId, req.user!.id]
    );
    if (petCheck.rows.length === 0) {
      res.status(403).json({ error: 'Pet not found or access denied' });
      return;
    }

    // Verify veterinarian exists
    const vetCheck = await query(
      'SELECT id FROM users WHERE id = $1 AND user_type = $2 AND deleted_at IS NULL',
      [veterinarianId, 'veterinarian']
    );
    if (vetCheck.rows.length === 0) {
      res.status(400).json({ error: 'Invalid veterinarian' });
      return;
    }

    const result = await query(
      `INSERT INTO appointments 
       (pet_id, owner_id, veterinarian_id, appointment_type, date, time, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [petId, req.user!.id, veterinarianId, type, date, time, reason || null, 'scheduled']
    );

    const appointment = result.rows[0];

    // Create appointment reminder
    await NotificationService.createAppointmentReminder(appointment.id);

    res.status(201).json({
      id: appointment.id,
      petId: appointment.pet_id,
      ownerId: appointment.owner_id,
      veterinarianId: appointment.veterinarian_id,
      type: appointment.appointment_type,
      date: appointment.date,
      time: appointment.time,
      reason: appointment.reason,
      status: appointment.status,
      createdAt: appointment.created_at,
    });
  } catch (error: any) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// Update appointment
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { status, diagnosis, treatment, notes, followUpDate } = req.body;

    const aptCheck = await query(
      'SELECT owner_id, veterinarian_id, status FROM appointments WHERE id = $1',
      [req.params.id]
    );

    if (aptCheck.rows.length === 0) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    const apt = aptCheck.rows[0];

    // Owners can only cancel, vets can update clinical info
    if (req.user!.userType === 'pet_owner' && apt.owner_id !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    if (req.user!.userType === 'veterinarian' && apt.veterinarian_id !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (diagnosis !== undefined) {
      updates.push(`diagnosis = $${paramCount++}`);
      values.push(diagnosis);
    }
    if (treatment !== undefined) {
      updates.push(`treatment = $${paramCount++}`);
      values.push(treatment);
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
      `UPDATE appointments SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramCount} 
       RETURNING *`,
      values
    );

    const appointment = result.rows[0];

    // Notify if cancelled
    if (status === 'cancelled' && apt.status !== 'cancelled') {
      await NotificationService.createNotification({
        userId: apt.owner_id,
        type: 'appointment_cancelled',
        title: 'Appointment Cancelled',
        message: 'Your appointment has been cancelled.',
        relatedEntityType: 'appointment',
        relatedEntityId: appointment.id,
        priority: 'high',
      });
    }

    res.json({
      id: appointment.id,
      status: appointment.status,
      diagnosis: appointment.diagnosis,
      treatment: appointment.treatment,
      notes: appointment.notes,
      followUpDate: appointment.follow_up_date,
    });
  } catch (error: any) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

export default router;
