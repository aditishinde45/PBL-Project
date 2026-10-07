import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth';

export async function getPublishedTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const tasks = await prisma.task.findMany({
      where: { isPublished: true },
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' },
        },
      },
    });

    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
}

export async function getTaskById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const task = await prisma.task.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
        ],
      },
      include: {
        steps: {
          orderBy: { stepNumber: 'asc' },
        },
      },
    });

    if (!task) {
      res.status(404).json({ success: false, error: 'Task not found.' });
      return;
    }

    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
}

export async function startTaskSession(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const seniorId = req.user?.seniorProfileId;
    const { taskId } = req.body;

    if (!seniorId || !taskId) {
      res.status(400).json({ success: false, error: 'Senior profile and task ID required.' });
      return;
    }

    // Resolve task by id or slug
    const resolvedTask = await prisma.task.findFirst({
      where: {
        OR: [{ id: taskId }, { slug: taskId }],
      },
    });

    if (!resolvedTask) {
      res.status(404).json({ success: false, error: 'Task not found.' });
      return;
    }

    const actualTaskId = resolvedTask.id;

    // Check if an existing in-progress session exists
    let session = await prisma.guidedSession.findFirst({
      where: {
        seniorId,
        taskId: actualTaskId,
        status: 'IN_PROGRESS',
      },
      include: {
        task: {
          include: {
            steps: { orderBy: { stepNumber: 'asc' } },
          },
        },
      },
    });

    if (!session) {
      session = await prisma.guidedSession.create({
        data: {
          seniorId,
          taskId,
          currentStepIndex: 0,
          status: 'IN_PROGRESS',
        },
        include: {
          task: {
            include: {
              steps: { orderBy: { stepNumber: 'asc' } },
            },
          },
        },
      });
    }

    res.json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
}

export async function updateSessionProgress(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { sessionId } = req.params;
    const { currentStepIndex, status } = req.body;

    const updated = await prisma.guidedSession.update({
      where: { id: sessionId },
      data: {
        ...(currentStepIndex !== undefined && { currentStepIndex }),
        ...(status && { status }),
        lastActiveAt: new Date(),
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
}

export async function getActiveRecoverableSession(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const seniorId = req.user?.seniorProfileId;
    if (!seniorId) {
      res.json({ success: true, data: null });
      return;
    }

    const activeSession = await prisma.guidedSession.findFirst({
      where: {
        seniorId,
        status: 'IN_PROGRESS',
      },
      orderBy: { lastActiveAt: 'desc' },
      include: {
        task: {
          include: {
            steps: { orderBy: { stepNumber: 'asc' } },
          },
        },
      },
    });

    res.json({ success: true, data: activeSession });
  } catch (error) {
    next(error);
  }
}
