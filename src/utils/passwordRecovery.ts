import { PasswordResetToken, User } from '../types';
import { emailService } from '../lib/supabase';

// Generate a secure random token
export const generateResetToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Generate a reset token ID
export const generateTokenId = (): string => {
  return `reset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Create and store password reset token
export const createPasswordResetToken = (email: string, userType?: string): PasswordResetToken => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
  
  const resetToken: PasswordResetToken = {
    id: generateTokenId(),
    email: email.toLowerCase(),
    token: generateResetToken(),
    expiresAt: expiresAt.toISOString(),
    createdAt: now.toISOString(),
    used: false,
    userType
  };
  
  // Store token in localStorage (in production, this would be in a secure database)
  const existingTokens = getStoredResetTokens();
  
  // Remove any existing tokens for this email
  const filteredTokens = existingTokens.filter(t => t.email !== email.toLowerCase());
  
  // Add new token
  filteredTokens.push(resetToken);
  
  localStorage.setItem('passwordResetTokens', JSON.stringify(filteredTokens));
  
  return resetToken;
};

// Get all stored reset tokens
export const getStoredResetTokens = (): PasswordResetToken[] => {
  try {
    const tokens = localStorage.getItem('passwordResetTokens');
    return tokens ? JSON.parse(tokens) : [];
  } catch (error) {
    console.error('Error parsing stored reset tokens:', error);
    return [];
  }
};

// Validate and get reset token
export const validateResetToken = (token: string): PasswordResetToken | null => {
  const tokens = getStoredResetTokens();
  const resetToken = tokens.find(t => t.token === token);
  
  if (!resetToken) {
    return null;
  }
  
  // Check if token is expired
  if (new Date() > new Date(resetToken.expiresAt)) {
    return null;
  }
  
  // Check if token is already used
  if (resetToken.used) {
    return null;
  }
  
  return resetToken;
};

// Mark reset token as used
export const markTokenAsUsed = (token: string): boolean => {
  const tokens = getStoredResetTokens();
  const tokenIndex = tokens.findIndex(t => t.token === token);
  
  if (tokenIndex === -1) {
    return false;
  }
  
  tokens[tokenIndex].used = true;
  localStorage.setItem('passwordResetTokens', JSON.stringify(tokens));
  
  return true;
};

// Clean up expired tokens
export const cleanupExpiredTokens = (): void => {
  const tokens = getStoredResetTokens();
  const now = new Date();
  const validTokens = tokens.filter(t => new Date(t.expiresAt) > now);
  
  if (validTokens.length !== tokens.length) {
    localStorage.setItem('passwordResetTokens', JSON.stringify(validTokens));
  }
};

// Check if user exists
export const checkUserExists = (email: string): User | null => {
  try {
    const userKey = `user_${email.toLowerCase()}`;
    const userData = localStorage.getItem(userKey);
    
    if (userData) {
      return JSON.parse(userData);
    }
    
    return null;
  } catch (error) {
    console.error('Error checking user existence:', error);
    return null;
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Check if user exists
    const user = checkUserExists(email);
    if (!user) {
      // For security reasons, we still return success even if user doesn't exist
      // This prevents email enumeration attacks
      return {
        success: true,
        message: 'If an account with this email exists, you will receive a password reset link shortly.'
      };
    }
    
    // Create reset token
    const resetToken = createPasswordResetToken(email, user.userType);
    
    // Generate reset link (in production, this would be your actual domain)
    const resetLink = `${window.location.origin}#reset-password?token=${resetToken.token}`;
    
    // Send email
    const emailSent = await emailService.sendPasswordResetEmail(email, resetToken.token, resetLink);
    
    if (emailSent) {
      return {
        success: true,
        message: 'If an account with this email exists, you will receive a password reset link shortly.'
      };
    } else {
      return {
        success: false,
        message: 'Failed to send password reset email. Please try again.'
      };
    }
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return {
      success: false,
      message: 'An error occurred. Please try again.'
    };
  }
};

// Reset user password
export const resetUserPassword = async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Validate token
    const resetToken = validateResetToken(token);
    if (!resetToken) {
      return {
        success: false,
        message: 'Invalid or expired reset token.'
      };
    }
    
    // Get user
    const user = checkUserExists(resetToken.email);
    if (!user) {
      return {
        success: false,
        message: 'User account not found.'
      };
    }
    
    // Validate new password
    if (newPassword.length < 8) {
      return {
        success: false,
        message: 'Password must be at least 8 characters long.'
      };
    }
    
    // Update user password
    const updatedUser = { ...user, password: newPassword };
    const userKey = `user_${resetToken.email}`;
    localStorage.setItem(userKey, JSON.stringify(updatedUser));
    
    // Mark token as used
    markTokenAsUsed(token);
    
    // Send confirmation email
    await emailService.sendPasswordChangeConfirmation(resetToken.email);
    
    // Cleanup expired tokens
    cleanupExpiredTokens();
    
    return {
      success: true,
      message: 'Password reset successful. You can now log in with your new password.'
    };
  } catch (error) {
    console.error('Error resetting password:', error);
    return {
      success: false,
      message: 'An error occurred while resetting your password. Please try again.'
    };
  }
};

// Get reset token from URL
export const getResetTokenFromURL = (): string | null => {
  const hash = window.location.hash;
  const params = new URLSearchParams(hash.split('?')[1] || '');
  return params.get('token');
};

// Utility to get reset statistics (for admin or debugging)
export const getResetTokenStats = () => {
  const tokens = getStoredResetTokens();
  const now = new Date();
  
  return {
    total: tokens.length,
    active: tokens.filter(t => !t.used && new Date(t.expiresAt) > now).length,
    expired: tokens.filter(t => new Date(t.expiresAt) <= now).length,
    used: tokens.filter(t => t.used).length
  };
};
