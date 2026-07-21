import React from 'react';
import { motion } from 'motion/react';
import { Play, Bookmark, BookmarkCheck, Star, Clock } from 'lucide-react';
import { MediaItem } from '../types';

interface FeaturedHeroProps {
  item: MediaItem;
  theme: 'dark' | 'light';
  isSaved: boolean;
  onToggleSave: (e: React.MouseEvent, item: MediaItem) => void;
  onPlay: (item: MediaItem) => void;
}

export default function FeaturedHero({
  item,
  theme,
  isSaved,
  onToggleSave,
  onPlay,
}: FeaturedHeroProps) {
  const isMovie = item.media_type === 'movie';
  const releaseYear = item.release_date
    ? item.release_date.substring(0, 4)
    : item.first_air_date
    ? item.first_air_date.substring(0, 4)
    : '';

  return (
    <div
      id={`hero-showcase-${item.id}`}
      className="relative w-full min-h-[500px] lg:min-h-[620px] rounded-3xl overflow-hidden flex items-end mb-8 md:mb-12 bg-neutral-950"
    >
      {/* Background Backdrop Image */}
      <div className="absolute inset-0">
        <img
          src={item.backdrop_path}
          alt={item.title || item.name}
          fetchPriority="high"
          loading="eager"
          className="w-full h-full object-cover opacity-65 md:opacity-75 scale-100 animate-fade-in"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&auto=format&fit=crop&q=80';
          }}
        />
        {/* Complex Vignette Gradient for Depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-neutral-950/10" />
        <div className="absolute inset-y-0 left-0 w-full md:w-2/3 bg-gradient-to-r from-neutral-950 via-neutral-950/70 to-transparent" />
        {/* Subtle Elegant Pink Glow Vignette */}
        <div className="absolute inset-0 bg-radial-vignette opacity-20" />
      </div>

      {/* Hero Content Grid */}
      <div className="relative z-10 w-full px-6 sm:px-12 py-10 sm:py-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="md:col-span-8 flex flex-col items-start text-white"
        >
          {/* Trending Tag Group matching Immersive UI spec */}
          <div className="flex flex-wrap gap-2 text-[10px] font-extrabold uppercase tracking-widest mb-4 font-mono">
            <span className="px-2.5 py-1 bg-brand-pink text-black rounded font-black bg-pink-glow">
              ★ Trending
            </span>
            <span className="px-2.5 py-1 border border-white/20 rounded backdrop-blur-sm bg-black/25">
              Sci-Fi
            </span>
            <span className="px-2.5 py-1 border border-white/20 rounded backdrop-blur-sm bg-black/25">
              {isMovie ? 'Action' : 'TV Show'}
            </span>
          </div>

          {/* Large display title */}
          <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-none mb-5 uppercase text-glow-pink">
            {item.title || item.name}
          </h2>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-xs font-mono text-neutral-300">
            <span className="font-bold text-white px-2 py-0.5 rounded bg-brand-pink uppercase text-[10px] tracking-wider bg-pink-glow">
              {item.media_type}
            </span>
            <span className="border-l border-white/20 pl-4">{releaseYear}</span>
            {item.vote_average > 0 && (
              <span className="flex items-center gap-1 text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                {item.vote_average.toFixed(1)}
              </span>
            )}
            {item.runtime ? (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-neutral-400" />
                {item.runtime} min
              </span>
            ) : null}
          </div>

          {/* Overview text */}
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-xl mb-7 font-sans font-normal line-clamp-3 md:line-clamp-none">
            {item.overview}
          </p>

          {/* Buttons Row with matching Immersive specs */}
          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            <button
              id="btn-hero-play"
              onClick={() => onPlay(item)}
              className="px-10 py-4 bg-white text-black font-extrabold rounded-full hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg w-full sm:w-auto cursor-pointer"
            >
              <Play className="w-5 h-5 fill-black text-black" />
              Watch Now
            </button>

            <button
              id="btn-hero-bookmark"
              onClick={(e) => onToggleSave(e, item)}
              className="px-10 py-4 border border-white/25 backdrop-blur-xl rounded-full font-bold text-white hover:bg-white/10 transition-colors w-full sm:w-auto cursor-pointer flex items-center justify-center gap-2"
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4.5 h-4.5 text-brand-pink fill-brand-pink" />
                  Saved in Space
                </>
              ) : (
                <>
                  <Bookmark className="w-4.5 h-4.5" />
                  Add to Space
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
