import type { FastifyInstance } from 'fastify';
import { fetchPexelsVideos } from '../services/pexels.js';
import { fetchPixabayVideos } from '../services/pixabay.js';
import { fetchYouTubeVideos } from '../services/youtube.js';
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

export async function categoryRoutes(app: FastifyInstance) {
  app.get('/api/categories', async () => {
    const categories: CategoryInfo[] = CATEGORIES.map(c => ({ ...c, icon: '', count: 0 }));
    return { categories };
  });

  app.get<{ Params: { id: string }; Querystring: { page?: string } }>('/api/categories/:id', async (req, reply) => {
    const category = CATEGORIES.find(c => c.id === req.params.id);
    if (!category) return reply.status(404).send({ error: 'Category not found' });

    const page = Number(req.query.page) || 1;
    const [pexels, pixabay, youtube] = await Promise.all([
      fetchPexelsVideos(category.query, page, 20).catch(() => ({ videos: [] as VideoItem[], total: 0 })),
      fetchPixabayVideos(category.query, page, 20).catch(() => ({ videos: [] as VideoItem[], total: 0 })),
      fetchYouTubeVideos(category.query, page, 20).catch(() => ({ videos: [] as VideoItem[], total: 0 })),
    ]);

    const all = [...pexels.videos, ...pixabay.videos, ...youtube.videos];
    return {
      videos: all, page, perPage: 20,
      total: pexels.total + pixabay.total + youtube.total,
      hasMore: page * 20 < (pexels.total + pixabay.total + youtube.total),
    };
  });
}