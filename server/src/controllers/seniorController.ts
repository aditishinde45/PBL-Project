import { Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth';

export async function getSeniorProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const profile = await prisma.seniorProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        connections: {
          include: {
            caregiver: {
              include: {
                user: { select: { name: true, phone: true, email: true } },
              },
            },
          },
        },
      },
    });

    if (!profile) {
      res.status(404).json({ success: false, error: 'Senior profile not found.' });
      return;
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
}

export async function updateSeniorPreferences(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { language, fontSize, voiceSpeed, highContrast, ttsEnabled, theme } = req.body;

    const updated = await prisma.preference.upsert({
      where: { userId },
      create: {
        userId,
        language: language || 'mr',
        fontSize: fontSize || 'LARGE',
        voiceSpeed: voiceSpeed || 'NORMAL',
        theme: theme || 'light',
        highContrast: highContrast ?? false,
        ttsEnabled: ttsEnabled ?? true,
      },
      update: {
        ...(language && { language }),
        ...(fontSize && { fontSize }),
        ...(voiceSpeed && { voiceSpeed }),
        ...(theme && { theme }),
        ...(highContrast !== undefined && { highContrast }),
        ...(ttsEnabled !== undefined && { ttsEnabled }),
      },
    });

    res.json({
      success: true,
      message: 'Preferences updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSeniorOverview(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const seniorProfileId = req.user?.seniorProfileId;
    if (!seniorProfileId) {
      res.status(403).json({ success: false, error: 'Access restricted to senior profiles.' });
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Today's check-in
    const checkIn = await prisma.checkIn.findUnique({
      where: {
        seniorId_date: {
          seniorId: seniorProfileId,
          date: todayStr,
        },
      },
    });

    // 2. Next scheduled medicine for today
    const medicines = await prisma.medicine.findMany({
      where: { seniorId: seniorProfileId, active: true },
      include: {
        schedules: {
          include: {
            confirmations: {
              where: {
                scheduledFor: {
                  gte: new Date(`${todayStr}T00:00:00`),
                  lte: new Date(`${todayStr}T23:59:59`),
                },
              },
            },
          },
        },
      },
    });

    // 3. Upcoming appointment
    const nextAppointment = await prisma.appointment.findFirst({
      where: {
        seniorId: seniorProfileId,
        dateTime: { gte: new Date() },
        status: 'SCHEDULED',
      },
      orderBy: { dateTime: 'asc' },
    });

    // 4. Pending family tasks
    const pendingTasks = await prisma.familyTask.findMany({
      where: {
        seniorId: seniorProfileId,
        isCompleted: false,
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    // Format medicines summary
    const todayDoses: any[] = [];
    medicines.forEach((med) => {
      med.schedules.forEach((sch) => {
        const conf = sch.confirmations[0];
        todayDoses.push({
          scheduleId: sch.id,
          medicineName: med.name,
          dosage: med.dosage,
          time: sch.time,
          status: conf ? conf.status : 'PENDING',
          confirmationId: conf ? conf.id : null,
        });
      });
    });

    // Sort doses by time
    todayDoses.sort((a, b) => a.time.localeCompare(b.time));

    res.json({
      success: true,
      data: {
        checkInStatus: checkIn ? checkIn.status : 'PENDING',
        todayDoses,
        nextAppointment,
        pendingTasks,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function generateCaregiverCode(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const seniorProfileId = req.user?.seniorProfileId;
    if (!seniorProfileId) {
      res.status(403).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const updated = await prisma.seniorProfile.update({
      where: { id: seniorProfileId },
      data: { inviteCode: code },
    });

    res.json({
      success: true,
      message: 'New connection code generated.',
      data: { inviteCode: updated.inviteCode },
    });
  } catch (error) {
    next(error);
  }
}
