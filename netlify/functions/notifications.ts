/**
 * Notifications Serverless Function
 *
 * API Endpoints:
 * GET    /notifications                - Get user's notifications
 * GET    /notifications/unread-count   - Get count of unread notifications
 * POST   /notifications                - Create new notification (triggers Pusher broadcast)
 * PATCH  /notifications/:id/read       - Mark notification as read
 * PATCH  /notifications/read-all       - Mark all notifications as read
 * DELETE /notifications/:id            - Delete notification
 *
 * Real-Time Delivery:
 * Uses Pusher to broadcast new notifications to channel: `user-{userId}`
 * Event: `notification-created`
 */

import { Handler, HandlerEvent } from '@netlify/functions';
import Pusher from 'pusher';
import { query } from './utils/database';
import { requireAuth } from './utils/auth';
import { successResponse, errorResponse, corsResponse } from './utils/response';
import { camelCaseRows } from './utils/db-helpers';

/**
 * Initialize Pusher for real-time broadcasts
 * Lazily initializes Pusher connection. Only creates instance when needed.
 */
let pusher: Pusher | null = null;

function getPusher(): Pusher | null {
  if (pusher) return pusher;

  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER || 'us2';

  if (!appId || !key || !secret) {
    console.warn('Pusher credentials not configured. Real-time notifications disabled.');
    return null;
  }

  pusher = new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });

  return pusher;
}

/**
 * Broadcast Notification via Pusher
 * Sends notification to user's browser in real-time.
 * Channel: `user-{userId}`, Event: `notification-created`
 */
async function broadcastNotification(notification: any): Promise<void> {
  const pusherInstance = getPusher();
  if (!pusherInstance) {
    console.log('Pusher not configured. Skipping real-time broadcast.');
    return;
  }

  try {
    await pusherInstance.trigger(
      `user-${notification.userId}`,
      'notification-created',
      notification
    );
    console.log(`Notification broadcast to user ${notification.userId}`);
  } catch (error) {
    console.error('Failed to broadcast notification:', error);
  }
}

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod === 'OPTIONS') return corsResponse();

  try {
    const path = event.path.replace('/.netlify/functions/notifications', '').replace('/api/notifications', '');
    const body = event.body ? JSON.parse(event.body) : {};
    const params = event.queryStringParameters || {};
    const user = await requireAuth(event);

    // GET /notifications - Get user's notifications
    if (path === '' && event.httpMethod === 'GET') {
      const unreadOnly = params.unreadOnly === 'true';

      let queryText = 'SELECT * FROM notifications WHERE user_id = $1';
      if (unreadOnly) {
        queryText += ' AND read = false';
      }
      queryText += ' ORDER BY created_at DESC LIMIT 100';

      const result = await query(queryText, [user.id]);
      return successResponse(camelCaseRows(result.rows));
    }

    // GET /notifications/unread-count - Get count of unread notifications
    if (path === '/unread-count' && event.httpMethod === 'GET') {
      const result = await query(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = false',
        [user.id]
      );
      return successResponse({ count: parseInt(result.rows[0].count) });
    }

    // POST /notifications - Create new notification
    if (path === '' && event.httpMethod === 'POST') {
      const { userId, type, title, message, priority } = body;

      if (!userId || !type || !title || !message) {
        throw new Error('Missing required fields: userId, type, title, message');
      }

      const validTypes = [
        'welcome', 'appointment_reminder', 'appointment_cancelled', 'appointment_rescheduled',
        'vaccination_due', 'medication_reminder', 'medical_update', 'system_alert', 'password_changed'
      ];
      if (!validTypes.includes(type)) {
        throw new Error(`Invalid notification type. Must be one of: ${validTypes.join(', ')}`);
      }

      const validPriorities = ['low', 'normal', 'high', 'urgent'];
      const finalPriority = priority || 'normal';
      if (!validPriorities.includes(finalPriority)) {
        throw new Error(`Invalid priority. Must be one of: ${validPriorities.join(', ')}`);
      }

      const result = await query(
        `INSERT INTO notifications (user_id, type, title, message, priority, read)
         VALUES ($1, $2, $3, $4, $5, false)
         RETURNING *`,
        [userId, type, title, message, finalPriority]
      );

      const notification = camelCaseRows(result.rows)[0];

      // Broadcast to user in real-time
      await broadcastNotification(notification);

      return successResponse(notification, 201);
    }

    // Handle /:id routes
    const idMatch = path.match(/^\/([^\/]+)(\/.*)?$/);
    if (idMatch) {
      const notificationId = idMatch[1];
      const subPath = idMatch[2] || '';

      // PATCH /notifications/:id/read - Mark as read
      if (subPath === '/read' && event.httpMethod === 'PATCH') {
        const checkResult = await query(
          'SELECT user_id FROM notifications WHERE id = $1',
          [notificationId]
        );

        if (checkResult.rows.length === 0) {
          throw new Error('Notification not found');
        }

        if (checkResult.rows[0].user_id !== user.id && user.userType !== 'administrator') {
          throw new Error('Unauthorized');
        }

        await query(
          'UPDATE notifications SET read = true WHERE id = $1',
          [notificationId]
        );

        return successResponse({ message: 'Notification marked as read' });
      }

      // DELETE /notifications/:id - Delete notification
      if (subPath === '' && event.httpMethod === 'DELETE') {
        const checkResult = await query(
          'SELECT user_id FROM notifications WHERE id = $1',
          [notificationId]
        );

        if (checkResult.rows.length === 0) {
          throw new Error('Notification not found');
        }

        if (checkResult.rows[0].user_id !== user.id && user.userType !== 'administrator') {
          throw new Error('Unauthorized');
        }

        await query('DELETE FROM notifications WHERE id = $1', [notificationId]);

        return successResponse({ message: 'Notification deleted' });
      }
    }

    // PATCH /notifications/read-all - Mark all as read
    if (path === '/read-all' && event.httpMethod === 'PATCH') {
      await query(
        'UPDATE notifications SET read = true WHERE user_id = $1 AND read = false',
        [user.id]
      );

      return successResponse({ message: 'All notifications marked as read' });
    }

    throw new Error('Not found');
  } catch (error: any) {
    console.error('Notifications function error:', error);
    return errorResponse(error);
  }
};

export { handler };