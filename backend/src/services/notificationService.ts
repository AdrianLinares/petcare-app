import { query } from '../config/database.js';
import { Notification } from '../types/index.js';
import { sendEmail } from './emailService.js';
import cron from 'node-cron';

interface CreateNotificationData {
  userId: string;
  type: Notification['type'];
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  scheduledFor?: Date;
}

export class NotificationService {
  // Create a new notification
  static async createNotification(data: CreateNotificationData): Promise<Notification> {
    const result = await query(
      `INSERT INTO notifications 
       (user_id, type, title, message, related_entity_type, related_entity_id, priority, scheduled_for)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        data.userId,
        data.type,
        data.title,
        data.message,
        data.relatedEntityType || null,
        data.relatedEntityId || null,
        data.priority || 'normal',
        data.scheduledFor || null,
      ]
    );

    const notification = result.rows[0];

    // Send immediately if not scheduled
    if (!data.scheduledFor) {
      await this.sendNotification(notification.id);
    }

    return notification;
  }

  // Get user notifications
  static async getUserNotifications(
    userId: string,
    unreadOnly: boolean = false
  ): Promise<Notification[]> {
    let sql = 'SELECT * FROM notifications WHERE user_id = $1';
    if (unreadOnly) {
      sql += ' AND read = false';
    }
    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, [userId]);
    return result.rows;
  }

  // Mark notification as read
  static async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const result = await query(
      `UPDATE notifications 
       SET read = true, read_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [notificationId, userId]
    );

    return (result.rowCount ?? 0) > 0;
  }

  // Mark all as read for a user
  static async markAllAsRead(userId: string): Promise<number> {
    const result = await query(
      `UPDATE notifications 
       SET read = true, read_at = CURRENT_TIMESTAMP 
       WHERE user_id = $1 AND read = false
       RETURNING *`,
      [userId]
    );

    return result.rowCount ?? 0;
  }

