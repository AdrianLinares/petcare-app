import { Router, Response } from 'express';
import { NotificationService } from '../services/notificationService.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get user notifications
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const unreadOnly = req.query.unreadOnly === 'true';
    const notifications = await NotificationService.getUserNotifications(
      req.user!.id,
      unreadOnly
    );
    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get unread count
router.get('/unread-count', async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await NotificationService.getUserNotifications(
      req.user!.id,
      true
    );
    res.json({ count: notifications.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
router.patch('/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    const success = await NotificationService.markAsRead(
      req.params.id,
      req.user!.id
    );
    
    if (!success) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mark all as read
router.patch('/read-all', async (req: AuthRequest, res: Response) => {
  try {
    const count = await NotificationService.markAllAsRead(req.user!.id);
    res.json({ success: true, count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete notification
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const success = await NotificationService.deleteNotification(
      req.params.id,
      req.user!.id
    );
    
    if (!success) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create notification (for testing/admin)
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const notification = await NotificationService.createNotification({
      ...req.body,
      userId: req.body.userId || req.user!.id,
    });
    res.status(201).json(notification);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
