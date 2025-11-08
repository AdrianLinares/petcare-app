import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { TokenPayload, User } from '../types/index.js';
import { query } from '../config/database.js';

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'default_secret'
    ) as TokenPayload;

    const result = await query(
      'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.userType)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

export const authorizeAdmin = (minLevel?: 'standard' | 'elevated' | 'super_admin') => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.userType !== 'administrator') {
      res.status(403).json({ error: 'Administrator access required' });
      return;
    }

    if (minLevel) {
      const levels = ['standard', 'elevated', 'super_admin'];
      const userLevel = levels.indexOf(req.user.accessLevel || 'standard');
      const requiredLevel = levels.indexOf(minLevel);

      if (userLevel < requiredLevel) {
        res.status(403).json({ error: 'Insufficient admin privileges' });
        return;
      }
    }

    next();
  };
};
