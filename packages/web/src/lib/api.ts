import type { VideoItem, VideoListResponse, CategoryInfo } from '@/types';

const API_BASE = '/api';

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getVideos(params?: { page?: number; perPage?: number; q?: string }): Promise<VideoListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.perPage) searchParams.set('perPage', String(params.perPage));
  if (params?.q) searchParams.set('q', params.q);
  const qs = searchParams.toString();
  return fetcher<VideoListResponse>('/videos' + (qs ? '?' + qs : ''));
}

export async function getVideoById(id: string): Promise<VideoItem> {
  return fetcher<VideoItem>('/videos/' + encodeURIComponent(id));
}

export async function searchVideos(q: string, page?: number): Promise<VideoListResponse> {
  const p = page ? '&page=' + page : '';
  return fetcher<VideoListResponse>('/search?q=' + encodeURIComponent(q) + p);
}

export async function getCategories(): Promise<{ categories: CategoryInfo[] }> {
  return fetcher<{ categories: CategoryInfo[] }>('/categories');
}

export async function getCategoryVideos(id: string, page?: number): Promise<VideoListResponse> {
  const p = page ? '?page=' + page : '';
  return fetcher<VideoListResponse>('/categories/' + id + p);
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  return m + ':' + String(s).padStart(2, '0');
}

export function formatViews(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + '万';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}