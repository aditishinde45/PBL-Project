import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { config } from '../config';
import { AuthRequest } from '../middleware/auth';

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function registerSenior(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      name,
      email,
      phone,
      password,
      language = 'mr',
      fontSize = 'LARGE',
      voiceSpeed = 'SLOW',
      emergencyContactName,
      emergencyContactPhone,
    } = req.body;

    if (!name || (!email && !phone) || !password) {
      res.status(400).json({
        success: false,
        error: 'Please provide your name, phone or email, and a password.',
        code: 'MISSING_FIELDS',
      });
      return;
    }

    // Check existing
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          phone ? { phone } : {},
        ],
      },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        error: 'An account with this email or phone number already exists.',
        code: 'USER_EXISTS',
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const inviteCode = generateInviteCode();

    const user = await prisma.user.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        passwordHash,
        role: 'SENIOR',
        preference: {
          create: {
            language,
            fontSize,
            voiceSpeed,
            highContrast: false,
            ttsEnabled: true,
          },
        },
        seniorProfile: {
          create: {
            inviteCode,
            emergencyContactName,
            emergencyContactPhone,
          },
        },
      },
      include: {
        seniorProfile: true,
        preference: true,
      },
    });

    const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Senior account created successfully.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          inviteCode: user.seniorProfile?.inviteCode,
          preference: user.preference,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function registerCaregiver(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, phone, password, relationshipToSenior, seniorInviteCode } = req.body;

    if (!name || (!email && !phone) || !password) {
      res.status(400).json({
        success: false,
        error: 'Please provide name, contact, and password.',
        code: 'MISSING_FIELDS',
      });
      return;
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          phone ? { phone } : {},
        ],
      },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        error: 'An account with this email or phone number already exists.',
        code: 'USER_EXISTS',
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        passwordHash,
        role: 'CAREGIVER',
        preference: {
          create: {
            language: 'en',
            fontSize: 'NORMAL',
            voiceSpeed: 'NORMAL',
            highContrast: false,
            ttsEnabled: false,
          },
        },
        caregiverProfile: {
          create: {
            relationshipToSenior: relationshipToSenior || 'Family Caregiver',
          },
        },
      },
      include: {
        caregiverProfile: true,
        preference: true,
      },
    });

    // If an invite code was provided at registration, attempt automatic approved pairing
    if (seniorInviteCode) {
      const senior = await prisma.seniorProfile.findUnique({
        where: { inviteCode: seniorInviteCode.trim().toUpperCase() },
      });
      if (senior && user.caregiverProfile) {
        await prisma.caregiverConnection.create({
          data: {
            seniorId: senior.id,
            caregiverId: user.caregiverProfile.id,
            status: 'APPROVED',
            permissions: 'Full',
          },
        });
      }
    }

    const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Caregiver account created successfully.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          preference: user.preference,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { identifier, password } = req.body; // identifier can be email or phone

    if (!identifier || !password) {
      res.status(400).json({
        success: false,
        error: 'Please enter your email or phone number, and password.',
        code: 'MISSING_CREDENTIALS',
      });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
      include: {
        seniorProfile: true,
        caregiverProfile: true,
        preference: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'No account found with this login. Please check and try again.',
        code: 'INVALID_CREDENTIALS',
      });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: 'Incorrect password. Please try again.',
        code: 'INVALID_CREDENTIALS',
      });
      return;
    }

    const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          seniorProfileId: user.seniorProfile?.id,
          caregiverProfileId: user.caregiverProfile?.id,
          inviteCode: user.seniorProfile?.inviteCode,
          preference: user.preference,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function demoLogin(req: Request, res: Response, next: NextFunction) {
  try {
    let user = await prisma.user.findFirst({
      where: { email: 'aai@elderease.com' },
      include: {
        seniorProfile: true,
        preference: true,
      },
    });

    if (!user) {
      const passwordHash = await bcrypt.hash('aai123', 10);
      user = await prisma.user.create({
        data: {
          name: 'Aaji (Kamalabai)',
          email: 'aai@elderease.com',
          phone: '9876543210',
          passwordHash,
          role: 'SENIOR',
          preference: {
            create: {
              language: 'mr',
              fontSize: 'LARGE',
              voiceSpeed: 'NORMAL',
              theme: 'light',
              ttsEnabled: true,
            },
          },
          seniorProfile: {
            create: {
              inviteCode: 'AAJI99',
              emergencyContactName: 'Priya (Daughter)',
              emergencyContactPhone: '+91 98200 12345',
            },
          },
        },
        include: {
          seniorProfile: true,
          preference: true,
        },
      });
    }

    const token = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Demo login successful as Aaji.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          seniorProfileId: user.seniorProfile?.id,
          inviteCode: user.seniorProfile?.inviteCode,
          preference: user.preference,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        seniorProfile: {
          include: {
            connections: {
              include: {
                caregiver: {
                  include: {
                    user: {
                      select: { name: true, phone: true, email: true },
                    },
                  },
                },
              },
            },
          },
        },
        caregiverProfile: {
          include: {
            connections: {
              include: {
                senior: {
                  include: {
                    user: {
                      select: { name: true, phone: true },
                    },
                  },
                },
              },
            },
          },
        },
        preference: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        seniorProfile: user.seniorProfile,
        caregiverProfile: user.caregiverProfile,
        preference: user.preference,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response) {
  res.json({ success: true, message: 'Logged out successfully.' });
}
