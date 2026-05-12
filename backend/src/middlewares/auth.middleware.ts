import { Request, Response, NextFunction } from 'express';
import { createClerkClient } from '@clerk/express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const getClerk = () => createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export interface AuthRequest extends Request {
  userId?: string;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    // Dev bypass — only active in non-production when DEV_BYPASS_TOKEN is set
    if (process.env.NODE_ENV !== 'production' && token === process.env.DEV_BYPASS_TOKEN) {
      const devEmail = 'dev@karktech.com';
      let user = await prisma.user.findUnique({ where: { email: devEmail } });
      if (!user) {
        user = await prisma.user.create({
          data: { clerkId: 'dev_bypass_user', email: devEmail, name: 'Dev User' },
        });
      }
      req.userId = user.id;
      return next();
    }

    const payload = await getClerk().verifyToken(token);
    const clerkUserId = payload.sub;

    // Lazy-sync: create DB user on first request
    let user = await prisma.user.findUnique({ where: { clerkId: clerkUserId } });
    if (!user) {
      const clerkUser = await clerk.users.getUser(clerkUserId);
      const email = clerkUser.emailAddresses[0]?.emailAddress || '';
      const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || email;

      user = await prisma.user.upsert({
        where: { email },
        update: { clerkId: clerkUserId },
        create: { clerkId: clerkUserId, email, name },
      });
    }

    req.userId = user.id;
    next();
  } catch (err: any) {
    console.error('Auth error:', err?.message || err);
    res.status(401).json({ error: 'Unauthorized' });
  }
};
