'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { VideoItem } from '@/types';
import { getVideos, getCategoryVideos, searchVideos } from '@/lib/api';
import Navbar from '@/components/Navbar';
import CategoryBar from '@/components/CategoryBar';
import VideoGrid from '@/components/VideoGrid';

function HomeContent() {
  const searchParams = useSearchParams();
  const cat = searchParams.get('cat');
  const q = searchParams.get('q');
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let cancelled = false;

    (async () => {
      let data;
      if (q) data = await searchVideos(q);
      else if (cat) data = await getCategoryVideos(cat);
      else data = await getVideos();
      if (!cancelled) {
        setVideos(data.videos);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [cat, q]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16 max-w-screen-2xl mx-auto px-4">
        {/* Category bar */}
        <div className="sticky top-16 z-40 bg-brand-darker pb-2 pt-2">
          <CategoryBar />
        </div>

        {/* Title */}
        {q && (
          <h2 className="text-lg font-medium text-gray-200 mb-4">
            搜索结果: {q}
          </h2>
        )}
        {cat && (
          <h2 className="text-lg font-medium text-gray-200 mb-4">
            分类浏览
          </h2>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-800 rounded-lg" />
                <div className="mt-2 flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-800" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-800 rounded w-full" />
                    <div className="h-2.5 bg-gray-800 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <VideoGrid videos={videos} />
        )}
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-16"><div className="text-center text-gray-400 py-20">Loading...</div></main>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}