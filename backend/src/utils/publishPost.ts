import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function publishPost(postId: string, firstComment?: string): Promise<string> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { page: true },
  });

  if (!post || !post.page) throw new Error('Post or page not found');

  const pageToken = post.page.accessToken;
  const pageId = post.page.pageId;

  let fbPostId: string;

  if (post.imageUrl) {
    const localPath = imageUrlToLocalPath(post.imageUrl);
    if (localPath && fs.existsSync(localPath)) {
      // Upload photo via multipart
      const form = new FormData();
      form.append('source', fs.createReadStream(localPath));
      form.append('message', post.content || '');
      if (post.link) form.append('link', post.link);
      form.append('access_token', pageToken);
      const photoRes = await axios.post(
        `https://graph.facebook.com/v19.0/${pageId}/photos`,
        form,
        { headers: form.getHeaders() },
      );
      fbPostId = photoRes.data.post_id || photoRes.data.id;
    } else {
      // Remote image URL — use url parameter
      const photoRes = await axios.post(`https://graph.facebook.com/v19.0/${pageId}/photos`, null, {
        params: {
          url: post.imageUrl,
          message: post.content || '',
          access_token: pageToken,
        },
      });
      fbPostId = photoRes.data.post_id || photoRes.data.id;
    }
  } else {
    const payload: Record<string, string> = {
      message: post.content || '',
      access_token: pageToken,
    };
    if (post.link) payload.link = post.link;
    const feedRes = await axios.post(`https://graph.facebook.com/v19.0/${pageId}/feed`, payload);
    fbPostId = feedRes.data.id;
  }

  await prisma.post.update({
    where: { id: postId },
    data: { status: 'PUBLISHED', fbPostId, publishedAt: new Date() },
  });

  await prisma.publishLog.create({
    data: { postId, status: 'SUCCESS', message: `Published: ${fbPostId}` },
  });

  // Post first comment if provided
  if (firstComment?.trim() && fbPostId) {
    try {
      await axios.post(`https://graph.facebook.com/v19.0/${fbPostId}/comments`, null, {
        params: { message: firstComment.trim(), access_token: pageToken },
      });
    } catch (commentErr: any) {
      console.warn('First comment failed:', commentErr.response?.data || commentErr.message);
    }
  }

  return fbPostId;
}

function imageUrlToLocalPath(url: string): string | null {
  try {
    const u = new URL(url);
    const filename = path.basename(u.pathname);
    return path.join(__dirname, '..', '..', 'uploads', filename);
  } catch {
    return null;
  }
}
