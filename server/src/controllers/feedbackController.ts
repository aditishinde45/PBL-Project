import { Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth';

export async function submitTaskFeedback(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { sessionId, rating, comment } = req.body; // rating: 'GOOD' | 'POOR'

    if (!sessionId || !rating) {
      res.status(400).json({ success: false, error: 'Session ID and rating are required.' });
      return;
    }

    const feedback = await prisma.feedback.create({
      data: {
        sessionId,
        rating,
        comment,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your valuable feedback!',
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
}
