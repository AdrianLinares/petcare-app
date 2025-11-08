import { Router, Response } from 'express';
import bcrypt from 'bcrypt';
import { query } from '../config/database.js';
import { authenticate, authorizeAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get current user profile
router.get('/me', async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT id, email, full_name, phone, user_type, access_level, address, specialization, license_number, created_at FROM users WHERE id = $1',
      [req.user!.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone,
      userType: user.user_type,
      accessLevel: user.access_level,
      address: user.address,
      specialization: user.specialization,
      licenseNumber: user.license_number,
      createdAt: user.created_at,
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update current user profile
router.patch('/me', async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, phone, address, specialization, licenseNumber } = req.body;
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (fullName !== undefined) {
      updates.push(`full_name = $${paramCount++}`);
      values.push(fullName);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }
    if (address !== undefined) {
      updates.push(`address = $${paramCount++}`);
      values.push(address);
    }
    if (specialization !== undefined) {
      updates.push(`specialization = $${paramCount++}`);
      values.push(specialization);
    }
    if (licenseNumber !== undefined) {
      updates.push(`license_number = $${paramCount++}`);
      values.push(licenseNumber);
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    values.push(req.user!.id);

    const result = await query(
      `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $${paramCount} 
       RETURNING id, email, full_name, phone, user_type, access_level, address, specialization, license_number`,
      values
    );

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone,
      userType: user.user_type,
      accessLevel: user.access_level,
      address: user.address,
      specialization: user.specialization,
      licenseNumber: user.license_number,
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Change password
router.post('/me/change-password', async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current and new passwords are required' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: 'New password must be at least 8 characters' });
      return;
    }

    // Get current password hash
    const result = await query('SELECT password_hash FROM users WHERE id = $1', [req.user!.id]);
    const user = result.rows[0];

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validPassword) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPasswordHash, req.user!.id]);

    res.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Admin routes

// List all users (Admin only)
router.get('/', authorizeAdmin(), async (req: AuthRequest, res: Response) => {
  try {
    const { userType, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const offset = (pageNum - 1) * limitNum;

    let queryText = 'SELECT id, email, full_name, phone, user_type, access_level, created_at FROM users WHERE deleted_at IS NULL';
    const values: any[] = [];

    if (userType) {
      queryText += ' AND user_type = $1';
      values.push(userType);
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limitNum, offset);

    const result = await query(queryText, values);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM users WHERE deleted_at IS NULL';
    const countValues: any[] = [];
    if (userType) {
      countQuery += ' AND user_type = $1';
      countValues.push(userType);
    }
    const countResult = await query(countQuery, countValues);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      users: result.rows.map((user: any) => ({
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        userType: user.user_type,
        accessLevel: user.access_level,
        createdAt: user.created_at,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Failed to list users' });
  }
});

// Get user by ID (Admin only)
router.get('/:id', authorizeAdmin(), async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'SELECT id, email, full_name, phone, user_type, access_level, address, specialization, license_number, created_at FROM users WHERE id = $1 AND deleted_at IS NULL',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone,
      userType: user.user_type,
      accessLevel: user.access_level,
      address: user.address,
      specialization: user.specialization,
      licenseNumber: user.license_number,
      createdAt: user.created_at,
    });
  } catch (error: any) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Delete user (Soft delete - Admin only)
router.delete('/:id', authorizeAdmin(), async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      'UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(204).send();
  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
