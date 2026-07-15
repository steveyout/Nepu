import React from 'react';
import { motion } from 'motion/react';
import { Star, Play, Bookmark, BookmarkCheck } from 'lucide-react';
import { MediaItem } from '../types';

interface MediaCardProps {
  key?: React.Key;
  item: MediaItem;
  theme: 'dark' | 'light';
  isSaved: boolean;
  onToggleSave: (e: React.MouseEvent, item: MediaItem) => void;
  onSelect: (item: MediaItem) => void;
}

export default function MediaCard({
  item,
  theme,
  isSaved,
  onToggleSave,
  onSelect,
}: MediaCardProps) {
  const isMovie = item.media_type === 'movie';
  const releaseYear = item.release_date
    ? item.release_date.substring(0, 4)
    : item.first_air_date
    ? item.first_air_date.substring(0, 4)
    : '';

  const cardVariants = {
    initial: { y: 0, scale: 1 },
    hover: { 
      y: -8, 
      scale: 1.03,
      boxShadow: theme === 'dark' 
        ? "0 20px 25px -5px rgba(236, 72, 153, 0.25), 0 10px 10px -5px rgba(236, 72, 153, 0.15)"
        : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { type: 'spring', stiffness: 400, damping: 25 }
    }
  };

  const playButtonVariants = {
    initial: { scale: 0.7, opacity: 0, y: 15 },
    hover: { 
      scale: 1, 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring', stiffness: 350, damping: 20 } 
    }
  };

  return (
    <motion.div
      id={`media-card-${item.id}`}
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      onClick={() => onSelect(item)}
      className={`relative group cursor-pointer rounded-2xl overflow-hidden shadow-lg transition-all duration-300 ${
        theme === 'dark' ? 'bg-white/5 border border-white/5 hover:border-white/15 hover:bg-white/10 backdrop-blur-lg' : 'bg-white border border-neutral-100 hover:shadow-xl'
      }`}
    >
      {/* Card Image Wrapper */}
      <div className="relative aspect-[2/3] overflow-hidden bg-neutral-900">
        <img
          src={item.poster_path}
          alt={item.title || item.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // fallback if poster fails
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542204172-e7052809a862?w=500&auto=format&fit=crop&q=60';
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/95 via-neutral-950/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <motion.div
            variants={playButtonVariants}
            className="w-14 h-14 rounded-full bg-pink-gradient flex items-center justify-center text-white bg-pink-glow"
          >
            <Play className="w-6 h-6 fill-white ml-1" />
          </motion.div>
        </div>

        {/* Floating Rating Badge */}
        {item.vote_average > 0 && (
          <div
            id={`card-rating-${item.id}`}
            className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider font-mono text-white glass-dark border border-white/10"
          >
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{item.vote_average.toFixed(1)}</span>
          </div>
        )}

        {/* Floating Quick Action: Bookmark */}
        <button
          id={`btn-card-bookmark-${item.id}`}
          onClick={(e) => onToggleSave(e, item)}
          className="absolute top-2.5 right-2.5 p-2 rounded-full glass-dark text-white border border-white/10 hover:bg-brand-pink/20 hover:text-brand-pink transition-all active:scale-95 z-20"
          title={isSaved ? 'Remove from Space' : 'Add to Space'}
        >
          {isSaved ? (
            <BookmarkCheck className="w-3.5 h-3.5 text-brand-pink fill-brand-pink" />
          ) : (
            <Bookmark className="w-3.5 h-3.5 text-white/90" />
          )}
        </button>

        {/* Media Type pill on bottom */}
        <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-widest font-mono uppercase bg-neutral-950/80 text-white border border-white/5">
          {isMovie ? 'MOVIE' : 'TV'}
        </div>
      </div>

      {/* Info Block */}
      <div className="p-3.5">
        <h3
          id={`card-title-${item.id}`}
          className={`font-display text-sm font-semibold truncate leading-snug ${
            theme === 'dark' ? 'text-neutral-100 group-hover:text-brand-pink' : 'text-neutral-800 group-hover:text-rose-600'
          } transition-colors`}
        >
          {item.title || item.name}
        </h3>
        <div className="flex items-center justify-between mt-1 text-[11px] font-mono text-neutral-400">
          <span>{releaseYear}</span>
          <span className="capitalize">{item.media_type}</span>
        </div>
      </div>
    </motion.div>
  );
}
