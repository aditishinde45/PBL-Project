import { Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth';
import { NotificationService } from '../services/notificationService';

export async function getAppointments(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    let seniorId = req.user?.seniorProfileId;

    if (req.user?.role === 'CAREGIVER' && req.query.seniorId) {
      seniorId = req.query.seniorId as string;
    }

    if (!seniorId) {
      res.status(400).json({ success: false, error: 'Senior profile ID required.' });
      return;
    }

    const appointments = await prisma.appointment.findMany({
      where: { seniorId },
      orderBy: { dateTime: 'asc' },
    });

    res.json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
}

export async function createAppointment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    let seniorId = req.user?.seniorProfileId;
    const { doctorName, specialty, dateTime, location, notes, targetSeniorId } = req.body;

    if (req.user?.role === 'CAREGIVER' && targetSeniorId) {
      seniorId = targetSeniorId;
    }

    if (!seniorId || !doctorName || !dateTime) {
      res.status(400).json({ success: false, error: 'Doctor name and appointment date/time are required.' });
      return;
    }

    const appointment = await prisma.appointment.create({
      data: {
        seniorId,
        doctorName,
        specialty,
        dateTime: new Date(dateTime),
        location,
        notes,
        status: 'SCHEDULED',
      },
      include: {
        senior: { include: { user: true } },
      },
    });

    // Notify caregivers
    await NotificationService.notifyCaregiversOfSenior(seniorId, {
      title: 'Doctor Appointment Scheduled',
      message: `Appointment with ${doctorName} on ${new Date(dateTime).toLocaleDateString('en-IN')}.`,
      type: 'APPOINTMENT',
      entityId: appointment.id,
    });

    res.status(201).json({
      success: true,
      message: 'Appointment scheduled successfully.',
      data: appointment,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAppointment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status, notes, dateTime } = req.body;

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notes && { notes }),
        ...(dateTime && { dateTime: new Date(dateTime) }),
      },
    });

    res.json({ success: true, message: 'Appointment updated.', data: updated });
  } catch (error) {
    next(error);
  }
}
