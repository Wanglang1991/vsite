import type { VideoItem } from './types.js';

class VideoCache {
  private cache = new Map<string, VideoItem>();
  private maxSize: number;

  constructor(maxSize = 5000) {
    this.maxSize = maxSize;
  }

  set(video: VideoItem): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(video.id, video);
  }

  setAll(videos: VideoItem[]): void {
    for (const v of videos) this.set(v);
  }

  get(id: string): VideoItem | undefined {
    return this.cache.get(id);
  }

  get size(): number { return this.cache.size; }
}

export const videoCache = new VideoCache();