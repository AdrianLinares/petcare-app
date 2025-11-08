import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../config/database.js';
import { sendEmail } from '../services/emailService.js';
import { NotificationService } from '../services/notificationService.js';

const router = Router();

// Register new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, phone, userType, address, specialization, licenseNumber } = req.body;

    // Validate required fields
    if (!email || !password || !fullName || !phone || !userType) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Validate user type
    if (!['pet_owner', 'veterinarian', 'administrator'].includes(userType)) {
      res.status(400).json({ error: 'Invalid user type' });
      return;
    }

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      res.status(409).json({ error: 'User with this email already exists' });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await query(
      `INSERT INTO users 
       (email, password_hash, full_name, phone, user_type, address, specialization, license_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, email, full_name, phone, user_type, address, specialization, license_number, created_at`,
      [email, passwordHash, fullName, phone, userType, address || null, specialization || null, licenseNumber || null]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, userType: user.user_type },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    // Send welcome notification
    await NotificationService.createNotification({
      userId: user.id,
      type: 'welcome',
      title: 'Welcome to PetCare!',
      message: `Welcome ${fullName}! Your account has been created successfully.`,
      priority: 'normal',
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        userType: user.user_type,
        address: user.address,
        specialization: user.specialization,
        licenseNumber: user.license_number,
        createdAt: user.created_at,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find user
    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const user = result.rows[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, userType: user.user_type },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    res.json({
      token,
      user: {
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
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Forgot password
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    // Find user
    const result = await query(
      'SELECT id, email, full_name FROM users WHERE email = $1 AND deleted_at IS NULL',
      [email]
    );

    // Always return success to prevent email enumeration
    if (result.rows.length === 0) {
      res.json({ message: 'If that email exists, a password reset link has been sent' });
      return;
    }

    const user = result.rows[0];

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token to database
    await query(
      `INSERT INTO password_reset_tokens (user_id, email, token, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [user.id, user.email, token, expiresAt]
    );

    // Generate reset link
    const resetLink = `${process.env.FRONTEND_URL}/#reset-password?token=${token}`;

    // Send email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request',
        html: `
          <h2>Password Reset Request</h2>
          <p>Hi ${user.full_name},</p>
          <p>You requested to reset your password. Click the link below to reset it:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
        userId: user.id,
        type: 'password-reset',
        resetToken: token,
        resetLink,
      });
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
    }

    res.json({ message: 'If that email exists, a password reset link has been sent' });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Reset password
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({ error: 'Token and password are required' });
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }

    // Find valid token
    const tokenResult = await query(
      `SELECT * FROM password_reset_tokens 
       WHERE token = $1 AND used = false AND expires_at > NOW()`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      res.status(400).json({ error: 'Invalid or expired token' });
      return;
    }

    const resetToken = tokenResult.rows[0];

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user password
    await query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [passwordHash, resetToken.user_id]
    );

    // Mark token as used
    await query(
      'UPDATE password_reset_tokens SET used = true, used_at = NOW() WHERE id = $1',
      [resetToken.id]
    );

    // Get user info
    const userResult = await query(
      'SELECT id, email, full_name FROM users WHERE id = $1',
      [resetToken.user_id]
    );
    const user = userResult.rows[0];

    // Send confirmation notification
    await NotificationService.createNotification({
      userId: user.id,
      type: 'password_changed',
      title: 'Password Changed',
      message: 'Your password has been successfully changed.',
      priority: 'normal',
    });

    res.json({ message: 'Password reset successful' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

export default router;
