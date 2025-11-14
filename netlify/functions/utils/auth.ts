import jwt from 'jsonwebtoken';
import { HandlerEvent } from '@netlify/functions';
import { query } from './database';

export interface TokenPayload {
  userId: string;
  email: string;
  userType: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  userType: string;
  accessLevel?: string;
  address?: string;
  specialization?: string;
  licenseNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const getUserFromToken = async (event: HandlerEvent): Promise<User | null> => {
  try {
    const token = event.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return null;
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
      return null;
    }

    return result.rows[0];
  } catch (error) {
    return null;
  }
};

export const requireAuth = async (event: HandlerEvent): Promise<User> => {
  const user = await getUserFromToken(event);
  
  if (!user) {
    throw new Error('Authentication required');
  }
  
  return user;
};

export const requireRole = async (event: HandlerEvent, ...allowedRoles: string[]): Promise<User> => {
  const user = await requireAuth(event);
  
  if (!allowedRoles.includes(user.userType)) {
    throw new Error('Insufficient permissions');
  }
  
  return user;
};

export const requireAdmin = async (
  event: HandlerEvent,
  minLevel?: 'standard' | 'elevated' | 'super_admin'
): Promise<User> => {
  const user = await requireAuth(event);
  
  if (user.userType !== 'administrator') {
    throw new Error('Administrator access required');
  }
  
  if (minLevel) {
    const levels = ['standard', 'elevated', 'super_admin'];
    const userLevel = levels.indexOf(user.accessLevel || 'standard');
    const requiredLevel = levels.indexOf(minLevel);
    
    if (userLevel < requiredLevel) {
      throw new Error('Insufficient admin privileges');
    }
  }
  
  return user;
};
