const fs = require("fs");
const base = "C:/Users/Administrator/Documents/Codex/2026-07-16/new-chat/packages/server/src/services";

// Fix Pixabay service to include qualities
const pixabay = `import { config } from '../config.js';
import { getCache, setCache } from './cache.js';
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

export async function fetchPixabayVideos(query: string, page = 1, perPage = 20): Promise<VideoResult> {
  const cacheKey = 'pixabay:' + query + ':' + page + ':' + perPage;
  const cached = getCache<VideoResult>(cacheKey);
  if (cached) return cached;

  if (!config.pixabayApiKey) return { videos: [], total: 0 };

  const safePerPage = Math.max(3, perPage);
  const params = new URLSearchParams({
    key: config.pixabayApiKey,
    q: query || 'nature',
    page: String(page),
    per_page: String(safePerPage),
  });

  try {
    const res = await fetch(BASE + '?' + params.toString());
    if (!res.ok) return { videos: [], total: 0 };
    const data = await res.json() as { hits: PixabayVideo[]; total: number };
    const videos: VideoItem[] = (data.hits || []).slice(0, perPage).map(mapPixabayVideo);
    const result: VideoResult = { videos, total: data.total || 0 };
    setCache(cacheKey, result, config.cacheTtlMs);
    return result;
  } catch {
    return { videos: [], total: 0 };
  }
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
`;
fs.writeFileSync(base + "/pixabay.ts", pixabay);
console.log("Pixabay updated");

// Also fix Pexels to include qualities
const pexels = `import { config } from '../config.js';
import { getCache, setCache } from './cache.js';
import type { VideoItem, VideoQuality } from '../types.js';

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
  const qualities: VideoQuality[] = v.video_files.map(f => ({
    label: f.quality,
    src: f.link,
    width: f.width,
    height: f.height,
  }));
  const hd = v.video_files.find(f => f.quality === 'hd') || v.video_files[0];

  return {
    id: 'pexels-' + v.id,
    title: v.url.split('/').pop()?.split('-').slice(0, -1).join(' ') || 'Untitled',
    description: 'By ' + v.user.name,
    thumbnail: v.image,
    duration: v.duration,
    views: 0, likes: 0,
    source: 'pexels',
    url: hd?.link || v.url,
    qualities,
    author: { name: v.user.name, avatar: '' },
    tags: [],
    category: 'stock',
    resolution: hd ? hd.height + 'p' : '720p',
    createdAt: new Date().toISOString(),
  };
}
`;
fs.writeFileSync(base + "/pexels.ts", pexels);
console.log("Pexels updated");