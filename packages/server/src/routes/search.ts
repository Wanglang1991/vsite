import type { FastifyInstance } from 'fastify';
import { fetchPexelsVideos } from '../services/pexels.js';
import { fetchPixabayVideos } from '../services/pixabay.js';
import { fetchYouTubeVideos } from '../services/youtube.js';
import { videoCache } from '../services/videoCache.js';
import type { VideoItem } from '../types.js';

export async function searchRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { q: string; page?: string } }>('/api/search', async (req, reply) => {
    const q = req.query.q?.trim();
    if (!q) return reply.status(400).send({ error: 'Query required' });

    const page = Number(req.query.page) || 1;
    const [pexels, pixabay, youtube] = await Promise.all([
      fetchPexelsVideos(q, page, 20).catch(() => ({ videos: [] as VideoItem[], total: 0 })),
      fetchPixabayVideos(q, page, 20).catch(() => ({ videos: [] as VideoItem[], total: 0 })),
      fetchYouTubeVideos(q, page, 20).catch(() => ({ videos: [] as VideoItem[], total: 0 })),
    ]);

    videoCache.setAll(pexels.videos);
    videoCache.setAll(pixabay.videos);
    videoCache.setAll(youtube.videos);

    const all = [...pexels.videos, ...pixabay.videos, ...youtube.videos];
    return {
      videos: all, page, perPage: 20,
      total: pexels.total + pixabay.total + youtube.total,
      hasMore: page * 20 < (pexels.total + pixabay.total + youtube.total),
    };
  });
}