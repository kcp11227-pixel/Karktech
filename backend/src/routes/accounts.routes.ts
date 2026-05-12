import { Router } from 'express';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();
const prisma = new PrismaClient();
const APP_ID = process.env.FACEBOOK_APP_ID;
const APP_SECRET = process.env.FACEBOOK_APP_SECRET;

router.use(authenticate);

// List all connected Facebook accounts
router.get('/', async (req: AuthRequest, res) => {
  try {
    const accounts = await prisma.facebookAccount.findMany({
      where: { userId: req.userId },
      select: {
        id: true,
        fbUserId: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
        _count: { select: { pages: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json(accounts);
  } catch {
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// Connect a new Facebook account via user access token
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) return res.status(400).json({ error: 'accessToken is required' });

    const userId = req.userId!;

    // Exchange short-lived for long-lived user token (fall back to original if exchange fails)
    let longLivedToken = accessToken;
    try {
      const tokenRes = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: APP_ID,
          client_secret: APP_SECRET,
          fb_exchange_token: accessToken,
        },
      });
      longLivedToken = tokenRes.data.access_token || accessToken;
    } catch (exchangeErr: any) {
      console.warn('Token exchange failed, using original token:', exchangeErr.response?.data || exchangeErr.message);
    }

    // Get Facebook user info
    const meRes = await axios.get('https://graph.facebook.com/v19.0/me', {
      params: {
        access_token: longLivedToken,
        fields: 'id,name,picture.type(large)',
      },
    });
    const { id: fbUserId, name, picture } = meRes.data;
    const avatarUrl = picture?.data?.url || null;

    // Upsert the account
    const account = await prisma.facebookAccount.upsert({
      where: { userId_fbUserId: { userId, fbUserId } },
      update: { name, avatarUrl, accessToken: longLivedToken },
      create: { userId, fbUserId, name, avatarUrl, accessToken: longLivedToken },
    });

    // Fetch pages managed by this account (with picture)
    const pagesRes = await axios.get('https://graph.facebook.com/v19.0/me/accounts', {
      params: { access_token: longLivedToken, fields: 'id,name,access_token,picture.type(large)' },
    });
    const pages: any[] = pagesRes.data?.data || [];

    for (const page of pages) {
      const pictureUrl = page.picture?.data?.url || null;
      await prisma.facebookPage.upsert({
        where: { userId_pageId: { userId, pageId: page.id } },
        update: {
          name: page.name,
          accessToken: page.access_token,
          accountId: account.id,
          pictureUrl,
        },
        create: {
          userId,
          accountId: account.id,
          pageId: page.id,
          name: page.name,
          accessToken: page.access_token,
          pictureUrl,
        },
      });
    }

    res.json({ account, pagesCount: pages.length });
  } catch (error: any) {
    const fbError = error.response?.data?.error;
    console.error('Facebook connect error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to connect Facebook account',
      detail: fbError?.message || error.message,
      code: fbError?.code,
    });
  }
});

// Refresh page pictures for an account
router.post('/:id/refresh-pictures', async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const account = await prisma.facebookAccount.findFirst({
      where: { id, userId: req.userId },
      include: { pages: true },
    }) as any;
    if (!account) return res.status(404).json({ error: 'Account not found' });

    let updated = 0;
    for (const page of account.pages) {
      try {
        const picRes = await axios.get(`https://graph.facebook.com/v19.0/${page.pageId}/picture`, {
          params: { type: 'large', redirect: false, access_token: account.accessToken },
        });
        const pictureUrl = picRes.data?.data?.url || null;
        if (pictureUrl) {
          await prisma.facebookPage.update({ where: { id: page.id }, data: { pictureUrl } });
          updated++;
        }
      } catch { /* skip individual failures */ }
    }
    res.json({ updated });
  } catch {
    res.status(500).json({ error: 'Failed to refresh pictures' });
  }
});

// Remove a Facebook account (and nullify its pages)
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    await prisma.facebookAccount.deleteMany({
      where: { id, userId: req.userId },
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to remove account' });
  }
});

// Get pages for a specific account
router.get('/:id/pages', async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const pages = await prisma.facebookPage.findMany({
      where: { userId: req.userId, accountId: id },
      select: { id: true, pageId: true, name: true, pictureUrl: true, accountId: true },
    });
    res.json(pages);
  } catch {
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

export default router;
