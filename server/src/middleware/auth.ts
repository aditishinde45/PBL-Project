import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string | null;
    phone: string | null;
    name: string;
    role: string;
    seniorProfileId?: string;
    caregiverProfileId?: string;
  };
}

export async function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Please log in to continue.',
      code: 'UNAUTHORIZED',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        seniorProfile: true,
        caregiverProfile: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Account not found. Please log in again.',
        code: 'USER_NOT_FOUND',
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      role: user.role,
      seniorProfileId: user.seniorProfile?.id,
      caregiverProfileId: user.caregiverProfile?.id,
    };

    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      error: 'Your session has expired. Please log in again.',
      code: 'INVALID_TOKEN',
    });
  }
}

export async function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        seniorProfile: true,
        caregiverProfile: true,
      },
    });

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
        seniorProfileId: user.seniorProfile?.id,
        caregiverProfileId: user.caregiverProfile?.id,
      };
    }
    next();
  } catch (error) {
    next();
  }
}

export function requireRole(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required.',
        code: 'UNAUTHORIZED',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'You do not have permission to access this section.',
        code: 'FORBIDDEN',
      });
      return;
    }

    next();
  };
}
