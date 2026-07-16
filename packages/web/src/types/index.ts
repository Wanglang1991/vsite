export interface VideoQuality {
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
