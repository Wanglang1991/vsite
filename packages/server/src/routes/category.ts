import type { FastifyInstance } from 'fastify';
import { fetchPexelsVideos } from '../services/pexels.js';
import { fetchPixabayVideos } from '../services/pixabay.js';
import { fetchYouTubeVideos } from '../services/youtube.js';
import { videoCache } from '../services/videoCache.js';
import type { VideoItem, CategoryInfo } from '../types.js';

const CATEGORIES: { id: string; name: string; query: string }[] = [
  { id: 'animation', name: '动画', query: 'animation' },
  { id: 'music', name: '音乐', query: 'music' },
  { id: 'game', name: '游戏', query: 'gaming' },
  { id: 'sports', name: '运动', query: 'sports' },
  { id: 'tech', name: '科技', query: 'technology' },
  { id: 'nature', name: '自然', query: 'nature' },
  { id: 'travel', name: '旅行', query: 'travel' },
  { id: 'food', name: '美食', query: 'food' },
  { id: 'film', name: '影视', query: 'movie trailer' },
  { id: 'fashion', name: '时尚', query: 'fashion' },
];

const MAX_PER_CATEGORY = 500;

export async function categoryRoutes(app: FastifyInstance) {
  app.get('/api/categories', async () => {
    const categories: CategoryInfo[] = CATEGORIES.map(c => ({ ...c, icon: '', count: 0 }));
    return { categories };
  });

  app.get<{ Params: { id: string }; Querystring: { page?: string } }>('/api/categories/:id', async (req, reply) => {
    const category = CATEGORIES.find(c => c.id === req.params.id);
    if (!category) return reply.status(404).send({ error: 'Category not found' });

    const page = Number(req.query.page) || 1;
    const perPage = 20;
    const cappedOffset = (page - 1) * perPage;
    if (cappedOffset >= MAX_PER_CATEGORY) {
      return { videos: [], page, perPage, total: MAX_PER_CATEGORY, hasMore: false };
    }

    const fetchPerPage = Math.min(perPage, MAX_PER_CATEGORY - cappedOffset);

    const [pexels, pixabay, youtube] = await Promise.all([
      fetchPexelsVideos(category.query, page, fetchPerPage).catch(() => ({ videos: [] as VideoItem[], total: 0 })),
      fetchPixabayVideos(category.query, page, fetchPerPage).catch(() => ({ videos: [] as VideoItem[], total: 0 })),
      fetchYouTubeVideos(category.query, page, fetchPerPage).catch(() => ({ videos: [] as VideoItem[], total: 0 })),
    ]);

    videoCache.setAll(pexels.videos);
    videoCache.setAll(pixabay.videos);
    videoCache.setAll(youtube.videos);

    const all = [...pexels.videos, ...pixabay.videos, ...youtube.videos];
    const rawTotal = pexels.total + pixabay.total + youtube.total;
    const cappedTotal = Math.min(rawTotal, MAX_PER_CATEGORY);
    const loadedSoFar = page * perPage;

    return {
      videos: all, page, perPage,
      total: cappedTotal,
      hasMore: loadedSoFar < cappedTotal && all.length > 0,
    };
  });
}