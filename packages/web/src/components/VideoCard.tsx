'use client';

import { formatDuration, formatViews } from '@/lib/api';
import type { VideoItem } from '@/types';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function VideoCard({ video }: { video: VideoItem }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link href={'/video/' + video.id} className="group block">
      {/* Thumbnail */}
      <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-800">
        {imgError || !video.thumbnail ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <AlertTriangle className="absolute top-2 right-2 w-4 h-4 text-yellow-500/70" />
          </div>
        ) : (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
        {/* Duration overlay */}
        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-white text-xs rounded">
          {formatDuration(video.duration)}
        </span>
      </div>

      {/* Info */}
      <div className="mt-2 flex gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-600 shrink-0 flex items-center justify-center text-xs">
          {video.author.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-gray-100 line-clamp-2 leading-snug group-hover:text-brand-blue transition">
            {video.title}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">{video.author.name}</p>
          <p className="text-xs text-gray-500">
            {formatViews(video.views)}&nbsp;&nbsp;{video.resolution}
          </p>
        </div>
      </div>
    </Link>
  );
}