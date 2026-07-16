'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bell, X } from 'lucide-react';
import SearchOverlay from './SearchOverlay';

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const logoSrc = typeof window !== 'undefined' && pathname === '/' ? (() => {
    const p = new URLSearchParams(window.location.search);
    const c = p.get('cat');
    return c ? '/?cat=' + c : '/';
  })() : '/';

  const handleFocus = useCallback(() => { setSearchOpen(true); }, []);

  const handleClose = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery('');
    inputRef.current?.blur();
  }, []);

  const handleClear = useCallback(() => {
    setSearchQuery('');
    inputRef.current?.focus();
  }, []);

  // Global click: close search when clicking outside input and overlay
  useEffect(() => {
    if (!searchOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Click inside search container (input area)
      if (searchContainerRef.current?.contains(target)) return;

      // Click inside the overlay panel
      const overlay = document.querySelector('[data-search-overlay]');
      if (overlay?.contains(target)) return;

      // Click elsewhere -> close
      handleClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchOpen, handleClose]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 min-w-[360px] h-16 bg-brand-dark/95 backdrop-blur border-b border-white/10">
        <div className="max-w-screen-2xl mx-auto h-full flex items-center gap-4 px-4">
          <Link href={logoSrc} className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-brand-pink rounded-lg flex items-center justify-center text-white font-bold text-sm">VS</div>
            <span className="text-lg font-semibold text-white hidden sm:block">VSite</span>
          </Link>
          <div ref={searchContainerRef} className="flex-1 max-w-xl mx-auto relative">
            <div className="flex items-center h-9 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full px-4 gap-2 transition">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input ref={inputRef} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onFocus={handleFocus} placeholder="搜索视频..." className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500" autoComplete="off" />
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