  // Delete a notification
  static async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
      [notificationId, userId]
    );

    return (result.rowCount ?? 0) > 0;
  }

  // Send notification (mark as sent and optionally send email)
  static async sendNotification(notificationId: string): Promise<void> {
    const notifResult = await query(
      'SELECT n.*, u.email, u.full_name FROM notifications n JOIN users u ON n.user_id = u.id WHERE n.id = $1',
      [notificationId]
    );

    if (notifResult.rows.length === 0) return;

    const notification = notifResult.rows[0];

    // Send email
    try {
      await sendEmail({
        to: notification.email,
        subject: notification.title,
        html: `
          <h2>${notification.title}</h2>
          <p>${notification.message}</p>
          <hr>
          <p><small>Priority: ${notification.priority.toUpperCase()}</small></p>
        `,
        userId: notification.user_id,
        type: 'notification',
        notificationId: notification.id,
      });

      // Mark as sent
      await query(
        `UPDATE notifications SET sent = true, sent_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [notificationId]
      );
    } catch (error) {
      console.error('Failed to send notification email:', error);
    }
  }

  // Process scheduled notifications
  static async processScheduledNotifications(): Promise<void> {
    const result = await query(
      `SELECT * FROM notifications 
       WHERE scheduled_for <= CURRENT_TIMESTAMP 
       AND sent = false 
       ORDER BY scheduled_for ASC`
    );

    for (const notification of result.rows) {
      await this.sendNotification(notification.id);
    }
  }

  // Create appointment reminder notification
  static async createAppointmentReminder(appointmentId: string): Promise<void> {
    const result = await query(
      `SELECT a.*, p.name as pet_name, u.email, u.full_name, u.id as owner_id
       FROM appointments a
       JOIN pets p ON a.pet_id = p.id
       JOIN users u ON a.owner_id = u.id
       WHERE a.id = $1 AND a.status = 'scheduled'`,
      [appointmentId]
    );

    if (result.rows.length === 0) return;

    const appointment = result.rows[0];
    const appointmentDate = new Date(appointment.date);
    const reminderTime = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000); // 24 hours before

    await this.createNotification({
      userId: appointment.owner_id,
      type: 'appointment_reminder',
      title: 'Appointment Reminder',
      message: `Reminder: You have an appointment for ${appointment.pet_name} on ${appointmentDate.toLocaleDateString()} at ${appointment.time}.`,
      relatedEntityType: 'appointment',
      relatedEntityId: appointmentId,
      priority: 'high',
      scheduledFor: reminderTime > new Date() ? reminderTime : undefined,
    });
  }

  // Create vaccination due reminder
  static async createVaccinationReminder(vaccinationId: string): Promise<void> {
    const result = await query(
      `SELECT v.*, p.name as pet_name, p.owner_id, u.email, u.full_name
       FROM vaccinations v
       JOIN pets p ON v.pet_id = p.id
       JOIN users u ON p.owner_id = u.id
       WHERE v.id = $1`,
      [vaccinationId]
    );

    if (result.rows.length === 0) return;

    const vaccination = result.rows[0];
    const nextDue = new Date(vaccination.next_due);
    const reminderTime = new Date(nextDue.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days before

    await this.createNotification({
      userId: vaccination.owner_id,
      type: 'vaccination_due',
      title: 'Vaccination Due',
      message: `${vaccination.pet_name}'s ${vaccination.vaccine} vaccination is due on ${nextDue.toLocaleDateString()}.`,
      relatedEntityType: 'vaccination',
      relatedEntityId: vaccinationId,
      priority: 'normal',
      scheduledFor: reminderTime > new Date() ? reminderTime : undefined,
    });
  }

  // Check and create reminders for upcoming appointments
  static async checkUpcomingAppointments(): Promise<void> {
    const reminderHours = parseInt(process.env.APPOINTMENT_REMINDER_HOURS || '24');
    const result = await query(
      `SELECT a.id, a.date, a.time
       FROM appointments a
       WHERE a.status = 'scheduled'
       AND a.date >= CURRENT_DATE
       AND a.date <= CURRENT_DATE + INTERVAL '${reminderHours + 1} hours'
       AND NOT EXISTS (
         SELECT 1 FROM notifications n
         WHERE n.related_entity_id = a.id::text
         AND n.type = 'appointment_reminder'
         AND n.created_at > CURRENT_TIMESTAMP - INTERVAL '48 hours'
       )`
    );

    for (const appointment of result.rows) {
      await this.createAppointmentReminder(appointment.id);
    }
  }

  // Check and create reminders for due vaccinations
  static async checkDueVaccinations(): Promise<void> {
    const reminderDays = parseInt(process.env.VACCINATION_REMINDER_DAYS || '7');
    const result = await query(
      `SELECT v.id
       FROM vaccinations v
       WHERE v.next_due IS NOT NULL
       AND v.next_due >= CURRENT_DATE
       AND v.next_due <= CURRENT_DATE + INTERVAL '${reminderDays + 1} days'
       AND NOT EXISTS (
         SELECT 1 FROM notifications n
         WHERE n.related_entity_id = v.id::text
         AND n.type = 'vaccination_due'
         AND n.created_at > CURRENT_TIMESTAMP - INTERVAL '14 days'
       )`
    );

    for (const vaccination of result.rows) {
      await this.createVaccinationReminder(vaccination.id);
    }
  }

  // Start cron job for notification checks
  static startNotificationScheduler(): void {
    const interval = process.env.NOTIFICATION_CHECK_INTERVAL || '*/15 * * * *'; // Every 15 minutes
    
    cron.schedule(interval, async () => {
      console.log('Running notification scheduler...');
      try {
        await this.processScheduledNotifications();
        await this.checkUpcomingAppointments();
        await this.checkDueVaccinations();
      } catch (error) {
        console.error('Error in notification scheduler:', error);
      }
    });

    console.log(`✓ Notification scheduler started (${interval})`);
  }
}
