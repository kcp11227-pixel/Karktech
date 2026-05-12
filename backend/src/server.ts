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
  origin: (origin, cb) => {
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

// Facebook OAuth callback — no auth middleware (public)
app.get('/api/facebook/oauth/start', (req, res) => {
  const { userId } = req.query;
  const APP_ID = process.env.FACEBOOK_APP_ID;
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
  const redirectUri = `${BACKEND_URL}/api/facebook/oauth/callback`;
  const scope = 'pages_manage_posts,pages_read_engagement,pages_show_list,public_profile';
  const state = encodeURIComponent(String(userId || ''));
  const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;
  res.redirect(url);
});

app.get('/api/facebook/oauth/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code) return res.send('<script>window.close();</script>');

  try {
    const APP_ID = process.env.FACEBOOK_APP_ID;
    const APP_SECRET = process.env.FACEBOOK_APP_SECRET;
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
    const redirectUri = `${BACKEND_URL}/api/facebook/oauth/callback`;

    // Exchange code for token
    const tokenRes = await (await import('axios')).default.get('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: { client_id: APP_ID, client_secret: APP_SECRET, redirect_uri: redirectUri, code },
    });
    const accessToken = tokenRes.data.access_token;

    // Get long-lived token
    const llRes = await (await import('axios')).default.get('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: { grant_type: 'fb_exchange_token', client_id: APP_ID, client_secret: APP_SECRET, fb_exchange_token: accessToken },
    });
    const longToken = llRes.data.access_token || accessToken;

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.send(`
      <script>
        window.opener && window.opener.postMessage({ type: 'fb_oauth_token', token: '${longToken}' }, '${frontendUrl}');
        window.close();
      </script>
    `);
  } catch (err: any) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.send(`<script>window.opener && window.opener.postMessage({ type: 'fb_oauth_error', error: 'Failed' }, '${frontendUrl}'); window.close();</script>`);
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
