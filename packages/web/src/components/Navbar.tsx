'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) router.push('/?q=' + encodeURIComponent(query.trim()));
  };

  return (
    <nav className="fixed top-0 z-50 w-full h-16 bg-brand-dark/95 backdrop-blur border-b border-white/10">
      <div className="max-w-screen-2xl mx-auto h-full flex items-center gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 bg-brand-pink rounded-lg flex items-center justify-center text-white font-bold text-sm">
            VS
          </div>
          <span className="text-lg font-semibold text-white hidden sm:block">VSite</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-auto">
          <div className="relative">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="搜索视频..."
              className="w-full h-9 pl-4 pr-10 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full text-sm text-white placeholder-gray-400 outline-none focus:border-brand-blue transition"
            />
            <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center hover:bg-white/10 rounded-full">
              <Search className="w-4 h-4 text-gray-300" />
            </button>
          </div>
        </form>

        {/* Right icons */}
        <div className="flex items-center gap-4 shrink-0">
          <Bell className="w-5 h-5 text-gray-300 cursor-pointer hover:text-white" />
          <div className="w-8 h-8 rounded-full bg-brand-pink/80 flex items-center justify-center text-white text-sm font-medium">
            U
          </div>
        </div>
      </div>
    </nav>
  );
}