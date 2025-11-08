import { Router, Response } from 'express';
import { query } from '../config/database.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get vaccinations for a specific pet
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
      `SELECT v.*, u.full_name as administered_by_name
       FROM vaccinations v
       LEFT JOIN users u ON v.administered_by = u.id
       WHERE v.pet_id = $1
       ORDER BY v.date DESC, v.created_at DESC`,
      [petId]
    );

    res.json(result.rows.map((vaccination: any) => ({
      id: vaccination.id,
      petId: vaccination.pet_id,
      vaccine: vaccination.vaccine,
      date: vaccination.date,
      nextDue: vaccination.next_due,
      administeredBy: vaccination.administered_by,
      administeredByName: vaccination.administered_by_name,
      createdAt: vaccination.created_at,
      updatedAt: vaccination.updated_at,
    })));
  } catch (error: any) {
    console.error('Get vaccinations error:', error);
    res.status(500).json({ error: 'Failed to get vaccinations' });
  }
});

// Get upcoming vaccinations (next_due in the next 30 days)
router.get('/upcoming', async (req: AuthRequest, res: Response) => {
  try {
    let queryText = `
      SELECT v.*, p.name as pet_name, p.owner_id, u.full_name as owner_name
      FROM vaccinations v
      JOIN pets p ON v.pet_id = p.id
      JOIN users u ON p.owner_id = u.id
      WHERE p.deleted_at IS NULL
        AND v.next_due IS NOT NULL
        AND v.next_due BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
    `;
    const values: any[] = [];

    // Pet owners only see their own pets
    if (req.user!.userType === 'pet_owner') {
      queryText += ' AND p.owner_id = $1';
      values.push(req.user!.id);
    }

    queryText += ' ORDER BY v.next_due ASC';

    const result = await query(queryText, values);

    res.json(result.rows.map((vaccination: any) => ({
      id: vaccination.id,
      petId: vaccination.pet_id,
      petName: vaccination.pet_name,
      ownerId: vaccination.owner_id,
      ownerName: vaccination.owner_name,
      vaccine: vaccination.vaccine,
      date: vaccination.date,
      nextDue: vaccination.next_due,
    })));
  } catch (error: any) {
    console.error('Get upcoming vaccinations error:', error);
    res.status(500).json({ error: 'Failed to get upcoming vaccinations' });
  }
});

// Get single vaccination by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT v.*, u.full_name as administered_by_name, p.owner_id
       FROM vaccinations v
       LEFT JOIN users u ON v.administered_by = u.id
       JOIN pets p ON v.pet_id = p.id
       WHERE v.id = $1 AND p.deleted_at IS NULL`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Vaccination record not found' });
      return;
    }

    const vaccination = result.rows[0];

    // Check authorization
    if (req.user!.userType === 'pet_owner' && vaccination.owner_id !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({
      id: vaccination.id,
      petId: vaccination.pet_id,
      vaccine: vaccination.vaccine,
      date: vaccination.date,
      nextDue: vaccination.next_due,
      administeredBy: vaccination.administered_by,
      administeredByName: vaccination.administered_by_name,
      createdAt: vaccination.created_at,
      updatedAt: vaccination.updated_at,
    });
  } catch (error: any) {
    console.error('Get vaccination error:', error);
    res.status(500).json({ error: 'Failed to get vaccination record' });
  }
});

// Create new vaccination (vets and admins only)
router.post('/', authorize('veterinarian', 'administrator'), async (req: AuthRequest, res: Response) => {
  try {
    const { petId, vaccine, date, nextDue } = req.body;

    // Validate required fields
    if (!petId || !vaccine || !date) {
      res.status(400).json({ error: 'Pet ID, vaccine name, and date are required' });
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
      `INSERT INTO vaccinations (pet_id, vaccine, date, next_due, administered_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [petId, vaccine, date, nextDue || null, req.user!.id]
    );

    const vaccination = result.rows[0];

    res.status(201).json({
      id: vaccination.id,
      petId: vaccination.pet_id,
      vaccine: vaccination.vaccine,
      date: vaccination.date,
      nextDue: vaccination.next_due,
      administeredBy: vaccination.administered_by,
      createdAt: vaccination.created_at,
    });
  } catch (error: any) {
    console.error('Create vaccination error:', error);
    res.status(500).json({ error: 'Failed to create vaccination record' });
  }
});

// Update vaccination (vets and admins only)
router.patch('/:id', authorize('veterinarian', 'administrator'), async (req: AuthRequest, res: Response) => {
  try {
    const { vaccine, date, nextDue } = req.body;

    // Check if record exists
    const checkResult = await query('SELECT id FROM vaccinations WHERE id = $1', [req.params.id]);

    if (checkResult.rows.length === 0) {
      res.status(404).json({ error: 'Vaccination record not found' });
      return;
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (vaccine !== undefined) {
      updates.push(`vaccine = $${paramCount++}`);
      values.push(vaccine);
    }
    if (date !== undefined) {
      updates.push(`date = $${paramCount++}`);
      values.push(date);
    }
    if (nextDue !== undefined) {
      updates.push(`next_due = $${paramCount++}`);
      values.push(nextDue);
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    values.push(req.params.id);

    const result = await query(
      `UPDATE vaccinations SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    const vaccination = result.rows[0];

    res.json({
      id: vaccination.id,
      petId: vaccination.pet_id,
      vaccine: vaccination.vaccine,
      date: vaccination.date,
      nextDue: vaccination.next_due,
      administeredBy: vaccination.administered_by,
      updatedAt: vaccination.updated_at,
    });
  } catch (error: any) {
    console.error('Update vaccination error:', error);
    res.status(500).json({ error: 'Failed to update vaccination record' });
  }
});

// Delete vaccination (admins only)
router.delete('/:id', authorize('administrator'), async (req: AuthRequest, res: Response) => {
  try {
    const result = await query('DELETE FROM vaccinations WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Vaccination record not found' });
      return;
    }

    res.json({ message: 'Vaccination record deleted successfully' });
  } catch (error: any) {
    console.error('Delete vaccination error:', error);
    res.status(500).json({ error: 'Failed to delete vaccination record' });
  }
});

export default router;
