import { config } from '../config.js';
import { getCache, setCache } from './cache.js';
import type { VideoItem } from '../types.js';

const BASE = 'https://www.googleapis.com/youtube/v3';

interface YTSearchItem {
  id: { videoId: string };
  snippet: {
    title: string; description: string;
    thumbnails: { high: { url: string } };
    channelTitle: string;
    publishedAt: string;
    tags?: string[];
  };
}

type VideoResult = { videos: VideoItem[]; total: number; nextPageToken?: string };

export async function fetchYouTubeVideos(query: string, page = 1, perPage = 20): Promise<VideoResult> {
  const cacheKey = 'youtube:' + query + ':' + page + ':' + perPage;
  const cached = getCache<VideoResult>(cacheKey);
  if (cached) return cached;

  if (!config.youtubeApiKey) return { videos: [], total: 0 };

  const params = new URLSearchParams({
    part: 'snippet',
    q: query || 'trending',
    type: 'video',
    maxResults: String(perPage),
    key: config.youtubeApiKey,
  });

  const res = await fetch(BASE + '/search?' + params.toString());
  if (!res.ok) return { videos: [], total: 0 };

  const data = await res.json() as { items: YTSearchItem[]; pageInfo: { totalResults: number }; nextPageToken?: string };

  const videoIds = (data.items || []).map(i => i.id.videoId).join(',');
  let durations: Record<string, number> = {};
  if (videoIds) {
    const detailParams = new URLSearchParams({
      part: 'contentDetails',
      id: videoIds,
      key: config.youtubeApiKey,
    });
    const detailRes = await fetch(BASE + '/videos?' + detailParams.toString());
    if (detailRes.ok) {
      const detailData = await detailRes.json() as { items: { id: string; contentDetails: { duration: string } }[] };
      for (const item of (detailData.items || [])) {
        durations[item.id] = parseISO8601Duration(item.contentDetails.duration);
      }
    }
  }

  const videos: VideoItem[] = (data.items || []).map(item => ({
    id: 'youtube-' + item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails.high.url,
    duration: durations[item.id.videoId] || 0,
    views: 0, likes: 0,
    source: 'youtube' as const,
    url: '',
    author: { name: item.snippet.channelTitle, avatar: '' },
    tags: item.snippet.tags || [],
    category: 'entertainment',
    resolution: '1080p',
    createdAt: item.snippet.publishedAt,
  }));

  const result: VideoResult = { videos, total: data.pageInfo?.totalResults || 0, nextPageToken: data.nextPageToken };
  setCache(cacheKey, result, config.cacheTtlMs);
  return result;
}

function parseISO8601Duration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  return hours * 3600 + minutes * 60 + seconds;
}