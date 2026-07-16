const fs = require("fs");
const base = "C:/Users/Administrator/Documents/Codex/2026-07-16/new-chat/packages/web/src";

// Fix Navbar.tsx
const navbar = `'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Search, Bell, X } from 'lucide-react';
import SearchOverlay from './SearchOverlay';

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = useCallback(() => { setSearchOpen(true); }, []);
  const handleClose = useCallback(() => { setSearchOpen(false); setSearchQuery(''); }, []);
  const handleClear = useCallback(() => { setSearchQuery(''); inputRef.current?.focus(); }, []);

  return (
    <>
      <nav className="fixed top-0 z-50 w-full h-16 bg-brand-dark/95 backdrop-blur border-b border-white/10">
        <div className="max-w-screen-2xl mx-auto h-full flex items-center gap-4 px-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-brand-pink rounded-lg flex items-center justify-center text-white font-bold text-sm">VS</div>
            <span className="text-lg font-semibold text-white hidden sm:block">VSite</span>
          </Link>
          <div className="flex-1 max-w-xl mx-auto relative">
            <div className="flex items-center h-9 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full px-4 gap-2 transition">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input ref={inputRef} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onFocus={handleFocus} placeholder="` + "\u641c\u7d22\u89c6\u9891..." + `" className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500" autoComplete="off" />
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

// Fix CategoryBar.tsx
const catNames = {
  animation: "\u52a8\u753b", music: "\u97f3\u4e50", game: "\u6e38\u620f",
  sports: "\u8fd0\u52a8", tech: "\u79d1\u6280", nature: "\u81ea\u7136",
  travel: "\u65c5\u884c", food: "\u7f8e\u98df", film: "\u5f71\u89c6", fashion: "\u65f6\u5c1a"
};
const catBar = `'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const categories = [
  { id: 'animation', name: '` + catNames.animation + `' },
  { id: 'music', name: '` + catNames.music + `' },
  { id: 'game', name: '` + catNames.game + `' },
  { id: 'sports', name: '` + catNames.sports + `' },
  { id: 'tech', name: '` + catNames.tech + `' },
  { id: 'nature', name: '` + catNames.nature + `' },
  { id: 'travel', name: '` + catNames.travel + `' },
  { id: 'food', name: '` + catNames.food + `' },
  { id: 'film', name: '` + catNames.film + `' },
  { id: 'fashion', name: '` + catNames.fashion + `' },
];

export default function CategoryBar() {
  const searchParams = useSearchParams();
  const currentCat = searchParams.get('cat');
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

// Fix VideoGrid
const videoGrid = `import type { VideoItem } from '@/types';
import VideoCard from './VideoCard';

export default function VideoGrid({ videos }: { videos: VideoItem[] }) {
  if (!videos.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
        <p className="text-lg">` + "\u6682\u65e0\u89c6\u9891" + `</p>
        <p className="text-sm mt-1">` + "\u8bf7\u5148\u914d\u7f6e\u540e\u7aef API Key" + `</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {videos.map(video => <VideoCard key={video.id} video={video} />)}
    </div>
  );
}
`;
fs.writeFileSync(base + "/components/VideoGrid.tsx", videoGrid);

// Fix layout
const layout = `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VSite - ` + "\u89c6\u9891\u5206\u4eab" + `',
  description: '` + "\u89c6\u9891\u5206\u4eab\u5e73\u53f0" + `',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
`;
fs.writeFileSync(base + "/app/layout.tsx", layout);

// Fix search page
const searchPage = `'use client';

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
          {!loading && <span className="text-sm text-gray-500 shrink-0">` + "\u5171" + ` {total} ` + "\u4e2a\u7ed3\u679c" + `</span>}
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
            <p className="text-lg">` + "\u672a\u627e\u5230" + ` &ldquo;{q}&rdquo; ` + "\u7684\u76f8\u5173\u89c6\u9891" + `</p>
            <p className="text-sm mt-1">` + "\u8bf7\u5c1d\u8bd5\u5176\u4ed6\u5173\u952e\u8bcd" + `</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return <Suspense fallback={<div className="min-h-screen bg-brand-darker flex items-center justify-center"><div className="text-gray-400">Loading...</div></div>}><SearchContent /></Suspense>;
}
`;
fs.writeFileSync(base + "/app/search/page.tsx", searchPage);

console.log("All files fixed");