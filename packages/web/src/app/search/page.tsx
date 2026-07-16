'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import type { VideoItem } from '@/types';
import { searchVideos } from '@/lib/api';
import VideoGrid from '@/components/VideoGrid';

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    let cancelled = false;
    searchVideos(q).then(data => {
      if (!cancelled) { setVideos(data.videos); setTotal(data.total); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [q]);

  return (
    <div className="min-h-screen bg-brand-darker">
      <div className="sticky top-0 z-40 bg-brand-dark/95 backdrop-blur border-b border-white/10">
        <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/" className="shrink-0 p-1.5 hover:bg-white/10 rounded-full transition"><ArrowLeft className="w-5 h-5 text-gray-300" /></Link>
          <div className="flex-1 flex items-center gap-2"><Search className="w-4 h-4 text-gray-400 shrink-0" /><h1 className="text-lg font-medium text-white truncate">{q}</h1></div>
          {!loading && <span className="text-sm text-gray-500 shrink-0">共 {total} 个结果</span>}
        </div>
      </div>
      <main className="max-w-screen-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-800 rounded-lg" />
                <div className="mt-2 flex gap-2"><div className="w-8 h-8 rounded-full bg-gray-800" /><div className="flex-1 space-y-1.5"><div className="h-3 bg-gray-800 rounded w-full" /><div className="h-2.5 bg-gray-800 rounded w-2/3" /></div></div>
              </div>
            ))}
          </div>
        ) : videos.length > 0 ? <VideoGrid videos={videos} /> : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Search className="w-12 h-12 mb-4 text-gray-600" />
            <p className="text-lg">未找到 &ldquo;{q}&rdquo; 的相关视频</p>
            <p className="text-sm mt-1">请尝试其他关键词</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return <Suspense fallback={<div className="min-h-screen bg-brand-darker flex items-center justify-center"><div className="text-gray-400">Loading...</div></div>}><SearchContent /></Suspense>;
}
