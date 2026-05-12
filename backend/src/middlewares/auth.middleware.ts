import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    // Dev bypass token
    if (token === 'DEV_KARKTECH_2026') {
      const devEmail = 'dev@karktech.com';
      let user = await prisma.user.findUnique({ where: { email: devEmail } });
      if (!user) {
        user = await prisma.user.create({
          data: { email: devEmail, name: 'Dev User', clerkId: 'dev_bypass_user' },
        });
      }
      req.userId = user.id;
      return next();
    }

    // JWT verification
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch (err: any) {
    console.error('Auth error:', err?.message || err);
    res.status(401).json({ error: 'Unauthorized' });
  }
};
