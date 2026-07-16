'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { VideoItem } from '@/types';
import { getVideos, getCategoryVideos } from '@/lib/api';
import Navbar from '@/components/Navbar';
import CategoryBar from '@/components/CategoryBar';
import VideoGrid from '@/components/VideoGrid';

const CAT_STORAGE_KEY = 'vsite_last_cat';

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const catFromUrl = searchParams.get('cat');
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    if (catFromUrl || restored) return;
    try {
      const saved = sessionStorage.getItem(CAT_STORAGE_KEY);
      if (saved) {
        router.replace('/?cat=' + saved);
        setRestored(true);
        return;
      }
    } catch {}
    setRestored(true);
  }, [catFromUrl, restored, router]);

  useEffect(() => {
    setLoading(true);
    let cancelled = false;
    (async () => {
      const data = catFromUrl ? await getCategoryVideos(catFromUrl) : await getVideos();
      if (!cancelled) { setVideos(data.videos); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [catFromUrl]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16 max-w-screen-2xl mx-auto px-4">
        <div className="sticky top-16 z-40 bg-brand-darker pb-2 pt-2">
          <CategoryBar />
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-800 rounded-lg" />
                <div className="mt-2 flex gap-2"><div className="w-8 h-8 rounded-full bg-gray-800" /><div className="flex-1 space-y-1.5"><div className="h-3 bg-gray-800 rounded w-full" /><div className="h-2.5 bg-gray-800 rounded w-2/3" /></div></div>
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
      <div className="min-h-screen"><Navbar /><main className="pt-16"><div className="text-center text-gray-400 py-20">Loading...</div></main></div>
    }><HomeContent /></Suspense>
  );
}
