import { config } from '../config.js';
import { getCache, setCache } from './cache.js';
import type { VideoItem } from '../types.js';

const BASE = 'https://api.pexels.com/videos';

interface PexelsVideo {
  id: number;
  width: number; height: number; duration: number;
  url: string; image: string;
  video_files: { link: string; quality: string; width: number; height: number }[];
  user: { name: string; url: string };
}

type VideoResult = { videos: VideoItem[]; total: number };

export async function fetchPexelsVideos(query: string, page = 1, perPage = 20): Promise<VideoResult> {
  const cacheKey = 'pexels:' + query + ':' + page + ':' + perPage;
  const cached = getCache<VideoResult>(cacheKey);
  if (cached) return cached;

  if (!config.pexelsApiKey) return { videos: [], total: 0 };

  const url = query
    ? BASE + '/search?query=' + encodeURIComponent(query) + '&page=' + page + '&per_page=' + perPage
    : BASE + '/popular?page=' + page + '&per_page=' + perPage;

  const res = await fetch(url, { headers: { Authorization: config.pexelsApiKey } });
  if (!res.ok) return { videos: [], total: 0 };

  const data = await res.json() as { videos: PexelsVideo[]; total_results: number };
  const videos: VideoItem[] = (data.videos || []).map(mapPexelsVideo);
  const result: VideoResult = { videos, total: data.total_results || 0 };
  setCache(cacheKey, result, config.cacheTtlMs);
  return result;
}

function mapPexelsVideo(v: PexelsVideo): VideoItem {
  const bestFile = v.video_files.find(f => f.quality === 'hd') || v.video_files[0];
  return {
    id: 'pexels-' + v.id,
    title: v.url.split('/').pop()?.split('-').slice(0, -1).join(' ') || 'Untitled',
    description: 'By ' + v.user.name,
    thumbnail: v.image,
    duration: v.duration,
    views: 0, likes: 0,
    source: 'pexels',
    url: bestFile?.link || v.url,
    author: { name: v.user.name, avatar: '' },
    tags: [],
    category: 'stock',
    resolution: bestFile ? bestFile.height + 'p' : '720p',
    createdAt: new Date().toISOString(),
  };
}