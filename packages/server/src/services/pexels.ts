import { config } from '../config.js';
import { getCache, setCache, shouldRefresh, markRefreshing, refreshDone } from './cache.js';
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

async function doFetch(query: string, page: number, perPage: number): Promise<VideoResult> {
  const url = query
    ? BASE + '/search?query=' + encodeURIComponent(query) + '&page=' + page + '&per_page=' + perPage
    : BASE + '/popular?page=' + page + '&per_page=' + perPage;

  const res = await fetch(url, { headers: { Authorization: config.pexelsApiKey } });
  if (!res.ok) return { videos: [], total: 0 };

  const data = await res.json() as { videos: PexelsVideo[]; total_results: number };
  const videos: VideoItem[] = (data.videos || []).map(mapPexelsVideo);
  return { videos, total: data.total_results || 0 };
}

export async function fetchPexelsVideos(query: string, page = 1, perPage = 20): Promise<VideoResult> {
  if (!config.pexelsApiKey) return { videos: [], total: 0 };

  const cacheKey = 'pexels:' + query + ':' + page + ':' + perPage;

  // 1. 有缓存直接返回，同时触发后台刷新
  const cached = getCache<VideoResult>(cacheKey);
  if (cached) {
    if (cached.stale && shouldRefresh(cacheKey)) {
      markRefreshing(cacheKey);
      doFetch(query, page, perPage).then(data => refreshDone(cacheKey, data));
    }
    return cached.data;
  }

  // 2. 无缓存，同步拉取
  const data = await doFetch(query, page, perPage);
  setCache(cacheKey, data);
  return data;
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