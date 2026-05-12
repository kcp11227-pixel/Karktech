import { Router } from 'express';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();
const prisma = new PrismaClient();
const APP_ID = process.env.FACEBOOK_APP_ID;
const APP_SECRET = process.env.FACEBOOK_APP_SECRET;

router.use(authenticate);

// Add Facebook Page
router.post('/pages', async (req: AuthRequest, res) => {
  try {
    const { accessToken } = req.body; // Short-lived or long-lived token from frontend SDK
    const userId = req.userId!;

    // 1. Get Long-Lived Token
    const tokenResponse = await axios.get(`https://graph.facebook.com/v19.0/oauth/access_token`, {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: APP_ID,
        client_secret: APP_SECRET,
        fb_exchange_token: accessToken,
      }
    });

    const longLivedToken = tokenResponse.data.access_token;

    // 2. Fetch User Pages
    const pagesResponse = await axios.get(`https://graph.facebook.com/v19.0/me/accounts`, {
      params: { access_token: longLivedToken }
    });

    const pages = pagesResponse.data.data;

    // 3. Save to DB
    const savedPages = [];
    for (const page of pages) {
      const savedPage = await prisma.facebookPage.upsert({
        where: {
          userId_pageId: { userId, pageId: page.id }
        },
        update: {
          name: page.name,
          accessToken: page.access_token, // Page specific access token
        },
        create: {
          userId,
          pageId: page.id,
          name: page.name,
          accessToken: page.access_token,
        }
      });
      savedPages.push(savedPage);
    }

    res.json(savedPages);
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to add Facebook pages' });
  }
});

// Get user's connected pages (optionally filtered by accountId)
router.get('/pages', async (req: AuthRequest, res) => {
  try {
    const { accountId } = req.query;
    const where: any = { userId: req.userId };
    if (accountId && typeof accountId === 'string') where.accountId = accountId;

    const pages = await prisma.facebookPage.findMany({
      where,
      select: { id: true, pageId: true, name: true, pictureUrl: true, accountId: true },
    });
    res.json(pages);
  } catch {
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

export default router;
