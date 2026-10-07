import { Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth';
import { NotificationService } from '../services/notificationService';

export async function triggerEmergency(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const seniorId = req.user?.seniorProfileId;
    if (!seniorId) {
      res.status(403).json({ success: false, error: 'Only seniors can trigger emergency alert.' });
      return;
    }

    const { latitude, longitude, notes } = req.body;

    const senior = await prisma.seniorProfile.findUnique({
      where: { id: seniorId },
      include: { user: true },
    });

    const emergency = await prisma.emergencyEvent.create({
      data: {
        seniorId,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        notes: notes || 'Emergency help triggered via ElderEase button',
        audioAlertPlayed: true,
      },
    });

    const seniorName = senior?.user.name || 'Senior';

    // Dispatch urgent notification to all caregivers
    await NotificationService.notifyCaregiversOfSenior(seniorId, {
      title: '🚨 EMERGENCY ALERT',
      message: `${seniorName} pressed "I NEED HELP" at ${new Date().toLocaleTimeString('en-IN')}. Please check on them immediately!`,
      type: 'EMERGENCY',
      entityId: emergency.id,
    });

    res.status(201).json({
      success: true,
      message: 'Your family member has been notified immediately.',
      data: {
        emergencyId: emergency.id,
        emergencyContactName: senior?.emergencyContactName,
        emergencyContactPhone: senior?.emergencyContactPhone,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function triggerFamilyCall(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const seniorId = req.user?.seniorProfileId;
    if (!seniorId) {
      res.status(403).json({ success: false, error: 'Only seniors can request family call.' });
      return;
    }

    const { message } = req.body;

    const senior = await prisma.seniorProfile.findUnique({
      where: { id: seniorId },
      include: { user: true },
    });

    const helpReq = await prisma.helpRequest.create({
      data: {
        seniorId,
        type: 'FAMILY_CALL',
        status: 'OPEN',
        message: message || 'Senior wants to speak with family.',
      },
    });

    const seniorName = senior?.user.name || 'Senior';

    await NotificationService.notifyCaregiversOfSenior(seniorId, {
      title: 'Family Call Requested',
      message: `${seniorName} wants you to call them when you have a moment.`,
      type: 'HELP_REQUEST',
      entityId: helpReq.id,
    });

    res.status(201).json({
      success: true,
      message: 'Your family has been informed. They will reach out soon.',
      data: helpReq,
    });
  } catch (error) {
    next(error);
  }
}

export async function resolveEmergency(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const emergency = await prisma.emergencyEvent.update({
      where: { id },
      data: {
        resolved: true,
        resolvedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Emergency event marked as resolved.',
      data: emergency,
    });
  } catch (error) {
    next(error);
  }
}

export async function getFamilyHelpRequests(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const seniorId = req.user?.seniorProfileId;
    const requests = await prisma.helpRequest.findMany({
      where: seniorId ? { seniorId } : {},
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
}
