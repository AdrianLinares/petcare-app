import { createTransport, Transporter } from 'nodemailer';
import { query } from '../config/database.js';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  userId?: string;
  type: string;
  notificationId?: string;
  resetToken?: string;
  resetLink?: string;
}

class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(options: EmailOptions): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      // Log email
      await query(
        `INSERT INTO email_logs 
         (user_id, to_email, subject, type, notification_id, reset_token, reset_link, delivery_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          options.userId || null,
          options.to,
          options.subject,
          options.type,
          options.notificationId || null,
          options.resetToken || null,
          options.resetLink || null,
          'sent',
        ]
      );

      console.log('Email sent:', info.messageId);
    } catch (error: any) {
      console.error('Email send error:', error);

      // Log failure
      await query(
        `INSERT INTO email_logs 
         (user_id, to_email, subject, type, notification_id, reset_token, reset_link, delivery_status, error_message)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          options.userId || null,
          options.to,
          options.subject,
          options.type,
          options.notificationId || null,
          options.resetToken || null,
          options.resetLink || null,
          'failed',
          error.message,
        ]
      );

      throw error;
    }
  }
}

const emailService = new EmailService();

export const sendEmail = (options: EmailOptions) => emailService.send(options);
