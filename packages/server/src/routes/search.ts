import type { FastifyInstance } from 'fastify';
import { fetchPexelsVideos } from '../services/pexels.js';
import { fetchPixabayVideos } from '../services/pixabay.js';
import { fetchYouTubeVideos } from '../services/youtube.js';
import { videoCache } from '../services/videoCache.js';
import type { VideoItem } from '../types.js';

const MAX_SEARCH_RESULTS = 1000;

export async function searchRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { q: string; page?: string } }>('/api/search', async (req, reply) => {
    const q = req.query.q?.trim();
    if (!q) return reply.status(400).send({ error: 'Query required' });

    const page = Number(req.query.page) || 1;
    const perPage = 20;
    const cappedOffset = (page - 1) * perPage;
    if (cappedOffset >= MAX_SEARCH_RESULTS) {
      return { videos: [], page, perPage, total: MAX_SEARCH_RESULTS, hasMore: false };
    }

    const fetchPerPage = Math.min(perPage, MAX_SEARCH_RESULTS - cappedOffset);

    const [pexels, pixabay, youtube] = await Promise.all([
      fetchPexelsVideos(q, page, fetchPerPage).catch(() => ({ videos: [] as VideoItem[], total: 0 })),
      fetchPixabayVideos(q, page, fetchPerPage).catch(() => ({ videos: [] as VideoItem[], total: 0 })),
      fetchYouTubeVideos(q, page, fetchPerPage).catch(() => ({ videos: [] as VideoItem[], total: 0 })),
    ]);

    videoCache.setAll(pexels.videos);
    videoCache.setAll(pixabay.videos);
    videoCache.setAll(youtube.videos);

    const all = [...pexels.videos, ...pixabay.videos, ...youtube.videos];
    const rawTotal = pexels.total + pixabay.total + youtube.total;
    const cappedTotal = Math.min(rawTotal, MAX_SEARCH_RESULTS);
    const loadedSoFar = page * perPage;

    return {
      videos: all, page, perPage,
      total: cappedTotal,
      hasMore: loadedSoFar < cappedTotal && all.length > 0,
    };
  });
}