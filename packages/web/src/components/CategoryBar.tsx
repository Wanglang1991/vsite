'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const CAT_STORAGE_KEY = 'vsite_last_cat';

const categories = [
  { id: 'animation', name: '动画' },
  { id: 'music', name: '音乐' },
  { id: 'game', name: '游戏' },
  { id: 'sports', name: '运动' },
  { id: 'tech', name: '科技' },
  { id: 'nature', name: '自然' },
  { id: 'travel', name: '旅行' },
  { id: 'food', name: '美食' },
  { id: 'film', name: '影视' },
  { id: 'fashion', name: '时尚' },
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
    <div className="flex gap-2 py-2 scrollbar-none">
      {categories.map(cat => (
        <Link key={cat.id} href={'/?cat=' + cat.id}
          className={'shrink-0 px-4 py-1.5 rounded-full text-sm transition ' + (currentCat === cat.id ? 'bg-brand-blue text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white')}>
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
