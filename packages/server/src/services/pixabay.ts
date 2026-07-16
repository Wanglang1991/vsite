import { config } from '../config.js';
import { getCache, setCache } from './cache.js';
import type { VideoItem } from '../types.js';

const BASE = 'https://pixabay.com/api/videos/';

interface PixabayVideo {
  id: number;
  pageURL: string;
  tags: string;
  duration: number;
  picture_id: string;
  videos: Record<string, { url: string; width: number; height: number; size: number }>;
  views: number;
  downloads: number;
  likes: number;
  user: string;
  userImageURL: string;
}

type VideoResult = { videos: VideoItem[]; total: number };

export async function fetchPixabayVideos(query: string, page = 1, perPage = 20): Promise<VideoResult> {
  const cacheKey = 'pixabay:' + query + ':' + page + ':' + perPage;
  const cached = getCache<VideoResult>(cacheKey);
  if (cached) return cached;

  if (!config.pixabayApiKey) return { videos: [], total: 0 };

  const params = new URLSearchParams({
    key: config.pixabayApiKey,
    q: query || 'nature',
    page: String(page),
    per_page: String(perPage),
  });

  const res = await fetch(BASE + '?' + params.toString());
  if (!res.ok) return { videos: [], total: 0 };

  const data = await res.json() as { hits: PixabayVideo[]; total: number };
  const videos: VideoItem[] = (data.hits || []).map(mapPixabayVideo);
  const result: VideoResult = { videos, total: data.total || 0 };
  setCache(cacheKey, result, config.cacheTtlMs);
  return result;
}

function mapPixabayVideo(v: PixabayVideo): VideoItem {
  const qualities = ['large', 'medium', 'small'];
  let bestFile = null;
  for (const q of qualities) {
    if (v.videos[q]) { bestFile = v.videos[q]; break; }
  }
  return {
    id: 'pixabay-' + v.id,
    title: v.tags.split(',')[0]?.trim() || 'Untitled',
    description: v.tags,
    thumbnail: 'https://i.vimeocdn.com/video/' + v.picture_id + '_640x360.jpg',
    duration: v.duration,
    views: v.views, likes: v.likes,
    source: 'pixabay',
    url: bestFile?.url || '',
    author: { name: v.user, avatar: v.userImageURL || '' },
    tags: v.tags.split(',').map(t => t.trim()),
    category: 'stock',
    resolution: bestFile ? bestFile.height + 'p' : '720p',
    createdAt: new Date().toISOString(),
  };
}