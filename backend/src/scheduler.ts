import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { publishPost } from './utils/publishPost';

const prisma = new PrismaClient();

export function startScheduler() {
  // Run every minute — check for posts due to be published
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const due = await prisma.post.findMany({
        where: {
          status: 'SCHEDULED',
          scheduledFor: { lte: now },
        },
        include: { page: true },
      });

      if (due.length === 0) return;

      console.log(`[Scheduler] ${due.length} post(s) due for publishing`);

      for (const post of due) {
        try {
          // Mark as processing to avoid double-publish
          await prisma.post.update({
            where: { id: post.id },
            data: { status: 'PUBLISHING' as any },
          });

          await publishPost(post.id, (post as any).firstComment || undefined);
          console.log(`[Scheduler] Published post ${post.id} to page ${post.page?.name}`);
        } catch (err: any) {
          console.error(`[Scheduler] Failed to publish post ${post.id}:`, err?.response?.data || err?.message);
          await prisma.post.update({
            where: { id: post.id },
            data: { status: 'FAILED' },
          });
          await prisma.publishLog.create({
            data: {
              postId: post.id,
              status: 'FAILED',
              message: err?.response?.data?.error?.message || err?.message || 'Scheduler publish failed',
            },
          });
        }
      }
    } catch (err: any) {
      console.error('[Scheduler] Error:', err?.message);
    }
  });

  console.log('[Scheduler] Started — checking every minute for scheduled posts');
}
