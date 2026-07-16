'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

function getBackHref(): string {
  try {
    const cat = sessionStorage.getItem('vsite_last_cat');
    if (cat) return '/?cat=' + cat;
  } catch {}
  return '/';
}
import { ArrowLeft, Eye, Calendar } from 'lucide-react';
import type { VideoItem } from '@/types';
import { getVideoById, formatViews } from '@/lib/api';
import VideoPlayer from '@/components/VideoPlayer';

export default function VideoPage() {
  const params = useParams();
  const id = params.id as string;
  const [video, setVideo] = useState<VideoItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getVideoById(id)
      .then(v => { setVideo(v); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-4xl">
          <div className="aspect-video bg-gray-800 rounded-lg" />
          <div className="h-6 bg-gray-800 rounded w-2/3" />
          <div className="h-4 bg-gray-800 rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-400">视频未找到</p>
          <Link href={getBackHref()} className="text-brand-blue mt-4 inline-block hover:underline">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-darker">
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <Link href={getBackHref()} className="inline-flex items-center gap-1 text-gray-400 hover:text-white mb-4 transition">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">返回</span>
        </Link>

        <div className="max-w-4xl">
          <VideoPlayer src={video.url} poster={video.thumbnail} qualities={video.qualities} />
          <h1 className="text-xl font-semibold text-white mt-4">{video.title}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" /> {formatViews(video.views)} 次观看
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" /> {new Date(video.createdAt).toLocaleDateString('zh-CN')}
            </span>
            <span className="bg-white/5 px-2 py-0.5 rounded text-xs">{video.resolution}</span>
            <span className="bg-brand-blue/20 px-2 py-0.5 rounded text-xs text-brand-blue">{video.source}</span>
          </div>

          <div className="mt-4 p-4 bg-white/5 rounded-lg">
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
              {video.description || '暂无描述'}
            </p>
            {video.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {video.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-xs rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}