import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { NotificationService } from '../services/notificationService';

export async function triggerDemoMedicineReminder(req: Request, res: Response, next: NextFunction) {
  try {
    const senior = await prisma.seniorProfile.findFirst({
      include: {
        user: true,
        medicines: { include: { schedules: true } },
      },
    });

    if (!senior || senior.medicines.length === 0) {
      res.status(404).json({ success: false, error: 'Demo senior profile not found.' });
      return;
    }

    const med = senior.medicines[0];
    const sched = med.schedules[0];

    const todayStr = new Date().toISOString().split('T')[0];
    const conf = await prisma.medicineConfirmation.create({
      data: {
        scheduleId: sched.id,
        scheduledFor: new Date(),
        status: 'PENDING',
        notes: 'Simulated Demo Reminder',
      },
    });

    res.json({
      success: true,
      message: `Triggered demo reminder for ${med.name}.`,
      data: {
        medicine: med.name,
        dosage: med.dosage,
        scheduleId: sched.id,
        confirmationId: conf.id,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function simulateMissedMedicine(req: Request, res: Response, next: NextFunction) {
  try {
    const senior = await prisma.seniorProfile.findFirst({
      include: { user: true, medicines: true },
    });

    if (!senior) {
      res.status(404).json({ success: false, error: 'Demo senior not found.' });
      return;
    }

    const medName = senior.medicines[0]?.name || 'BP Medicine (Amlodipine 5mg)';

    await NotificationService.notifyCaregiversOfSenior(senior.id, {
      title: 'Missed Medicine Alert',
      message: `${senior.user.name} has not confirmed the 08:00 AM dose of ${medName}. Please check on them.`,
      type: 'MISSED_MEDICINE',
    });

    res.json({
      success: true,
      message: `Simulated missed medicine notification sent to caregivers for ${medName}.`,
    });
  } catch (error) {
    next(error);
  }
}

export async function simulateMissedCheckin(req: Request, res: Response, next: NextFunction) {
  try {
    const senior = await prisma.seniorProfile.findFirst({
      include: { user: true },
    });

    if (!senior) {
      res.status(404).json({ success: false, error: 'Demo senior not found.' });
      return;
    }

    await NotificationService.notifyCaregiversOfSenior(senior.id, {
      title: 'Missed Daily Check-in Alert',
      message: `We have not received today's morning check-in from ${senior.user.name}. Please check on them.`,
      type: 'CHECK_IN',
    });

    res.json({
      success: true,
      message: `Simulated missed check-in alert dispatched to caregivers.`,
    });
  } catch (error) {
    next(error);
  }
}

export async function triggerDemoEmergency(req: Request, res: Response, next: NextFunction) {
  try {
    const senior = await prisma.seniorProfile.findFirst({
      include: { user: true },
    });

    if (!senior) {
      res.status(404).json({ success: false, error: 'Demo senior not found.' });
      return;
    }

    const event = await prisma.emergencyEvent.create({
      data: {
        seniorId: senior.id,
        latitude: 18.5204,
        longitude: 73.8567,
        notes: 'Simulated Demo Emergency Event',
        audioAlertPlayed: true,
      },
    });

    await NotificationService.notifyCaregiversOfSenior(senior.id, {
      title: '🚨 EMERGENCY ALERT',
      message: `${senior.user.name} pressed "I NEED HELP" (Simulated GPS: 18.5204° N, 73.8567° E). Immediate attention advised!`,
      type: 'EMERGENCY',
      entityId: event.id,
    });

    res.json({
      success: true,
      message: 'Demo emergency event dispatched with caregiver high-priority notification.',
      data: event,
    });
  } catch (error) {
    next(error);
  }
}
