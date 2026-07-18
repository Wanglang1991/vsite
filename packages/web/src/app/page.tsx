'use client';

import { useEffect, useState, Suspense, useRef, useLayoutEffect } from 'react';
import type { VideoItem } from '@/types';
import { getVideos, getCategoryVideos } from '@/lib/api';
import Navbar from '@/components/Navbar';
import CategoryBar from '@/components/CategoryBar';
import VideoGrid from '@/components/VideoGrid';
import { Loader2, ChevronUp } from 'lucide-react';

const CAT_STORAGE_KEY = 'vsite_last_cat';
const SCROLL_STORAGE_KEY = 'vsite_home_scroll';

function HomeContent() {
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [restored, setRestored] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const loadingMoreRef = useRef(false);
  const hasMoreRef = useRef(false);
  const pageRef = useRef(1);
  const activeCatRef = useRef<string | null>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const shouldRestoreScroll = useRef(false);

  useEffect(() => { activeCatRef.current = activeCat; }, [activeCat]);
  useEffect(() => { pageRef.current = page; }, [page]);
  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
  useEffect(() => { loadingMoreRef.current = loadingMore; }, [loadingMore]);

  // Restore category + mark scroll restore from sessionStorage on mount
  useLayoutEffect(() => {
    if (restored) return;
    try {
      const savedCat = sessionStorage.getItem(CAT_STORAGE_KEY);
      if (savedCat) setActiveCat(savedCat);
      const savedScroll = sessionStorage.getItem(SCROLL_STORAGE_KEY);
      if (savedScroll) shouldRestoreScroll.current = true;
    } catch {}
    setRestored(true);
  }, [restored]);

  // Persist to sessionStorage
  useEffect(() => {
    if (activeCat) {
      try { sessionStorage.setItem(CAT_STORAGE_KEY, activeCat); } catch {}
    } else {
      try { sessionStorage.removeItem(CAT_STORAGE_KEY); } catch {}
    }
  }, [activeCat]);

  // Fetch videos when category changes
  useEffect(() => {
    const ids = new Set<string>();
    seenIdsRef.current = ids;
    setLoading(true);
    setPage(1);
    setVideos([]);
    let cancelled = false;
    const fetchFn = activeCat
      ? () => getCategoryVideos(activeCat, 1)
      : () => getVideos({ page: 1, perPage: 24 });

    fetchFn().then(data => {
      if (!cancelled) {
        data.videos.forEach(v => ids.add(v.id));
        setVideos(data.videos);
        setHasMore(data.hasMore ?? false);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [activeCat]);

  // Restore scroll position after data loads
  useEffect(() => {
    if (loading || !shouldRestoreScroll.current) return;
    try {
      const saved = sessionStorage.getItem(SCROLL_STORAGE_KEY);
      if (saved) {
        window.scrollTo({ top: Number(saved), behavior: 'instant' as ScrollBehavior });
      }
    } catch {}
    shouldRestoreScroll.current = false;
  }, [loading]);

  // Infinite scroll + scroll position save + scroll-to-top visibility
  useEffect(() => {
    const loadMore = () => {
      if (loadingMoreRef.current || !hasMoreRef.current) return;
      const nextPage = pageRef.current + 1;
      loadingMoreRef.current = true;
      setLoadingMore(true);

      const fetchFn = activeCatRef.current
        ? () => getCategoryVideos(activeCatRef.current!, nextPage)
        : () => getVideos({ page: nextPage, perPage: 24 });

      fetchFn().then(data => {
        const newVideos = data.videos.filter(v => !seenIdsRef.current.has(v.id));
        newVideos.forEach(v => seenIdsRef.current.add(v.id));
        setVideos(prev => [...prev, ...newVideos]);
        setHasMore(data.hasMore ?? false);
        setPage(nextPage);
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }).catch(() => {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      });
    };

    let raf = 0;
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 300);

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        try { sessionStorage.setItem(SCROLL_STORAGE_KEY, String(window.scrollY)); } catch {}
      });

      const scrollBottom = window.innerHeight + window.scrollY;
      const docBottom = document.documentElement.scrollHeight;
      if (docBottom - scrollBottom < 300) {
        loadMore();
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const handleSelectCat = (catId: string | null) => {
    setActiveCat(catId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <main className="pt-16 max-w-screen-2xl mx-auto px-4">
        <div className="sticky top-16 z-40 bg-brand-darker pb-2 pt-2">
          <CategoryBar activeCat={activeCat} onSelect={handleSelectCat} />
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 mt-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-800 rounded-lg" />
                <div className="mt-2 flex gap-2"><div className="w-8 h-8 rounded-full bg-gray-800" /><div className="flex-1 space-y-1.5"><div className="h-3 bg-gray-800 rounded w-full" /><div className="h-2.5 bg-gray-800 rounded w-2/3" /></div></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <VideoGrid videos={videos} />
            {loadingMore && (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            )}
            {!hasMore && videos.length > 0 && (
              <p className="text-center text-gray-600 text-sm py-6">已加载全部 {videos.length} 条结果</p>
            )}
          </>
        )}
      </main>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 flex items-center justify-center transition-all duration-300 shadow-lg"
          aria-label="回到顶部"
        >
          <ChevronUp className="w-5 h-5 text-white" />
        </button>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen overflow-x-hidden"><Navbar /><main className="pt-16"><div className="text-center text-gray-400 py-20">Loading...</div></main></div>
    }><HomeContent /></Suspense>
  );
}