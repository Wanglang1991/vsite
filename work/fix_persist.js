const fs = require("fs");
const base = "C:/Users/Administrator/Documents/Codex/2026-07-16/new-chat/packages/web/src";
const S = (s) => "\\u" + s.charCodeAt(0).toString(16).padStart(4, '0');

const catBar = `'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const CAT_STORAGE_KEY = 'vsite_last_cat';

const categories = [
  { id: 'animation', name: '` + S('动') + S('画') + `' },
  { id: 'music', name: '` + S('音') + S('乐') + `' },
  { id: 'game', name: '` + S('游') + S('戏') + `' },
  { id: 'sports', name: '` + S('运') + S('动') + `' },
  { id: 'tech', name: '` + S('科') + S('技') + `' },
  { id: 'nature', name: '` + S('自') + S('然') + `' },
  { id: 'travel', name: '` + S('旅') + S('行') + `' },
  { id: 'food', name: '` + S('美') + S('食') + `' },
  { id: 'film', name: '` + S('影') + S('视') + `' },
  { id: 'fashion', name: '` + S('时') + S('尚') + `' },
];

export default function CategoryBar() {
  const searchParams = useSearchParams();
  const currentCat = searchParams.get('cat');

  useEffect(() => {
    if (currentCat) {
      try { sessionStorage.setItem(CAT_STORAGE_KEY, currentCat); } catch {}
    }
  }, [currentCat]);

  return (
    <div className="flex gap-2 overflow-x-auto py-2 scrollbar-none">
      {categories.map(cat => (
        <Link key={cat.id} href={'/?cat=' + cat.id}
          className={'shrink-0 px-4 py-1.5 rounded-full text-sm transition ' + (currentCat === cat.id ? 'bg-brand-blue text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white')}>
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
`;
fs.writeFileSync(base + "/components/CategoryBar.tsx", catBar);

const homePage = `'use client';

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
`;
fs.writeFileSync(base + "/app/page.tsx", homePage);

const navbar = `'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Bell, X } from 'lucide-react';
import SearchOverlay from './SearchOverlay';

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const cat = searchParams.get('cat');
  const logoSrc = cat ? '/?cat=' + cat : '/';

  const handleFocus = useCallback(() => { setSearchOpen(true); }, []);
  const handleClose = useCallback(() => { setSearchOpen(false); setSearchQuery(''); }, []);
  const handleClear = useCallback(() => { setSearchQuery(''); inputRef.current?.focus(); }, []);

  return (
    <>
      <nav className="fixed top-0 z-50 w-full h-16 bg-brand-dark/95 backdrop-blur border-b border-white/10">
        <div className="max-w-screen-2xl mx-auto h-full flex items-center gap-4 px-4">
          <Link href={logoSrc} className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-brand-pink rounded-lg flex items-center justify-center text-white font-bold text-sm">VS</div>
            <span className="text-lg font-semibold text-white hidden sm:block">VSite</span>
          </Link>
          <div className="flex-1 max-w-xl mx-auto relative">
            <div className="flex items-center h-9 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full px-4 gap-2 transition">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input ref={inputRef} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onFocus={handleFocus} placeholder="` + S('搜') + S('索') + S('视') + S('频') + `..." className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500" autoComplete="off" />
              {searchQuery && <button onClick={handleClear} className="shrink-0 p-0.5 hover:bg-white/10 rounded-full transition"><X className="w-3.5 h-3.5 text-gray-400" /></button>}
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <Bell className="w-5 h-5 text-gray-300 cursor-pointer hover:text-white" />
            <div className="w-8 h-8 rounded-full bg-brand-pink/80 flex items-center justify-center text-white text-sm font-medium">U</div>
          </div>
        </div>
      </nav>
      <SearchOverlay open={searchOpen} query={searchQuery} onQueryChange={setSearchQuery} onClose={handleClose} />
    </>
  );
}
`;
fs.writeFileSync(base + "/components/Navbar.tsx", navbar);

console.log("All 3 files updated");