import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Email service utilities (for demo purposes, we'll simulate email sending)
export const emailService = {
  async sendPasswordResetEmail(email: string, resetToken: string, resetLink: string): Promise<boolean> {
    try {
      // In a real application, you would integrate with an email service like:
      // - Supabase Auth (recommended)
      // - SendGrid
      // - AWS SES
      // - Nodemailer
      
      // For demo purposes, we'll log the email content and simulate success
      console.log('📧 Sending password reset email:');
      console.log('To:', email);
      console.log('Reset Link:', resetLink);
      console.log('Reset Token:', resetToken);
      console.log('Email Content:');
      console.log(`
        Subject: Reset Your PetCare Password
        
        Hello,
        
        You requested to reset your password for your PetCare account.
        
        Click the link below to reset your password:
        ${resetLink}
        
        This link will expire in 1 hour for security reasons.
        
        If you did not request this password reset, please ignore this email.
        
        Best regards,
        The PetCare Team
      `);
      
      // Store the email in localStorage for demo purposes
      const emailLog = JSON.parse(localStorage.getItem('emailLog') || '[]');
      emailLog.push({
        to: email,
        subject: 'Reset Your PetCare Password',
        resetToken,
        resetLink,
        sentAt: new Date().toISOString(),
        type: 'password-reset'
      });
      localStorage.setItem('emailLog', JSON.stringify(emailLog));
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  },

  async sendPasswordChangeConfirmation(email: string): Promise<boolean> {
    try {
      console.log('📧 Sending password change confirmation email to:', email);
      
      const emailLog = JSON.parse(localStorage.getItem('emailLog') || '[]');
      emailLog.push({
        to: email,
        subject: 'Password Changed Successfully - PetCare',
        sentAt: new Date().toISOString(),
        type: 'password-changed'
      });
      localStorage.setItem('emailLog', JSON.stringify(emailLog));
      
      return true;
    } catch (error) {
      console.error('Failed to send password change confirmation:', error);
      return false;
    }
  }
};

// Helper function to get demo email logs (for testing purposes)
export const getDemoEmailLog = () => {
  return JSON.parse(localStorage.getItem('emailLog') || '[]');
};

// Helper function to clear demo email logs
export const clearDemoEmailLog = () => {
  localStorage.removeItem('emailLog');
};
