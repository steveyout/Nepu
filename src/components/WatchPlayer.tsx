import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Star, Clock, Server, Play, ChevronDown, ListVideo, Users, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { MediaItem, Episode, SeasonDetails, CastMember, VideoItem } from '../types';
import { providers, DEFAULT_PROVIDER_ID, getEmbedUrl } from '../config/providers';
import MediaCard from './MediaCard';

interface WatchPlayerProps {
  item: MediaItem;
  theme: 'dark' | 'light';
  savedIds: number[];
  onToggleSave: (e: React.MouseEvent, item: MediaItem) => void;
  onSelectRecommendation: (item: MediaItem) => void;
  onBack: () => void;
  onTrackProgress: (progress: {
    id: number;
    media_type: 'movie' | 'tv';
    title: string;
    poster_path: string;
    season?: number;
    episode?: number;
    episodeName?: string;
  }) => void;
}

export default function WatchPlayer({
  item,
  theme,
  savedIds,
  onToggleSave,
  onSelectRecommendation,
  onBack,
  onTrackProgress,
}: WatchPlayerProps) {
  const isMovie = item.media_type === 'movie';
  const [selectedProvider, setSelectedProvider] = useState<string>(DEFAULT_PROVIDER_ID);
  
  // TV State
  const [currentSeason, setCurrentSeason] = useState<number>(1);
  const [currentEpisode, setCurrentEpisode] = useState<number>(1);
  const [currentEpisodeName, setCurrentEpisodeName] = useState<string>('');
  
  const [details, setDetails] = useState<{
    info?: MediaItem;
    cast: CastMember[];
    videos: VideoItem[];
    recommendations: MediaItem[];
  } | null>(null);
  
  const [seasonDetails, setSeasonDetails] = useState<SeasonDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(true);
  const [loadingEpisodes, setLoadingEpisodes] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'episodes' | 'cast' | 'recs'>('episodes');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState<boolean>(false);
  const seasonDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside listener for season selector dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (seasonDropdownRef.current && !seasonDropdownRef.current.contains(event.target as Node)) {
        setIsSeasonDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Set default tab based on type
  useEffect(() => {
    setActiveTab(isMovie ? 'cast' : 'episodes');
  }, [isMovie]);

  // Fetch full details (cast, recommendations, etc.)
  useEffect(() => {
    let active = true;
    setLoadingDetails(true);
    
    fetch(`/api/details/${item.media_type}/${item.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (active) {
          setDetails({
            info: data.info || null,
            cast: data.cast || [],
            videos: data.videos || [],
            recommendations: data.recommendations || [],
          });
          setLoadingDetails(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching details:', err);
        if (active) setLoadingDetails(false);
      });

    return () => {
      active = false;
    };
  }, [item]);

  // Fetch TV Season details
  useEffect(() => {
    if (isMovie) return;
    
    let active = true;
    setLoadingEpisodes(true);
    
    fetch(`/api/tv/${item.id}/season/${currentSeason}`)
      .then((res) => res.json())
      .then((data) => {
        if (active) {
          setSeasonDetails(data);
          setLoadingEpisodes(false);
          // Auto select first episode name if not set
          if (data.episodes && data.episodes.length > 0) {
            const ep = data.episodes.find((e: Episode) => e.episode_number === currentEpisode) || data.episodes[0];
            setCurrentEpisodeName(ep.name);
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching season details:', err);
        if (active) setLoadingEpisodes(false);
      });

    return () => {
      active = false;
    };
  }, [item, currentSeason, isMovie]);

  // Track progress when playing movies or selecting different TV episodes
  useEffect(() => {
    if (isMovie) {
      onTrackProgress({
        id: item.id,
        media_type: 'movie',
        title: item.title || item.name || '',
        poster_path: item.poster_path,
      });
    } else {
      onTrackProgress({
        id: item.id,
        media_type: 'tv',
        title: item.title || item.name || '',
        poster_path: item.poster_path,
        season: currentSeason,
        episode: currentEpisode,
        episodeName: currentEpisodeName,
      });
    }
  }, [item, isMovie, currentSeason, currentEpisode, currentEpisodeName]);

  const handleEpisodeSelect = (ep: Episode) => {
    setCurrentEpisode(ep.episode_number);
    setCurrentEpisodeName(ep.name);
    // Smooth scroll to top of viewport on mobile so they can see the video playing
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextEpisode = () => {
    if (!seasonDetails?.episodes) return;
    const nextEpNum = currentEpisode + 1;
    const nextEp = seasonDetails.episodes.find((e) => e.episode_number === nextEpNum);
    
    if (nextEp) {
      setCurrentEpisode(nextEpNum);
      setCurrentEpisodeName(nextEp.name);
    } else {
      // Try incrementing season
      const totalSeasons = item.number_of_seasons || 1;
      if (currentSeason < totalSeasons) {
        setCurrentSeason((prev) => prev + 1);
        setCurrentEpisode(1);
      }
    }
  };

  const handlePrevEpisode = () => {
    if (currentEpisode > 1) {
      setCurrentEpisode((prev) => prev - 1);
      if (seasonDetails?.episodes) {
        const prevEp = seasonDetails.episodes.find((e) => e.episode_number === currentEpisode - 1);
        if (prevEp) setCurrentEpisodeName(prevEp.name);
      }
    }
  };

  const handleRefreshPlayer = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const embedUrl = getEmbedUrl(selectedProvider, item.media_type, item.id, currentSeason, currentEpisode);
  const releaseYear = item.release_date
    ? item.release_date.substring(0, 4)
    : item.first_air_date
    ? item.first_air_date.substring(0, 4)
    : '';

  return (
    <div id="player-screen-root" className="w-full pb-20">
      {/* Back Header Button */}
      <div id="player-header" className="flex items-center gap-3 mb-5">
        <button
          id="btn-player-back"
          onClick={onBack}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full border transition-all ${
            theme === 'dark'
              ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:border-brand-pink/50'
              : 'bg-white border-neutral-200 text-neutral-700 hover:text-neutral-900 hover:border-brand-pink/50'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog
        </button>
        <span className="text-xs font-mono text-neutral-400">
          Playing: {item.title || item.name} {!isMovie && `(S${currentSeason}:E${currentEpisode})`}
        </span>
      </div>

      {/* Main Grid: Player on left (or top), details / episodes on right (or bottom) */}
      <div id="player-main-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left/Top Section: Video Container and Provider Switchers */}
        <div id="player-left-section" className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Aspect-ratio locked Video Frame */}
          <div
            id="video-player-container"
            className="relative w-full aspect-video rounded-3xl overflow-hidden bg-neutral-950 border border-rose-500/10 shadow-2xl bg-pink-glow"
          >
            {!isRefreshing ? (
              <iframe
                id="nepu-media-iframe"
                src={embedUrl}
                className="w-full h-full border-0 absolute inset-0"
                allowFullScreen
                scrolling="no"
                referrerPolicy="no-referrer"
                allow="autoplay; encrypted-media; picture-in-picture"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white bg-neutral-950/90">
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="w-8 h-8 text-brand-pink animate-spin" />
                  <span className="text-xs font-mono">Reloading stream...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Action bar beneath video frame */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-1 px-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-neutral-400 flex items-center gap-1">
                <Server className="w-3.5 h-3.5 text-brand-pink" />
                Active server:
              </span>
              <span className="text-xs font-bold font-display px-2.5 py-1 rounded-md bg-rose-500/10 text-brand-pink border border-rose-500/20">
                {providers.find((p) => p.id === selectedProvider)?.name || selectedProvider}
              </span>
            </div>

            {/* TV Show episode fast switchers */}
            {!isMovie && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevEpisode}
                  disabled={currentEpisode <= 1}
                  className="px-3 py-1 rounded-full text-[11px] font-bold bg-neutral-500/10 text-neutral-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer border border-white/5"
                >
                  ◀ Prev
                </button>
                <span className="text-xs font-mono text-white bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
                  Episode {currentEpisode}
                </span>
                <button
                  onClick={handleNextEpisode}
                  className="px-3 py-1 rounded-full text-[11px] font-bold bg-brand-pink/10 text-brand-pink border border-brand-pink/20 hover:bg-brand-pink/20 hover:text-white transition-all cursor-pointer"
                >
                  Next ▶
                </button>
              </div>
            )}

            <button
              id="btn-reload-stream"
              onClick={handleRefreshPlayer}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-neutral-500/10 text-neutral-400 hover:text-white border border-white/5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reload Frame
            </button>
          </div>

          {/* Server / Provider Selector Pills - Beautiful Immersive UI Sidebar style */}
          <div id="providers-container" className="p-5 sm:p-6 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 mt-2 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <span className="text-sm font-black uppercase tracking-widest text-neutral-200 flex items-center gap-2">
                <Server className="w-4 h-4 text-brand-pink" />
                Playback Servers
              </span>
              <span className="text-[10px] text-pink-400 font-bold uppercase tracking-widest">
                High Definition
              </span>
            </div>

            <div className="space-y-3">
              {providers.map((prov, index) => {
                const isSelected = selectedProvider === prov.id;
                const taglines = [
                  'Fastest Loading',
                  '1080p Stream',
                  '4K UHD Stream',
                  'Ad-Free Direct',
                  'High Speed Backup',
                  'Fast Mirror'
                ];
                const tag = taglines[index % taglines.length];

                return (
                  <div
                    key={prov.id}
                    onClick={() => {
                      setSelectedProvider(prov.id);
                      handleRefreshPlayer();
                    }}
                    className={`p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-200 border ${
                      isSelected
                        ? 'bg-gradient-to-r from-pink-600/40 to-transparent border-pink-500/30'
                        : theme === 'dark'
                        ? 'bg-white/5 border-white/5 hover:bg-white/10'
                        : 'bg-neutral-100 border-neutral-200/50 hover:bg-neutral-200'
                    }`}
                  >
                    <div className="flex flex-col select-none">
                      <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-neutral-300'}`}>
                        {prov.name}
                      </span>
                      <span className={`text-[9px] uppercase tracking-wider ${isSelected ? 'text-pink-300' : 'text-neutral-500'}`}>
                        {tag}
                      </span>
                    </div>
                    {isSelected ? (
                      <div className="w-2.5 h-2.5 rounded-full glowing-pink-dot" />
                    ) : (
                      <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-neutral-700' : 'bg-neutral-300'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Warning notice */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/10 text-[11px] font-sans text-neutral-400 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-brand-pink shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-neutral-300">Disclaimer: </span>
              Video players are hosted externally by major verified embed engines. We recommend using <span className="text-brand-pink font-semibold">Server 1 (VidKing)</span> or <span className="text-brand-pink font-semibold">Server 2 (VidLink)</span> for the best buffering speed and built-in continuous autoplay.
            </div>
          </div>
        </div>

        {/* Right/Bottom Section: Tabs (Episodes, Cast, Recommendations) */}
        <div id="player-right-section" className="lg:col-span-4 flex flex-col gap-5">
          
          {/* Metadata Block: Description, runtime, ratings */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 text-white shadow-lg">
            <h2 className="font-display text-xl font-bold leading-tight mb-2">
              {item.title || item.name}
            </h2>
            
            {(item.tagline || details?.info?.tagline) && (
              <p className="italic text-brand-pink text-xs mb-4 font-sans font-medium">
                "{item.tagline || details?.info?.tagline}"
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3.5 text-xs text-neutral-400 mb-4 font-mono">
              <span className="px-2 py-0.5 rounded bg-brand-pink text-[10px] text-white font-bold tracking-wider uppercase">
                {item.media_type}
              </span>
              <span>{releaseYear}</span>
              {(item.vote_average > 0 || (details?.info?.vote_average && details.info.vote_average > 0)) && (
                <span className="flex items-center gap-1 text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {(item.vote_average || details?.info?.vote_average || 0).toFixed(1)}
                </span>
              )}
              {(item.runtime || details?.info?.runtime) ? (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {item.runtime || details?.info?.runtime}m
                </span>
              ) : null}
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed mb-4 font-sans font-normal">
              {item.overview || details?.info?.overview || (loadingDetails ? 'Loading details...' : 'No overview available.')}
            </p>

            {((item.genres && item.genres.length > 0) || (details?.info?.genres && details.info.genres.length > 0)) && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-neutral-800">
                {(item.genres || details?.info?.genres || []).map((g) => (
                  <span
                    key={g.id}
                    className="px-2 py-0.5 rounded-md text-[10px] font-medium font-mono bg-neutral-900 border border-neutral-800 text-neutral-400"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Section Tabs Container */}
          <div className="rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 overflow-hidden text-white flex flex-col min-h-[350px] shadow-lg">
            {/* Tab buttons header */}
            <div className="flex border-b border-neutral-800 bg-neutral-950/60 p-1">
              {!isMovie && (
                <button
                  onClick={() => setActiveTab('episodes')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold font-display flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'episodes'
                      ? 'bg-pink-gradient text-white bg-pink-glow'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <ListVideo className="w-3.5 h-3.5" />
                  Episodes
                </button>
              )}
              <button
                onClick={() => setActiveTab('cast')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold font-display flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'cast'
                    ? 'bg-pink-gradient text-white bg-pink-glow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Cast
              </button>
              <button
                onClick={() => setActiveTab('recs')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold font-display flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'recs'
                    ? 'bg-pink-gradient text-white bg-pink-glow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                More
              </button>
            </div>

            {/* Tab content bodies */}
            <div className={`p-4 flex-1 max-h-[480px] transition-all duration-200 ${isSeasonDropdownOpen ? 'overflow-visible' : 'overflow-y-auto'}`}>
              <AnimatePresence mode="wait">
                {activeTab === 'episodes' && !isMovie && (
                  <motion.div
                    key="episodes-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col gap-3"
                  >
                    {/* Perfect Custom Season Selector Dropdown */}
                    {(() => {
                      const totalSeasons = details?.info?.number_of_seasons || item.number_of_seasons || 1;
                      if (totalSeasons <= 1) return null;

                      return (
                        <div ref={seasonDropdownRef} className="relative mb-3.5 z-30">
                          <span className="block text-[10px] font-mono font-bold tracking-wider text-neutral-400 uppercase mb-1.5">
                            Select Season
                          </span>
                          <button
                            type="button"
                            id="btn-season-dropdown-toggle"
                            onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
                            className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold rounded-xl bg-neutral-900 border border-neutral-800 text-white hover:border-brand-pink/50 focus:border-brand-pink/60 transition-all duration-200 outline-none cursor-pointer shadow-md"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-brand-pink animate-pulse" />
                              <span>Season {currentSeason}</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-300 ${isSeasonDropdownOpen ? 'rotate-180 text-brand-pink' : ''}`} />
                          </button>

                          <AnimatePresence>
                            {isSeasonDropdownOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                animate={{ opacity: 1, y: 4, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                transition={{ duration: 0.15, ease: 'easeOut' }}
                                className="absolute left-0 right-0 top-full mt-1.5 bg-[#0a0a0c] border border-neutral-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] p-1.5 max-h-56 overflow-y-auto overflow-x-hidden thin-scrollbar z-50 flex flex-col gap-1"
                              >
                                {Array.from({ length: totalSeasons }).map((_, idx) => {
                                  const sNum = idx + 1;
                                  const isSelected = sNum === currentSeason;
                                  return (
                                    <button
                                      key={sNum}
                                      type="button"
                                      onClick={() => {
                                        setCurrentSeason(sNum);
                                        setCurrentEpisode(1);
                                        setIsSeasonDropdownOpen(false);
                                      }}
                                      className={`w-full text-left px-3.5 py-2.5 text-xs font-bold rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                                        isSelected
                                          ? 'bg-brand-pink/15 text-brand-pink border border-brand-pink/20'
                                          : 'text-neutral-300 hover:bg-white/5 hover:text-white border border-transparent'
                                      }`}
                                    >
                                      <span>Season {sNum}</span>
                                      {isSelected && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-pink shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                                      )}
                                    </button>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })()}

                    {loadingEpisodes ? (
                      <div className="flex flex-col items-center justify-center py-10 text-neutral-400">
                        <RefreshCw className="w-6 h-6 animate-spin text-brand-pink mb-2" />
                        <span className="text-xs font-mono">Loading episodes...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2.5 relative z-10">
                        {seasonDetails?.episodes && seasonDetails.episodes.length > 0 ? (
                          seasonDetails.episodes.map((ep) => {
                            const isCurrent = ep.episode_number === currentEpisode;
                            return (
                              <button
                                key={ep.id}
                                onClick={() => handleEpisodeSelect(ep)}
                                className={`w-full text-left p-2.5 rounded-xl transition-all border flex gap-3 cursor-pointer ${
                                  isCurrent
                                    ? 'bg-brand-pink/10 border-brand-pink/30'
                                    : 'bg-neutral-900/40 border-neutral-800/40 hover:bg-neutral-900 hover:border-neutral-800'
                                }`}
                              >
                                {/* Ep Thumbnail or number */}
                                <div className="relative w-20 aspect-video rounded-md overflow-hidden bg-neutral-950 shrink-0">
                                  <img
                                    src={ep.still_path}
                                    alt={ep.name}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = item.backdrop_path;
                                    }}
                                  />
                                  {isCurrent && (
                                    <div className="absolute inset-0 bg-brand-pink/40 flex items-center justify-center">
                                      <Play className="w-4 h-4 text-white fill-white" />
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-mono font-bold text-brand-pink shrink-0">
                                      EP {ep.episode_number}
                                    </span>
                                    <span className="text-xs font-semibold truncate text-neutral-100">
                                      {ep.name}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-neutral-400 line-clamp-2 mt-1 leading-snug">
                                    {ep.overview || 'No episode summary available.'}
                                  </p>
                                </div>
                              </button>
                            );
                          })
                        ) : (
                          <div className="text-center py-6 text-neutral-400 text-xs">
                            No episodes found.
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'cast' && (
                  <motion.div
                    key="cast-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col gap-3"
                  >
                    {loadingDetails ? (
                      <div className="flex justify-center py-10">
                        <RefreshCw className="w-5 h-5 animate-spin text-brand-pink" />
                      </div>
                    ) : details?.cast && details.cast.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {details.cast.map((c) => (
                          <div
                            key={c.id}
                            className="flex items-center gap-2.5 p-2 rounded-xl bg-neutral-900/50 border border-neutral-800"
                          >
                            <img
                              src={
                                c.profile_path ||
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=40'
                              }
                              alt={c.name}
                              className="w-10 h-10 rounded-full object-cover bg-neutral-800 shrink-0 border border-neutral-800"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=40';
                              }}
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold truncate text-white leading-tight">
                                {c.name}
                              </p>
                              <p className="text-[9px] truncate text-neutral-400 leading-tight mt-0.5">
                                {c.character}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-neutral-400 text-xs font-mono">
                        Cast details not available.
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'recs' && (
                  <motion.div
                    key="recs-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col gap-3"
                  >
                    {loadingDetails ? (
                      <div className="flex justify-center py-10">
                        <RefreshCw className="w-5 h-5 animate-spin text-brand-pink" />
                      </div>
                    ) : details?.recommendations && details.recommendations.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {details.recommendations.map((rec) => (
                          <div
                            key={rec.id}
                            onClick={() => onSelectRecommendation(rec)}
                            className="cursor-pointer group relative aspect-[2/3] rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800"
                          >
                            <img
                              src={rec.poster_path}
                              alt={rec.title || rec.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-[10px] font-bold text-white truncate w-full">
                                {rec.title || rec.name}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-neutral-400 text-xs font-mono">
                        No related movies found.
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
