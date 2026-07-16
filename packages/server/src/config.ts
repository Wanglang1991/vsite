import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT) || 3001,
  host: process.env.HOST || '0.0.0.0',
  pexelsApiKey: process.env.PEXELS_API_KEY || '',
  pixabayApiKey: process.env.PIXABAY_API_KEY || '',
  youtubeApiKey: process.env.YOUTUBE_API_KEY || '',
  tmdbApiKey: process.env.TMDB_API_KEY || '',
  cacheTtlMs: 10 * 60 * 1000,
} as const;