'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, Calendar } from 'lucide-react';
import type { VideoItem } from '@/types';
import { getVideoById, formatViews } from '@/lib/api';
import VideoPlayer from '@/components/VideoPlayer';
import type { VideoPlayerHandle } from '@/components/VideoPlayer';

export default function VideoPage() {
  const params = useParams();
  const id = params.id as string;
  const [video, setVideo] = useState<VideoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [ambientUrl, setAmbientUrl] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const playerRef = useRef<VideoPlayerHandle>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    setLoading(true);
    getVideoById(id)
      .then(v => { setVideo(v); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  // Ambient mode
  const captureFrame = useCallback(() => {
    const v = playerRef.current?.video;
    const canvas = canvasRef.current;
    if (!v || !canvas || v.paused) {
      rafRef.current = requestAnimationFrame(captureFrame);
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = 160;
    canvas.height = 90;
    ctx.drawImage(v, 0, 0, 160, 90);
    setAmbientUrl(canvas.toDataURL('image/jpeg', 0.3));
    rafRef.current = requestAnimationFrame(captureFrame);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(captureFrame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [captureFrame]);

  // Pixabay toast on play
  const handlePlay = useCallback(() => {
    if (video?.source === 'pixabay') {
      setShowToast(true);
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setShowToast(false), 3000);
    }
  }, [video]);

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
          <Link href="/" className="text-brand-blue mt-4 inline-block hover:underline">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-darker relative overflow-x-hidden">
      {ambientUrl && (
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{
            backgroundImage: 'url(' + ambientUrl + ')',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(60px)',
            transform: 'scale(1.05)',
            opacity: 0.4,
          }}
        />
      )}

      <canvas ref={canvasRef} className="hidden" />

      <div className="relative z-10 max-w-screen-xl mx-auto px-4 py-6">
        <Link href="/" className="inline-flex items-center gap-1 text-gray-400 hover:text-white mb-4 transition">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">返回</span>
        </Link>

        <div className="max-w-4xl">
          <VideoPlayer ref={playerRef} src={video.url} poster={video.thumbnail} qualities={video.qualities} onPlay={handlePlay} />
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

      {showToast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg backdrop-blur-md shadow-lg">
          <span className="text-xs text-yellow-400">Pixabay多数可能为无声资源哦~</span>
          <button onClick={() => setShowToast(false)} className="text-yellow-400/60 hover:text-yellow-400 text-xs">✕</button>
        </div>
      )}
    </div>
  );
}