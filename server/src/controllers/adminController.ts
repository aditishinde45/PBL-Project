import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';

export async function getAllTasksAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        steps: { orderBy: { stepNumber: 'asc' } },
        _count: { select: { sessions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
}

export async function createTaskAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, category, description, difficulty = 'EASY', steps = [] } = req.body;

    if (!title || !description) {
      res.status(400).json({ success: false, error: 'Title and description are required.' });
      return;
    }

    const slug = (req.body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) + '-' + Date.now();

    const task = await prisma.task.create({
      data: {
        slug,
        title,
        category: category || 'General',
        description,
        difficulty,
        isPublished: true,
        steps: {
          create: steps.map((s: any, idx: number) => ({
            stepNumber: idx + 1,
            title: s.title || `Step ${idx + 1}`,
            instructionEn: s.instructionEn || s.instruction || '',
            instructionHi: s.instructionHi || '',
            instructionMr: s.instructionMr || '',
            expectedAction: s.expectedAction || null,
          })),
        },
      },
      include: { steps: true },
    });

    res.status(201).json({ success: true, message: 'Task created.', data: task });
  } catch (error) {
    next(error);
  }
}

export async function togglePublishTask(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found.' });
      return;
    }

    const updated = await prisma.task.update({
      where: { id },
      data: { isPublished: !task.isPublished },
    });

    res.json({
      success: true,
      message: `Task is now ${updated.isPublished ? 'published' : 'unpublished'}.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAnalyticsSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const totalSessions = await prisma.guidedSession.count();
    const completedSessions = await prisma.guidedSession.count({ where: { status: 'COMPLETED' } });
    const inProgressSessions = await prisma.guidedSession.count({ where: { status: 'IN_PROGRESS' } });
    const totalEmergencies = await prisma.emergencyEvent.count();
    const totalHelpRequests = await prisma.helpRequest.count();

    const feedbacks = await prisma.feedback.groupBy({
      by: ['rating'],
      _count: { rating: true },
    });

    const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 100;

    res.json({
      success: true,
      data: {
        totalSessions,
        completedSessions,
        inProgressSessions,
        completionRate: `${completionRate}%`,
        totalEmergencies,
        totalHelpRequests,
        feedbackBreakdown: feedbacks,
      },
    });
  } catch (error) {
    next(error);
  }
}
