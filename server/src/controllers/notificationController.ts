import { Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth';

export async function getUserNotifications(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const notifications = await prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
}

export async function markNotificationAsRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const notif = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({ success: true, data: notif });
  } catch (error) {
    next(error);
  }
}

export async function markAllNotificationsAsRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    await prisma.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true },
    });

    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
}
