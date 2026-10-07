import { Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth';
import { NotificationService } from '../services/notificationService';

export async function getTodayCheckin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    let seniorId = req.user?.seniorProfileId;
    if (req.user?.role === 'CAREGIVER' && req.query.seniorId) {
      seniorId = req.query.seniorId as string;
    }

    if (!seniorId) {
      res.status(400).json({ success: false, error: 'Senior profile ID required.' });
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const checkIn = await prisma.checkIn.findUnique({
      where: {
        seniorId_date: {
          seniorId,
          date: todayStr,
        },
      },
    });

    res.json({
      success: true,
      data: checkIn || {
        date: todayStr,
        status: 'PENDING',
        respondedAt: null,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function submitCheckin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const seniorId = req.user?.seniorProfileId;
    if (!seniorId) {
      res.status(403).json({ success: false, error: 'Only seniors can submit daily check-in.' });
      return;
    }

    const { status = 'OKAY', notes } = req.body; // 'OKAY' | 'HELP_NEEDED'
    const todayStr = new Date().toISOString().split('T')[0];

    const senior = await prisma.seniorProfile.findUnique({
      where: { id: seniorId },
      include: { user: true },
    });

    const checkIn = await prisma.checkIn.upsert({
      where: {
        seniorId_date: {
          seniorId,
          date: todayStr,
        },
      },
      create: {
        seniorId,
        date: todayStr,
        status,
        respondedAt: new Date(),
        notes,
      },
      update: {
        status,
        respondedAt: new Date(),
        notes,
      },
    });

    const seniorName = senior?.user.name || 'Senior';

    if (status === 'OKAY') {
      await NotificationService.notifyCaregiversOfSenior(seniorId, {
        title: 'Morning Check-in Completed',
        message: `${seniorName} marked "I Am Okay" at ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}.`,
        type: 'CHECK_IN',
        entityId: checkIn.id,
      });
    } else {
      await NotificationService.notifyCaregiversOfSenior(seniorId, {
        title: 'Senior Needs Attention',
        message: `${seniorName} indicated needing help during daily check-in.`,
        type: 'HELP_REQUEST',
        entityId: checkIn.id,
      });
    }

    res.json({
      success: true,
      message: status === 'OKAY' ? 'Glad to know you are doing well!' : 'Your family has been alerted to help.',
      data: checkIn,
    });
  } catch (error) {
    next(error);
  }
}
