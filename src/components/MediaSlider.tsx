import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem } from '../types';
import MediaCard from './MediaCard';

interface MediaSliderProps {
  title: string;
  items: MediaItem[];
  theme: 'dark' | 'light';
  savedIds: number[];
  onToggleSave: (e: React.MouseEvent, item: MediaItem) => void;
  onSelect: (item: MediaItem) => void;
}

export default function MediaSlider({
  title,
  items,
  theme,
  savedIds,
  onToggleSave,
  onSelect,
}: MediaSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const { scrollLeft, clientWidth } = sliderRef.current;
      const scrollTo =
        direction === 'left' ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75;
      sliderRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (items.length === 0) return null;

  return (
    <div id={`slider-row-${title.toLowerCase().replace(/\s+/g, '-')}`} className="relative mb-10 group">
      {/* Slider Header */}
      <div className="flex items-center justify-between px-1 mb-4">
        <h2
          className={`font-display text-xl sm:text-2xl font-extrabold tracking-tight ${
            theme === 'dark' ? 'text-white' : 'text-neutral-900'
          }`}
        >
          {title}
        </h2>

        {/* Desktop Buttons */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className={`p-1.5 rounded-full border transition-all ${
              theme === 'dark'
                ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-brand-pink/50'
                : 'bg-white border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:border-brand-pink/50'
            }`}
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className={`p-1.5 rounded-full border transition-all ${
              theme === 'dark'
                ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:border-brand-pink/50'
                : 'bg-white border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:border-brand-pink/50'
            }`}
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontally scrolling track */}
      <div
        ref={sliderRef}
        className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto scroll-smooth py-2 px-1 scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="flex-none w-[160px] sm:w-[210px]"
            style={{ scrollSnapAlign: 'start' }}
          >
            <MediaCard
              item={item}
              theme={theme}
              isSaved={savedIds.includes(item.id)}
              onToggleSave={onToggleSave}
              onSelect={onSelect}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
