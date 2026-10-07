import { Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth';
import { NotificationService } from '../services/notificationService';

export async function getMedicines(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    let seniorId = req.user?.seniorProfileId;

    // If caregiver requested medicines for a connected senior
    if (req.user?.role === 'CAREGIVER' && req.query.seniorId) {
      const requestedSeniorId = req.query.seniorId as string;
      const connection = await prisma.caregiverConnection.findUnique({
        where: {
          seniorId_caregiverId: {
            seniorId: requestedSeniorId,
            caregiverId: req.user.caregiverProfileId!,
          },
        },
      });

      if (!connection || connection.status !== 'APPROVED') {
        res.status(403).json({ success: false, error: 'Unauthorized to view this senior.' });
        return;
      }
      seniorId = requestedSeniorId;
    }

    if (!seniorId) {
      res.status(400).json({ success: false, error: 'Senior profile ID required.' });
      return;
    }

    const medicines = await prisma.medicine.findMany({
      where: { seniorId, active: true },
      include: {
        schedules: {
          include: {
            confirmations: {
              orderBy: { scheduledFor: 'desc' },
              take: 5,
            },
          },
        },
      },
    });

    res.json({ success: true, data: medicines });
  } catch (error) {
    next(error);
  }
}

export async function createMedicine(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    let seniorId = req.user?.seniorProfileId;
    const { name, dosage, instructions, times = ['08:00'], frequency = 'DAILY', targetSeniorId } = req.body;

    if (req.user?.role === 'CAREGIVER' && targetSeniorId) {
      seniorId = targetSeniorId;
    }

    if (!seniorId || !name || !dosage) {
      res.status(400).json({ success: false, error: 'Medicine name and dosage are required.' });
      return;
    }

    const medicine = await prisma.medicine.create({
      data: {
        seniorId,
        name,
        dosage,
        instructions,
        active: true,
        schedules: {
          create: times.map((t: string) => ({
            time: t,
            frequency,
          })),
        },
      },
      include: { schedules: true },
    });

    res.status(201).json({
      success: true,
      message: 'Medicine added successfully.',
      data: medicine,
    });
  } catch (error) {
    next(error);
  }
}

export async function confirmMedicine(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { scheduleId, status = 'TAKEN', notes } = req.body;

    if (!scheduleId) {
      res.status(400).json({ success: false, error: 'Schedule ID is required.' });
      return;
    }

    const schedule = await prisma.medicineSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        medicine: {
          include: {
            senior: {
              include: { user: true },
            },
          },
        },
      },
    });

    if (!schedule) {
      res.status(404).json({ success: false, error: 'Medicine schedule not found.' });
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const scheduledDateTime = new Date(`${todayStr}T${schedule.time}:00`);

    // Find or create confirmation record for today
    let confirmation = await prisma.medicineConfirmation.findFirst({
      where: {
        scheduleId,
        scheduledFor: {
          gte: new Date(`${todayStr}T00:00:00`),
          lte: new Date(`${todayStr}T23:59:59`),
        },
      },
    });

    if (confirmation) {
      confirmation = await prisma.medicineConfirmation.update({
        where: { id: confirmation.id },
        data: {
          status,
          confirmedAt: new Date(),
          notes: notes || 'Confirmed by senior',
        },
      });
    } else {
      confirmation = await prisma.medicineConfirmation.create({
        data: {
          scheduleId,
          scheduledFor: scheduledDateTime,
          status,
          confirmedAt: new Date(),
          notes: notes || 'Confirmed by senior',
        },
      });
    }

    // If confirmed taken, notify caregiver
    if (status === 'TAKEN') {
      const seniorName = schedule.medicine.senior.user.name;
      await NotificationService.notifyCaregiversOfSenior(schedule.medicine.seniorId, {
        title: 'Medicine Taken',
        message: `${seniorName} confirmed taking ${schedule.medicine.name} at ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}.`,
        type: 'MISSED_MEDICINE',
        entityId: confirmation.id,
      });
    }

    res.json({
      success: true,
      message: status === 'TAKEN' ? 'Great! Medicine marked as taken.' : 'Reminder postponed.',
      data: confirmation,
    });
  } catch (error) {
    next(error);
  }
}

export async function checkMissedMedicines(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentHours = now.getHours();
    const currentMins = now.getMinutes();
    const currentTimeStr = `${String(currentHours).padStart(2, '0')}:${String(currentMins).padStart(2, '0')}`;

    // Find schedules whose time was at least 30 minutes ago today and has no taken confirmation
    const activeMedicines = await prisma.medicine.findMany({
      where: { active: true },
      include: {
        senior: { include: { user: true } },
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

    const missedAlerts = [];

    for (const med of activeMedicines) {
      for (const sch of med.schedules) {
        // Compare times
        if (sch.time < currentTimeStr) {
          const conf = sch.confirmations[0];
          if (!conf || conf.status === 'PENDING') {
            // Mark as missed
            if (conf) {
              await prisma.medicineConfirmation.update({
                where: { id: conf.id },
                data: { status: 'MISSED' },
              });
            } else {
              await prisma.medicineConfirmation.create({
                data: {
                  scheduleId: sch.id,
                  scheduledFor: new Date(`${todayStr}T${sch.time}:00`),
                  status: 'MISSED',
                },
              });
            }

            // Alert caregivers
            await NotificationService.notifyCaregiversOfSenior(med.seniorId, {
              title: 'Missed Medicine Alert',
              message: `${med.senior.user.name} has not confirmed the ${sch.time} dose of ${med.name}. Please check on them.`,
              type: 'MISSED_MEDICINE',
            });

            missedAlerts.push({
              senior: med.senior.user.name,
              medicine: med.name,
              time: sch.time,
            });
          }
        }
      }
    }

    res.json({
      success: true,
      message: `Evaluated medicines. Generated ${missedAlerts.length} missed alerts.`,
      data: missedAlerts,
    });
  } catch (error) {
    next(error);
  }
}
