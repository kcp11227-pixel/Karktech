import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';
import { publishPost } from '../utils/publishPost';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

// Create Post — if no scheduledFor, publish immediately to Facebook
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { pageId, content, link, scheduledFor, imageUrl } = req.body;
    const userId = req.userId!;

    if (!pageId) return res.status(400).json({ error: 'pageId is required' });

    const post = await prisma.post.create({
      data: {
        userId,
        pageId,
        content,
        link,
        imageUrl: imageUrl || null,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        status: scheduledFor ? 'SCHEDULED' : 'DRAFT',
      },
      include: { page: { select: { name: true, accountId: true } } },
    });

    // Publish immediately when not scheduled
    if (!scheduledFor) {
      try {
        await publishPost(post.id);
      } catch (pubErr: any) {
        console.error('Publish failed:', pubErr.response?.data || pubErr.message);
        await prisma.post.update({ where: { id: post.id }, data: { status: 'FAILED' } });
        await prisma.publishLog.create({
          data: {
            postId: post.id,
            status: 'FAILED',
            message: pubErr.response?.data?.error?.message || pubErr.message,
          },
        });
        return res.status(200).json({
          ...post,
          status: 'FAILED',
          publishError: pubErr.response?.data?.error?.message || pubErr.message,
        });
      }
      const updated = await prisma.post.findUnique({ where: { id: post.id } });
      return res.json(updated);
    }

    res.json(post);
  } catch (err: any) {
    console.error('Create post error:', err.message);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Bulk Schedule
router.post('/bulk', async (req: AuthRequest, res) => {
  try {
    const { items } = req.body as {
      items: { pageId: string; content: string; link?: string; imageUrl?: string; comment?: string; scheduledFor?: string }[];
    };
    const userId = req.userId!;

    if (!items?.length) return res.status(400).json({ error: 'items array is required' });

    const created = [];
    for (const item of items) {
      const post = await prisma.post.create({
        data: {
          userId,
          pageId: item.pageId,
          content: item.content,
          link: item.link,
          imageUrl: item.imageUrl || null,
          firstComment: item.comment || null,
          scheduledFor: item.scheduledFor ? new Date(item.scheduledFor) : null,
          status: item.scheduledFor ? 'SCHEDULED' : 'DRAFT',
        },
        include: { page: { select: { name: true } } },
      });

      if (!item.scheduledFor) {
        try { await publishPost(post.id, item.comment); } catch { /* logged */ }
      }

      created.push(post);
    }

    res.json(created);
  } catch {
    res.status(500).json({ error: 'Failed to bulk schedule posts' });
  }
});

// Get Posts
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { accountId } = req.query;

    const posts = await prisma.post.findMany({
      where: { userId: req.userId },
      include: {
        page: {
          select: {
            name: true,
            accountId: true,
            account: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const filtered = accountId && typeof accountId === 'string'
      ? posts.filter(p => p.page?.accountId === accountId)
      : posts;

    res.json(filtered);
  } catch {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Publish Now (for draft/failed posts)
router.post('/:id/publish', async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const post = await prisma.post.findFirst({ where: { id, userId: req.userId } });
    if (!post) return res.status(404).json({ error: 'Post not found' });

    await publishPost(id);
    res.json({ message: 'Published successfully' });
  } catch (err: any) {
    const msg = err.response?.data?.error?.message || err.message;
    res.status(500).json({ error: msg || 'Failed to publish' });
  }
});

// Delete Post
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const id = String(req.params.id);
    const post = await prisma.post.findFirst({ where: { id, userId: req.userId } });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    await prisma.post.delete({ where: { id } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;
