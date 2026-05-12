import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { startScheduler } from './scheduler';
import authRoutes from './routes/auth.routes';
import facebookRoutes from './routes/facebook.routes';
import accountRoutes from './routes/accounts.routes';
import postRoutes from './routes/posts.routes';
import mediaRoutes from './routes/media.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
];

app.use(cors({
  origin: (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '20mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Basic security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Facebook OAuth — full-page redirect (no popup, no JS SDK issues)
app.get('/api/facebook/oauth/start', (req, res) => {
  const APP_ID = process.env.FACEBOOK_APP_ID;
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
  const redirectUri = `${BACKEND_URL}/api/facebook/oauth/callback`;
  const scope = 'pages_manage_posts,pages_show_list,public_profile';
  const state = encodeURIComponent(String(req.query.state || ''));
  const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;
  res.redirect(url);
});

app.get('/api/facebook/oauth/callback', async (req, res) => {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
  const { code, state } = req.query;
  if (!code) return res.redirect(`${FRONTEND_URL}/?fb_error=cancelled`);

  try {
    const APP_ID = process.env.FACEBOOK_APP_ID;
    const APP_SECRET = process.env.FACEBOOK_APP_SECRET;
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
    const redirectUri = `${BACKEND_URL}/api/facebook/oauth/callback`;
    const axiosInst = (await import('axios')).default;
    const { PrismaClient } = await import('@prisma/client');
    const jwtMod = await import('jsonwebtoken');
    const jwtVerify = (jwtMod.default || jwtMod).verify as typeof import('jsonwebtoken').verify;
    const prisma = new PrismaClient();
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

    // Decode state to get user JWT
    let userId: string | null = null;
    try {
      // Handle URL-safe base64 (Facebook may alter + and / in state)
      const rawState = String(state).replace(/-/g, '+').replace(/_/g, '/');
      const stateData = JSON.parse(Buffer.from(rawState, 'base64').toString());
      const token = stateData.token;
      // Handle dev bypass token
      if (token === 'DEV_KARKTECH_2026') {
        const devUser = await prisma.user.findFirst({ where: { email: 'dev@karktech.com' } });
        if (devUser) userId = devUser.id;
      } else {
        const payload = jwtVerify(token, JWT_SECRET) as { userId: string };
        userId = payload.userId;
      }
    } catch (e: any) {
      console.error('OAuth state decode error:', e?.message, 'state:', String(state).substring(0, 80));
    }

    if (!userId) return res.redirect(`${FRONTEND_URL}/?fb_error=auth`);

    // Exchange code for short-lived token
    const tokenRes = await axiosInst.get('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: { client_id: APP_ID, client_secret: APP_SECRET, redirect_uri: redirectUri, code },
    });
    const accessToken = tokenRes.data.access_token;

    // Exchange for long-lived token
    let longToken = accessToken;
    try {
      const llRes = await axiosInst.get('https://graph.facebook.com/v19.0/oauth/access_token', {
        params: { grant_type: 'fb_exchange_token', client_id: APP_ID, client_secret: APP_SECRET, fb_exchange_token: accessToken },
      });
      longToken = llRes.data.access_token || accessToken;
    } catch { }

    // Get FB user info
    const meRes = await axiosInst.get('https://graph.facebook.com/v19.0/me', {
      params: { access_token: longToken, fields: 'id,name,picture.type(large)' },
    });
    const { id: fbUserId, name, picture } = meRes.data;
    const avatarUrl = picture?.data?.url || null;

    // Upsert account
    const account = await prisma.facebookAccount.upsert({
      where: { userId_fbUserId: { userId, fbUserId } },
      update: { name, avatarUrl, accessToken: longToken },
      create: { userId, fbUserId, name, avatarUrl, accessToken: longToken },
    });

    // Get and store pages
    const pagesRes = await axiosInst.get('https://graph.facebook.com/v19.0/me/accounts', {
      params: { access_token: longToken, fields: 'id,name,access_token,picture.type(large)' },
    });
    for (const page of (pagesRes.data?.data || [])) {
      const pictureUrl = page.picture?.data?.url || null;
      await prisma.facebookPage.upsert({
        where: { userId_pageId: { userId, pageId: page.id } },
        update: { name: page.name, accessToken: page.access_token, accountId: account.id, pictureUrl },
        create: { userId, accountId: account.id, pageId: page.id, name: page.name, accessToken: page.access_token, pictureUrl },
      });
    }

    res.redirect(`${FRONTEND_URL}/?fb_success=1`);
  } catch (err: any) {
    console.error('OAuth callback error:', err?.response?.data || err.message);
    res.redirect(`${FRONTEND_URL}/?fb_error=failed`);
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/facebook', facebookRoutes);
app.use('/api/facebook/accounts', accountRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/media', mediaRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startScheduler();
});
