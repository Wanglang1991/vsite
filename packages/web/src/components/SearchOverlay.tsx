'use client';

import { formatDuration, formatViews, searchVideos } from '@/lib/api';
import type { VideoItem } from '@/types';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

interface SearchOverlayProps {
  open: boolean;
  query: string;
  onQueryChange: (q: string) => void;
  onClose: () => void;
}

export default function SearchOverlay({ open, query, onQueryChange, onClose }: SearchOverlayProps) {
  const [results, setResults] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); setLoading(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchVideos(query.trim(), 1);
        setResults(data.videos.slice(0, 10));
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  useEffect(() => { setScrollTop(0); if (listRef.current) listRef.current.scrollTop = 0; }, [query]);

  const handleScroll = useCallback(() => { if (listRef.current) setScrollTop(listRef.current.scrollTop); }, []);
  const handleMore = useCallback(() => { onClose(); router.push('/search?q=' + encodeURIComponent(query.trim())); }, [query, onClose, router]);
  const handleItemClick = useCallback((id: string) => { onClose(); router.push('/video/' + id); }, [onClose, router]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const hasResults = !loading && query.trim() && results.length > 0;
  const showEmpty = !loading && query.trim() && results.length === 0;

  return (
    <>
      <div
        className={'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-all duration-400 ease-out ' + (open ? 'opacity-100 visible' : 'opacity-0 invisible')}
        onClick={onClose}
      />
      <div data-search-overlay className={'fixed top-16 left-0 right-0 z-50 mx-auto max-w-2xl transition-all duration-400 ease-out ' + (open ? 'translate-y-0 opacity-100 visible' : '-translate-y-3 opacity-0 invisible')}>
        <div className='mx-4 bg-brand-dark/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden'>
          <div className='relative max-h-[60vh]'>
            <div ref={listRef} onScroll={handleScroll} className='overflow-y-auto max-h-[60vh] overscroll-contain'>
              {loading && <div className='flex items-center justify-center py-12'><Loader2 className='w-6 h-6 text-gray-400 animate-spin' /></div>}
              {showEmpty && <div className='py-12 text-center text-gray-500 text-sm'>未找到相关视频</div>}
              {!query.trim() && <div className='py-12 text-center text-gray-500 text-sm'>输入关键词搜索视频</div>}
              {hasResults && <div className='py-2'>
                {results.map(video => (
                  <button key={video.id} onClick={() => handleItemClick(video.id)} className='w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition text-left'>
                    <div className='relative w-28 h-16 shrink-0 rounded-md overflow-hidden bg-gray-800'>
                      <img src={video.thumbnail} alt='' className='w-full h-full object-cover' loading='lazy' />
                      <span className='absolute bottom-0.5 right-0.5 px-1 bg-black/80 text-white text-[10px] rounded'>{formatDuration(video.duration)}</span>
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-sm text-gray-100 line-clamp-2 leading-snug'>{video.title}</p>
                      <p className='text-xs text-gray-500 mt-1'>{video.author.name} · {formatViews(video.views)} 观看</p>
                    </div>
                  </button>
                ))}
              </div>}
            </div>
            <div className='pointer-events-none absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-brand-dark/95 to-transparent transition-opacity duration-300' style={{ opacity: Math.min(scrollTop / 20, 0.9) }} />
            <div className='pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-brand-dark/95 to-transparent' style={{ opacity: hasResults ? 1 : 0 }} />
          </div>
          {hasResults && <button onClick={handleMore} className='w-full flex items-center justify-center gap-1 px-4 py-3 border-t border-white/5 text-sm text-brand-blue hover:bg-white/5 transition'>查看更多结果<ChevronRight className='w-4 h-4' /></button>}
        </div>
      </div>
    </>
  );
}
