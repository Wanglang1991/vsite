const fs = require("fs");
const base = "C:/Users/Administrator/Documents/Codex/2026-07-16/new-chat";

// --- Server types ---
const serverTypes = `export interface VideoQuality {
  label: string;
  src: string;
  width: number;
  height: number;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  views: number;
  likes: number;
  source: 'pexels' | 'pixabay' | 'youtube' | 'tmdb';
  url: string;
  qualities: VideoQuality[];
  author: {
    name: string;
    avatar: string;
  };
  tags: string[];
  category: string;
  resolution: string;
  createdAt: string;
}

export interface VideoListResponse {
  videos: VideoItem[];
  page: number;
  perPage: number;
  total: number;
  hasMore: boolean;
}

export interface CategoryInfo {
  id: string;
  name: string;
  icon: string;
  count: number;
}
`;
fs.writeFileSync(base + "/packages/server/src/types.ts", serverTypes);

// --- Web types ---
const webTypes = `export interface VideoQuality {
  label: string;
  src: string;
  width: number;
  height: number;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: number;
  views: number;
  likes: number;
  source: string;
  url: string;
  qualities: VideoQuality[];
  author: { name: string; avatar: string };
  tags: string[];
  category: string;
  resolution: string;
  createdAt: string;
}

export interface VideoListResponse {
  videos: VideoItem[];
  page: number;
  perPage: number;
  total: number;
  hasMore: boolean;
}

export interface CategoryInfo {
  id: string;
  name: string;
  icon: string;
  count: number;
}
`;
fs.writeFileSync(base + "/packages/web/src/types/index.ts", webTypes);
console.log("Types updated");