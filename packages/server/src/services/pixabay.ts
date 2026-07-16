import { config } from '../config.js';
import { getCache, setCache, shouldRefresh, markRefreshing, refreshDone } from './cache.js';
import type { VideoItem, VideoQuality } from '../types.js';

const BASE = 'https://pixabay.com/api/videos/';

interface PixabayVideo {
  id: number; tags: string; duration: number;
  videos: Record<string, {
    url: string; width: number; height: number; size: number;
    thumbnail: string;
  }>;
  views: number; likes: number;
  user: string; userImageURL: string;
}

type VideoResult = { videos: VideoItem[]; total: number };

async function doFetch(query: string, page: number, perPage: number): Promise<VideoResult> {
  const safePerPage = Math.max(3, perPage);
  const params = new URLSearchParams({
    key: config.pixabayApiKey,
    q: query || 'nature',
    page: String(page),
    per_page: String(safePerPage),
  });

  const res = await fetch(BASE + '?' + params.toString());
  if (!res.ok) return { videos: [], total: 0 };
  const data = await res.json() as { hits: PixabayVideo[]; total: number };
  const videos: VideoItem[] = (data.hits || []).slice(0, perPage).map(mapPixabayVideo);
  return { videos, total: data.total || 0 };
}

export async function fetchPixabayVideos(query: string, page = 1, perPage = 20): Promise<VideoResult> {
  if (!config.pixabayApiKey) return { videos: [], total: 0 };

  const cacheKey = 'pixabay:' + query + ':' + page + ':' + perPage;

  const cached = getCache<VideoResult>(cacheKey);
  if (cached) {
    if (cached.stale && shouldRefresh(cacheKey)) {
      markRefreshing(cacheKey);
      doFetch(query, page, perPage).then(data => refreshDone(cacheKey, data));
    }
    return cached.data;
  }

  const data = await doFetch(query, page, perPage);
  setCache(cacheKey, data);
  return data;
}

const QUALITY_ORDER = ['large', 'medium', 'small', 'tiny'] as const;
const QUALITY_LABELS: Record<string, string> = {
  large: '2160p', medium: '1440p', small: '1080p', tiny: '720p'
};

function mapPixabayVideo(v: PixabayVideo): VideoItem {
  const qualities: VideoQuality[] = [];
  let best: { url: string; width: number; height: number; thumbnail: string } | null = null;

  for (const q of QUALITY_ORDER) {
    const file = v.videos[q];
    if (file) {
      qualities.push({
        label: QUALITY_LABELS[q] || q,
        src: file.url,
        width: file.width,
        height: file.height,
      });
      if (!best) best = file;
    }
  }

  return {
    id: 'pixabay-' + v.id,
    title: v.tags.split(',')[0]?.trim() || 'Untitled',
    description: v.tags,
    thumbnail: best?.thumbnail || '',
    duration: v.duration,
    views: v.views, likes: v.likes,
    source: 'pixabay',
    url: qualities[0]?.src || '',
    qualities,
    author: { name: v.user, avatar: v.userImageURL || '' },
    tags: v.tags.split(',').map(t => t.trim()),
    category: 'stock',
    resolution: qualities[0]?.label || '720p',
    createdAt: new Date().toISOString(),
  };
}