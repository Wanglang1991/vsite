import type { FastifyInstance } from 'fastify';
import { fetchPexelsVideos } from '../services/pexels.js';
import { fetchPixabayVideos } from '../services/pixabay.js';
import { fetchYouTubeVideos } from '../services/youtube.js';
import { videoCache } from '../services/videoCache.js';
import type { VideoItem, VideoListResponse } from '../types.js';

function mergeAndShuffle(arrays: VideoItem[][]): VideoItem[] {
  const merged = arrays.flat();
  for (let i = merged.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [merged[i], merged[j]] = [merged[j], merged[i]];
  }
  return merged;
}

export async function videoRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { page?: string; perPage?: string; q?: string } }>('/api/videos', async (req) => {
    const page = Number(req.query.page) || 1;
    const perPage = Math.min(Number(req.query.perPage) || 24, 50);
    const q = req.query.q || '';

    const [pexels, pixabay, youtube] = await Promise.all([
      fetchPexelsVideos(q, page, perPage).catch(() => ({ videos: [] as VideoItem[], total: 0 })),
      fetchPixabayVideos(q, page, perPage).catch(() => ({ videos: [] as VideoItem[], total: 0 })),
      fetchYouTubeVideos(q, page, perPage).catch(() => ({ videos: [] as VideoItem[], total: 0 })),
    ]);

    videoCache.setAll(pexels.videos);
    videoCache.setAll(pixabay.videos);
    videoCache.setAll(youtube.videos);

    const all = mergeAndShuffle([pexels.videos, pixabay.videos, youtube.videos]);
    const total = pexels.total + pixabay.total + youtube.total;

    const response: VideoListResponse = {
      videos: all,
      page,
      perPage,
      total,
      hasMore: page * perPage < total,
    };
    return response;
  });

  app.get<{ Params: { id: string } }>('/api/videos/:id', async (req, reply) => {
    const { id } = req.params;

    let video = videoCache.get(id);
    if (video) return video;

    const [pexels, pixabay, youtube] = await Promise.all([
      fetchPexelsVideos('', 1, 50).catch(() => ({ videos: [] as VideoItem[], total: 0 })),
      fetchPixabayVideos('', 1, 50).catch(() => ({ videos: [] as VideoItem[], total: 0 })),
      fetchYouTubeVideos('', 1, 50).catch(() => ({ videos: [] as VideoItem[], total: 0 })),
    ]);

    videoCache.setAll(pexels.videos);
    videoCache.setAll(pixabay.videos);
    videoCache.setAll(youtube.videos);

    video = videoCache.get(id);
    if (!video) return reply.status(404).send({ error: 'Video not found' });
    return video;
  });
}