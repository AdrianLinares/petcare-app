import { Router, Response } from 'express';
import { query } from '../config/database.js';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all pets (owner sees their own, vets/admins see all)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    let queryText = `
      SELECT p.*, u.full_name as owner_name, u.email as owner_email 
      FROM pets p 
      JOIN users u ON p.owner_id = u.id 
      WHERE p.deleted_at IS NULL
    `;
    const values: any[] = [];

    // Pet owners only see their own pets
    if (req.user!.userType === 'pet_owner') {
      queryText += ' AND p.owner_id = $1';
      values.push(req.user!.id);
    }

    queryText += ' ORDER BY p.created_at DESC';

    const result = await query(queryText, values);

    res.json(result.rows.map((pet: any) => ({
      id: pet.id,
      ownerId: pet.owner_id,
      ownerName: pet.owner_name,
      ownerEmail: pet.owner_email,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: pet.age,
      weight: pet.weight,
      color: pet.color,
      gender: pet.gender,
      microchipId: pet.microchip_id,
      allergies: pet.allergies,
      notes: pet.notes,
      createdAt: pet.created_at,
    })));
  } catch (error: any) {
    console.error('Get pets error:', error);
    res.status(500).json({ error: 'Failed to get pets' });
  }
});

// Get single pet by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT p.*, u.full_name as owner_name, u.email as owner_email 
       FROM pets p 
       JOIN users u ON p.owner_id = u.id 
       WHERE p.id = $1 AND p.deleted_at IS NULL`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }

    const pet = result.rows[0];

    // Check authorization - owners can only see their own pets
    if (req.user!.userType === 'pet_owner' && pet.owner_id !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({
      id: pet.id,
      ownerId: pet.owner_id,
      ownerName: pet.owner_name,
      ownerEmail: pet.owner_email,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: pet.age,
      weight: pet.weight,
      color: pet.color,
      gender: pet.gender,
      microchipId: pet.microchip_id,
      allergies: pet.allergies,
      notes: pet.notes,
      createdAt: pet.created_at,
    });
  } catch (error: any) {
    console.error('Get pet error:', error);
    res.status(500).json({ error: 'Failed to get pet' });
  }
});

// Create new pet (owners only)
router.post('/', authorize('pet_owner'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, species, breed, age, weight, color, gender, microchipId, allergies, notes } = req.body;

    // Validate required fields
    if (!name || !species || !breed) {
      res.status(400).json({ error: 'Name, species, and breed are required' });
      return;
    }

    // Validate gender
    if (gender && !['Male', 'Female'].includes(gender)) {
      res.status(400).json({ error: 'Gender must be Male or Female' });
      return;
    }

    const result = await query(
      `INSERT INTO pets 
       (owner_id, name, species, breed, age, weight, color, gender, microchip_id, allergies, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        req.user!.id,
        name,
        species,
        breed,
        age || null,
        weight || null,
        color || null,
        gender || null,
        microchipId || null,
        allergies || null,
        notes || null,
      ]
    );

    const pet = result.rows[0];

    res.status(201).json({
      id: pet.id,
      ownerId: pet.owner_id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: pet.age,
      weight: pet.weight,
      color: pet.color,
      gender: pet.gender,
      microchipId: pet.microchip_id,
      allergies: pet.allergies,
      notes: pet.notes,
      createdAt: pet.created_at,
    });
  } catch (error: any) {
    console.error('Create pet error:', error);
    if (error.code === '23505') {
      // Unique constraint violation (microchip)
      res.status(409).json({ error: 'Microchip ID already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to create pet' });
  }
});

// Update pet
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    // Check if pet exists and get owner
    const petResult = await query(
      'SELECT owner_id FROM pets WHERE id = $1 AND deleted_at IS NULL',
      [req.params.id]
    );

    if (petResult.rows.length === 0) {
      res.status(404).json({ error: 'Pet not found' });
      return;
    }

    const pet = petResult.rows[0];

    // Check authorization - owners can only update their own pets
    if (req.user!.userType === 'pet_owner' && pet.owner_id !== req.user!.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const { name, species, breed, age, weight, color, gender, microchipId, allergies, notes } = req.body;
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
    if (age !== undefined) {
      updates.push(`age = $${paramCount++}`);
      values.push(age);
    }
    if (weight !== undefined) {
      updates.push(`weight = $${paramCount++}`);
      values.push(weight);
    }
    if (color !== undefined) {
      updates.push(`color = $${paramCount++}`);
      values.push(color);
    }
    if (gender !== undefined) {
      if (!['Male', 'Female'].includes(gender)) {
        res.status(400).json({ error: 'Gender must be Male or Female' });
        return;
      }
      updates.push(`gender = $${paramCount++}`);
      values.push(gender);
    }
    if (microchipId !== undefined) {
      updates.push(`microchip_id = $${paramCount++}`);
      values.push(microchipId);
    }
    if (allergies !== undefined) {
      updates.push(`allergies = $${paramCount++}`);
      values.push(allergies);
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      values.push(notes);
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    values.push(req.params.id);

    const result = await query(
      `UPDATE pets SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramCount} 
       RETURNING *`,
      values
    );

    const updatedPet = result.rows[0];

    res.json({
      id: updatedPet.id,
      ownerId: updatedPet.owner_id,
      name: updatedPet.name,
      species: updatedPet.species,
      breed: updatedPet.breed,
      age: updatedPet.age,
      weight: updatedPet.weight,
      color: updatedPet.color,
      gender: updatedPet.gender,
      microchipId: updatedPet.microchip_id,
      allergies: updatedPet.allergies,
      notes: updatedPet.notes,
    });
  } catch (error: any) {
    console.error('Update pet error:', error);
    res.status(500).json({ error: 'Failed to update pet' });
  }
});

// Delete pet (soft delete - owners only)
router.delete('/:id', authorize('pet_owner'), async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'UPDATE pets SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND owner_id = $2 AND deleted_at IS NULL RETURNING id',
      [req.params.id, req.user!.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Pet not found or access denied' });
      return;
    }

    res.status(204).send();
  } catch (error: any) {
    console.error('Delete pet error:', error);
    res.status(500).json({ error: 'Failed to delete pet' });
  }
});

export default router;
