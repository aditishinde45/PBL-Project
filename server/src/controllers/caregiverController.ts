import { Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth';
import { NotificationService } from '../services/notificationService';

export async function getCaregiverDashboard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const caregiverProfileId = req.user?.caregiverProfileId;
    if (!caregiverProfileId) {
      res.status(403).json({ success: false, error: 'Access restricted to caregivers.' });
      return;
    }

    // Find all connected seniors
    const connections = await prisma.caregiverConnection.findMany({
      where: {
        caregiverId: caregiverProfileId,
        status: 'APPROVED',
      },
      include: {
        senior: {
          include: {
            user: { select: { id: true, name: true, phone: true } },
          },
        },
      },
    });

    const todayStr = new Date().toISOString().split('T')[0];

    const seniorsStatus = await Promise.all(
      connections.map(async (conn) => {
        const senior = conn.senior;

        // Today's check-in
        const checkIn = await prisma.checkIn.findUnique({
          where: {
            seniorId_date: {
              seniorId: senior.id,
              date: todayStr,
            },
          },
        });

        // Medicines today
        const medicines = await prisma.medicine.findMany({
          where: { seniorId: senior.id, active: true },
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

        let totalDoses = 0;
        let takenDoses = 0;
        let pendingDoses = 0;
        let missedDoses = 0;

        medicines.forEach((m) => {
          m.schedules.forEach((s) => {
            totalDoses++;
            const conf = s.confirmations[0];
            if (conf && conf.status === 'TAKEN') takenDoses++;
            else if (conf && conf.status === 'MISSED') missedDoses++;
            else pendingDoses++;
          });
        });

        // Next Doctor Appointment
        const nextAppointment = await prisma.appointment.findFirst({
          where: {
            seniorId: senior.id,
            dateTime: { gte: new Date() },
            status: 'SCHEDULED',
          },
          orderBy: { dateTime: 'asc' },
        });

        // Active Emergency / Help requests
        const activeHelp = await prisma.helpRequest.findMany({
          where: { seniorId: senior.id, status: 'OPEN' },
        });

        const activeEmergency = await prisma.emergencyEvent.findMany({
          where: { seniorId: senior.id, resolved: false },
        });

        return {
          connectionId: conn.id,
          seniorId: senior.id,
          name: senior.user.name,
          phone: senior.user.phone,
          medicalNotes: senior.medicalNotes,
          todayCheckIn: checkIn ? checkIn.status : 'PENDING',
          checkInRespondedAt: checkIn?.respondedAt,
          medicineSummary: {
            total: totalDoses,
            taken: takenDoses,
            pending: pendingDoses,
            missed: missedDoses,
          },
          nextAppointment,
          emergencyAlerts: activeEmergency.length > 0,
          helpRequestsCount: activeHelp.length,
        };
      })
    );

    // Recent notifications for caregiver
    const notifications = await prisma.notification.findMany({
      where: { recipientId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    res.json({
      success: true,
      data: {
        seniors: seniorsStatus,
        notifications,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function connectSeniorByCode(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const caregiverProfileId = req.user?.caregiverProfileId;
    if (!caregiverProfileId) {
      res.status(403).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { inviteCode } = req.body;
    if (!inviteCode) {
      res.status(400).json({ success: false, error: 'Please enter the 6-character connection code.' });
      return;
    }

    const senior = await prisma.seniorProfile.findUnique({
      where: { inviteCode: inviteCode.trim().toUpperCase() },
      include: { user: true },
    });

    if (!senior) {
      res.status(404).json({
        success: false,
        error: 'Invalid connection code. Please check with your family member.',
      });
      return;
    }

    // Check if already connected
    const existing = await prisma.caregiverConnection.findUnique({
      where: {
        seniorId_caregiverId: {
          seniorId: senior.id,
          caregiverId: caregiverProfileId,
        },
      },
    });

    if (existing) {
      res.status(400).json({
        success: false,
        error: 'You are already connected with this senior.',
      });
      return;
    }

    const connection = await prisma.caregiverConnection.create({
      data: {
        seniorId: senior.id,
        caregiverId: caregiverProfileId,
        status: 'APPROVED',
        permissions: 'Full',
      },
    });

    // Notify senior that caregiver connected
    await NotificationService.notifyUser({
      recipientId: senior.userId,
      title: 'Family Member Connected',
      message: `${req.user?.name} has connected to your ElderEase care circle.`,
      type: 'SYSTEM',
    });

    res.status(201).json({
      success: true,
      message: `Successfully connected with ${senior.user.name}!`,
      data: connection,
    });
  } catch (error) {
    next(error);
  }
}

export async function createFamilyTask(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const caregiverProfileId = req.user?.caregiverProfileId;
    const { seniorId, title, description, dueDate } = req.body;

    if (!caregiverProfileId || !seniorId || !title) {
      res.status(400).json({ success: false, error: 'Missing required task information.' });
      return;
    }

    // Verify authorized connection
    const connection = await prisma.caregiverConnection.findUnique({
      where: {
        seniorId_caregiverId: {
          seniorId,
          caregiverId: caregiverProfileId,
        },
      },
      include: { senior: true },
    });

    if (!connection || connection.status !== 'APPROVED') {
      res.status(403).json({
        success: false,
        error: 'You do not have permission to assign tasks to this senior.',
      });
      return;
    }

    const task = await prisma.familyTask.create({
      data: {
        seniorId,
        caregiverId: caregiverProfileId,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    // Notify senior
    await NotificationService.notifyUser({
      recipientId: connection.senior.userId,
      title: 'New Family Note',
      message: `${req.user?.name} added a note: "${title}"`,
      type: 'FAMILY_TASK',
      entityId: task.id,
    });

    res.status(201).json({
      success: true,
      message: 'Family task created successfully.',
      data: task,
    });
  } catch (error) {
    next(error);
  }
}
