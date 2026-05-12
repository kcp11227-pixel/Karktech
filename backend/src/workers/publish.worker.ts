import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import IORedis from 'ioredis';

const prisma = new PrismaClient();

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

export const publishWorker = new Worker('publishQueue', async job => {
  const { postId } = job.data;
  
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { page: true }
  });

  if (!post || !post.page) {
    throw new Error('Post or Page not found');
  }

  try {
    const payload: any = {
      message: post.content || '',
      access_token: post.page.accessToken,
    };

    if (post.link) {
      payload.link = post.link;
    }

    // Graph API request to post to the feed
    const response = await axios.post(`https://graph.facebook.com/v19.0/${post.page.pageId}/feed`, payload);

    const fbPostId = response.data.id;

    await prisma.post.update({
      where: { id: postId },
      data: {
        status: 'PUBLISHED',
        fbPostId,
        publishedAt: new Date()
      }
    });

    await prisma.publishLog.create({
      data: {
        postId,
        status: 'SUCCESS',
        message: `Published successfully: ${fbPostId}`
      }
    });

    return { fbPostId };

  } catch (error: any) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    
    await prisma.post.update({
      where: { id: postId },
      data: { status: 'FAILED' }
    });

    await prisma.publishLog.create({
      data: {
        postId,
        status: 'FAILED',
        message: errorMsg
      }
    });

    throw new Error(errorMsg);
  }
}, { 
  connection,
  concurrency: 5
});

publishWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error ${err.message}`);
});
