'use client';

interface CategoryBarProps {
  activeCat: string | null;
  onSelect: (catId: string | null) => void;
}

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

export default function CategoryBar({ activeCat, onSelect }: CategoryBarProps) {
  return (
    <div className="flex gap-2 py-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(activeCat === cat.id ? null : cat.id)}
          className={'shrink-0 px-4 py-1.5 rounded-full text-sm transition ' + (activeCat === cat.id ? 'bg-brand-blue text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white')}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}