import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, FolderHeart, History, Film, Tv, ListFilter, Trash2, X } from 'lucide-react';
import { MediaItem, UserBookmark, WatchProgress } from './types';
import Navbar from './components/Navbar';
import BottomBar from './components/BottomBar';
import FeaturedHero from './components/FeaturedHero';
import MediaSlider from './components/MediaSlider';
import MediaCard from './components/MediaCard';
import WatchPlayer from './components/WatchPlayer';

const GENRES_MAP: Record<number, string> = {
  12: 'Adventure',
  16: 'Animation',
  18: 'Drama',
  28: 'Action',
  35: 'Comedy',
  80: 'Crime',
  878: 'Science Fiction',
  10759: 'Action & Adventure',
  10765: 'Sci-Fi & Fantasy',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    // default to dark since client-requested elegant dark glassmorphic styling
    return (localStorage.getItem('nepu_theme') as 'dark' | 'light') || 'dark';
  });

  // Dynamic domain and brand detection for nepoflix.site
  const isNepoflix = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.location.hostname.includes('nepoflix') || window.location.search.includes('brand=nepoflix');
  }, []);

  // Media Collections
  const [trendingList, setTrendingList] = useState<MediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>([]);
  const [popularShows, setPopularShows] = useState<MediaItem[]>([]);
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);

  // Selection states
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // Filters for sub-tabs
  const [selectedGenreId, setSelectedGenreId] = useState<number>(0);

  // Loading States
  const [loadingCollections, setLoadingCollections] = useState<boolean>(true);
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false);

  // Bookmarks Watchlist - Loaded from localStorage
  const [savedList, setSavedList] = useState<UserBookmark[]>(() => {
    const data = localStorage.getItem('nepu_watchlist');
    return data ? JSON.parse(data) : [];
  });

  // Watch History Progress - Loaded from localStorage
  const [watchProgressList, setWatchProgressList] = useState<WatchProgress[]>(() => {
    const data = localStorage.getItem('nepu_progress');
    return data ? JSON.parse(data) : [];
  });

  // Save/Unsave helper IDs
  const savedIds = useMemo(() => savedList.map((s) => s.id), [savedList]);

  // Sync theme with Document element for Tailwind v4 compatibility
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('nepu_theme', theme);
  }, [theme]);

  // Sync Watchlist with localStorage
  useEffect(() => {
    localStorage.setItem('nepu_watchlist', JSON.stringify(savedList));
  }, [savedList]);

  // Sync Watch Progress with localStorage
  useEffect(() => {
    localStorage.setItem('nepu_progress', JSON.stringify(watchProgressList));
  }, [watchProgressList]);

  // Implement Dynamic SEO tags dynamically in React!
  // This satisfies: "implement seo and a sitemap and name the site nepu" (and nepoflix for nepoflix.site)
  useEffect(() => {
    const brandName = isNepoflix ? 'nepoflix' : 'nepu';
    const brandDesc = isNepoflix 
      ? 'nepoflix is a sleek, modern, lightning-fast streaming site featuring cyan glassmorphism, dynamic servers, and robust search indices.'
      : 'nepu – Stream HD movies and TV shows for free, ad-free, and no subscriptions needed. Enjoy endless entertainment instantly!';

    let titleText = isNepoflix
      ? 'nepoflix - Premium Glassmorphic Movie & TV Streaming'
      : 'nepu – Watch Free Movies & TV Shows in High Quality';
    let descText = brandDesc;

    if (activeTab === 'player' && selectedMedia) {
      titleText = `Watch ${selectedMedia.title || selectedMedia.name} | ${brandName} Streaming`;
      descText = `Stream ${selectedMedia.title || selectedMedia.name} online with premium servers on ${brandName}. ${selectedMedia.overview.substring(0, 120)}...`;
    } else if (activeTab === 'movies') {
      titleText = `Explore Blockbuster Movies | ${brandName} Cinema`;
      descText = `Discover top-rated, popular, and trending movies in the ${brandName} index. Filter by genre and stream instantly.`;
    } else if (activeTab === 'shows') {
      titleText = `Binge Premium TV Shows | ${brandName} Stream`;
      descText = `Browse outstanding TV series, season episodes, and animations on ${brandName} with custom auto-playback.`;
    } else if (activeTab === 'saved') {
      titleText = `My Saved Space | ${brandName} Library`;
    } else if (activeTab === 'search' && searchQuery) {
      titleText = `Search results for "${searchQuery}" | ${brandName} Finder`;
    }

    document.title = titleText;

    // Dynamically inject or modify SEO meta tags for robots & indices
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', descText);

    // brand tags optimization!
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute(
      'content',
      isNepoflix
        ? 'nepoflix, nepoflix stream, nepoflix movie player, free movies, stream tv shows, cyan glassmorphism player, secure stream, responsive video'
        : 'nepu, nepu stream, nepu movie player, free movies, stream tv shows, pinkish glassmorphism player, vidking premium, responsive bottom bar, clean typography'
    );

    // Dynamic high-performance favicon for both brands!
    let linkIcon = document.querySelector('link[rel~="icon"]') as HTMLLinkElement | null;
    if (!linkIcon) {
      linkIcon = document.createElement('link');
      linkIcon.setAttribute('rel', 'icon');
      linkIcon.setAttribute('type', 'image/svg+xml');
      document.head.appendChild(linkIcon);
    }
    const nepuSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#09090b"/><rect x="2" y="2" width="60" height="60" rx="14" fill="none" stroke="url(#g)" stroke-width="3.2" opacity="0.85"/><text x="50%" y="58%" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="34" fill="url(#g)" text-anchor="middle">N</text><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f43f5e"/><stop offset="100%" stop-color="#ec4899"/></linearGradient></defs></svg>`;
    const nepoflixSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#09090b"/><rect x="2" y="2" width="60" height="60" rx="14" fill="none" stroke="url(#g)" stroke-width="3.2" opacity="0.85"/><text x="51%" y="58%" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="28" fill="url(#g)" text-anchor="middle" letter-spacing="-1">NF</text><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#06b6d4"/><stop offset="100%" stop-color="#6366f1"/></linearGradient></defs></svg>`;

    try {
      const base64Svg = btoa(unescape(encodeURIComponent(isNepoflix ? nepoflixSvg : nepuSvg)));
      linkIcon.setAttribute('href', `data:image/svg+xml;base64,${base64Svg}`);
    } catch (e) {
      console.error('Error generating dynamic favicon:', e);
    }
  }, [activeTab, selectedMedia, searchQuery, isNepoflix]);

  // Fetch collections on Mount
  useEffect(() => {
    setLoadingCollections(true);
    Promise.all([
      fetch('/api/trending').then((res) => res.json()),
      fetch('/api/popular?type=movie').then((res) => res.json()),
      fetch('/api/popular?type=tv').then((res) => res.json()),
    ])
      .then(([trendingData, popMoviesData, popShowsData]) => {
        setTrendingList(trendingData || []);
        setPopularMovies(popMoviesData || []);
        setPopularShows(popShowsData || []);
        setLoadingCollections(false);
      })
      .catch((err) => {
        console.error('Error loading collections:', err);
        setLoadingCollections(false);
      });
  }, []);

  // Fetch Search Results with debouncing
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      return;
    }

    setLoadingSearch(true);
    const delayDebounce = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`)
        .then((res) => res.json())
        .then((data) => {
          setSearchResults(data || []);
          setLoadingSearch(false);
        })
        .catch((err) => {
          console.error('Search query error:', err);
          setLoadingSearch(false);
        });
    }, 450); // 450ms debounce for elite performance

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Navigation handlers
  const handleSelectMedia = (item: MediaItem) => {
    setSelectedMedia(item);
    setActiveTab('player');
  };

  const handleToggleSave = (e: React.MouseEvent, item: MediaItem) => {
    e.stopPropagation(); // prevent card select trigger
    const index = savedList.findIndex((s) => s.id === item.id);
    if (index >= 0) {
      // Remove
      setSavedList((prev) => prev.filter((s) => s.id !== item.id));
    } else {
      // Add
      const newBookmark: UserBookmark = {
        id: item.id,
        media_type: item.media_type,
        title: item.title || item.name || '',
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        vote_average: item.vote_average,
        addedAt: new Date().toISOString(),
      };
      setSavedList((prev) => [newBookmark, ...prev]);
    }
  };

  const handleTrackProgress = (progress: {
    id: number;
    media_type: 'movie' | 'tv';
    title: string;
    poster_path: string;
    season?: number;
    episode?: number;
    episodeName?: string;
  }) => {
    // Upsert tracking progress
    setWatchProgressList((prev) => {
      const filtered = prev.filter((p) => p.id !== progress.id);
      const newProgress: WatchProgress = {
        id: progress.id,
        media_type: progress.media_type,
        title: progress.title,
        poster_path: progress.poster_path,
        season: progress.season,
        episode: progress.episode,
        episodeName: progress.episodeName,
        updatedAt: new Date().toISOString(),
      };
      return [newProgress, ...filtered].slice(0, 10); // store top 10 items
    });
  };

  const handleResumePlayback = (progress: WatchProgress) => {
    // Find the full media item from lists or build a quick shell to load details
    const found =
      trendingList.find((t) => t.id === progress.id && t.media_type === progress.media_type) ||
      popularMovies.find((m) => m.id === progress.id) ||
      popularShows.find((s) => s.id === progress.id) ||
      ({
        id: progress.id,
        media_type: progress.media_type,
        title: progress.title,
        poster_path: progress.poster_path,
        overview: '',
        backdrop_path: progress.poster_path,
        vote_average: 8.0,
        vote_count: 100,
      } as MediaItem);

    setSelectedMedia(found);
    setActiveTab('player');
  };

  const clearHistoryItem = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setWatchProgressList((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Extract featured trending item for Hero showcase
  const featuredHeroItem = useMemo(() => {
    return trendingList.length > 0 ? trendingList[0] : null;
  }, [trendingList]);

  // List of unique genres present in lists to filter movies / shows
  const movieGenres = [
    { id: 0, name: 'All Genres' },
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 18, name: 'Drama' },
    { id: 878, name: 'Science Fiction' },
  ];

  const tvGenres = [
    { id: 0, name: 'All Genres' },
    { id: 10759, name: 'Action & Adventure' },
    { id: 16, name: 'Animation' },
    { id: 18, name: 'Drama' },
    { id: 10765, name: 'Sci-Fi & Fantasy' },
    { id: 80, name: 'Crime' },
  ];

  const filteredMovies = useMemo(() => {
    if (selectedGenreId === 0) return popularMovies;
    return popularMovies.filter((m) => m.genres?.some((g) => g.id === selectedGenreId));
  }, [popularMovies, selectedGenreId]);

  const filteredShows = useMemo(() => {
    if (selectedGenreId === 0) return popularShows;
    return popularShows.filter((s) => s.genres?.some((g) => g.id === selectedGenreId));
  }, [popularShows, selectedGenreId]);

  const bgThemeClass =
    theme === 'dark'
      ? `bg-[#050505] text-white min-h-screen relative overflow-x-hidden font-sans selection:bg-rose-500/30 ${isNepoflix ? 'nepoflix-theme' : ''}`
      : `bg-[#fafafa] text-neutral-900 min-h-screen relative overflow-x-hidden font-sans selection:bg-rose-500/20 ${isNepoflix ? 'nepoflix-theme' : ''}`;

  return (
    <div id="nepu-app-container" className={bgThemeClass}>
      {/* Visual background ambient pink & purple glowing blobs matching Immersive UI spec */}
      <div className={`absolute top-[-200px] left-[-200px] w-[600px] h-[600px] ${isNepoflix ? 'bg-cyan-600/20' : 'bg-pink-600/20'} rounded-full blur-[120px] pointer-events-none z-0`} />
      <div className={`absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] ${isNepoflix ? 'bg-indigo-900/30' : 'bg-purple-900/30'} rounded-full blur-[100px] pointer-events-none z-0`} />
      <div className={`absolute top-[40%] left-[50%] w-[450px] h-[450px] ${isNepoflix ? 'bg-cyan-900/10' : 'bg-pink-900/10'} rounded-full blur-[110px] pointer-events-none z-0`} />

      {/* Main Glassmorphic Sticky Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedGenreId(0);
        }}
        theme={theme}
        toggleTheme={toggleTheme}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main viewport */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-6 md:py-10 pb-28 md:pb-12">
        <AnimatePresence mode="wait">
          
          {/* PLAYER SCREEN */}
          {activeTab === 'player' && selectedMedia && (
            <motion.div
              key="player-view"
              initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <WatchPlayer
                item={selectedMedia}
                theme={theme}
                savedIds={savedIds}
                onToggleSave={handleToggleSave}
                onSelectRecommendation={(rec) => {
                  setSelectedMedia(rec);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onBack={() => {
                  setActiveTab('home');
                  setSelectedMedia(null);
                }}
                onTrackProgress={handleTrackProgress}
              />
            </motion.div>
          )}

          {/* HOME SCREEN */}
          {activeTab === 'home' && (
            <motion.div
              key="home-view"
              initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col"
            >
              {loadingCollections ? (
                /* Sleek animated skeletons */
                <div className="flex flex-col gap-10 py-10">
                  <div className="w-full h-[400px] rounded-3xl bg-neutral-900/40 animate-pulse border border-white/5" />
                  <div className="flex flex-col gap-4">
                    <div className="w-48 h-6 rounded bg-neutral-900/50 animate-pulse" />
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="aspect-[2/3] rounded-2xl bg-neutral-900/40 animate-pulse" />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Cinematic Featured Choice */}
                  {featuredHeroItem && (
                    <FeaturedHero
                      item={featuredHeroItem}
                      theme={theme}
                      isSaved={savedIds.includes(featuredHeroItem.id)}
                      onToggleSave={handleToggleSave}
                      onPlay={handleSelectMedia}
                    />
                  )}

                  {/* Continuing Playback row if any exists */}
                  {watchProgressList.length > 0 && (
                    <div className="mb-10">
                      <div className="flex items-center gap-2 mb-4">
                        <History className="w-5 h-5 text-brand-pink" />
                        <h2 className="font-display text-lg sm:text-xl font-extrabold tracking-tight">
                          Continue Watching
                        </h2>
                      </div>
                      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {watchProgressList.map((progress) => (
                          <div
                            key={progress.id}
                            onClick={() => handleResumePlayback(progress)}
                            className={`flex-none w-72 p-3 rounded-xl border flex gap-3 items-center group cursor-pointer transition-all ${
                              theme === 'dark'
                                ? 'bg-neutral-900/45 hover:bg-neutral-900 border-neutral-800'
                                : 'bg-white hover:bg-neutral-50 border-neutral-200 shadow-sm'
                            }`}
                          >
                            <img
                              src={progress.poster_path}
                              alt={progress.title}
                              className="w-12 h-16 rounded-md object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <h3 className="text-xs font-bold truncate group-hover:text-brand-pink transition-colors">
                                {progress.title}
                              </h3>
                              <p className="text-[10px] text-neutral-400 font-mono mt-0.5 truncate">
                                {progress.media_type === 'tv'
                                  ? `Season ${progress.season} Ep ${progress.episode}`
                                  : 'Movie session'}
                              </p>
                              {progress.episodeName && (
                                <p className="text-[9px] text-brand-pink italic truncate mt-0.5">
                                  {progress.episodeName}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={(e) => clearHistoryItem(e, progress.id)}
                              className="p-1.5 rounded-full hover:bg-rose-500/10 text-neutral-500 hover:text-brand-pink transition-colors shrink-0"
                              title="Remove from history"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Collection sliders */}
                  <MediaSlider
                    title="Trending Picks Today"
                    items={trendingList}
                    theme={theme}
                    savedIds={savedIds}
                    onToggleSave={handleToggleSave}
                    onSelect={handleSelectMedia}
                  />

                  <MediaSlider
                    title="Popular Movies"
                    items={popularMovies}
                    theme={theme}
                    savedIds={savedIds}
                    onToggleSave={handleToggleSave}
                    onSelect={handleSelectMedia}
                  />

                  <MediaSlider
                    title="Top-Rated TV Series"
                    items={popularShows}
                    theme={theme}
                    savedIds={savedIds}
                    onToggleSave={handleToggleSave}
                    onSelect={handleSelectMedia}
                  />
                </>
              )}
            </motion.div>
          )}

          {/* MOVIES CATALOG SCREEN */}
          {activeTab === 'movies' && (
            <motion.div
              key="movies-view"
              initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl font-black text-glow-pink flex items-center gap-2">
                    <Film className="w-7 h-7 text-brand-pink" />
                    Blockbuster Movies
                  </h1>
                  <p className="text-xs text-neutral-400 mt-1">
                    Discover, filter, and stream premium films. Optimized for rapid loading.
                  </p>
                </div>

                {/* Genre filtering chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                  <ListFilter className="w-4 h-4 text-neutral-400 shrink-0 hidden sm:block mr-1" />
                  {movieGenres.map((genre) => (
                    <button
                      key={genre.id}
                      onClick={() => setSelectedGenreId(genre.id)}
                      className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold font-sans transition-all whitespace-nowrap cursor-pointer ${
                        selectedGenreId === genre.id
                          ? 'bg-pink-gradient text-white bg-pink-glow'
                          : theme === 'dark'
                          ? 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white hover:bg-neutral-850'
                          : 'bg-white text-neutral-600 border border-neutral-200 hover:text-neutral-900 hover:bg-neutral-50'
                      }`}
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
              </div>

              {filteredMovies.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                  {filteredMovies.map((item, index) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: Math.min(index * 0.03, 0.25), 
                        ease: [0.16, 1, 0.3, 1] 
                      }}
                    >
                      <MediaCard
                        item={item}
                        theme={theme}
                        isSaved={savedIds.includes(item.id)}
                        onToggleSave={handleToggleSave}
                        onSelect={handleSelectMedia}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-neutral-400">
                  <Film className="w-12 h-12 mx-auto text-neutral-700 mb-2" />
                  <p className="text-sm">No movies match the selected genre filters.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* TV SHOWS CATALOG SCREEN */}
          {activeTab === 'shows' && (
            <motion.div
              key="shows-view"
              initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl sm:text-3xl font-black text-glow-pink flex items-center gap-2">
                    <Tv className="w-7 h-7 text-brand-pink" />
                    Premium TV Series
                  </h1>
                  <p className="text-xs text-neutral-400 mt-1">
                    Binge-watch stunning serials. High-bandwidth streaming routes.
                  </p>
                </div>

                {/* Genre filtering chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                  <ListFilter className="w-4 h-4 text-neutral-400 shrink-0 hidden sm:block mr-1" />
                  {tvGenres.map((genre) => (
                    <button
                      key={genre.id}
                      onClick={() => setSelectedGenreId(genre.id)}
                      className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold font-sans transition-all whitespace-nowrap cursor-pointer ${
                        selectedGenreId === genre.id
                          ? 'bg-pink-gradient text-white bg-pink-glow'
                          : theme === 'dark'
                          ? 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white hover:bg-neutral-850'
                          : 'bg-white text-neutral-600 border border-neutral-200 hover:text-neutral-900 hover:bg-neutral-50'
                      }`}
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
              </div>

              {filteredShows.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                  {filteredShows.map((item, index) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: Math.min(index * 0.03, 0.25), 
                        ease: [0.16, 1, 0.3, 1] 
                      }}
                    >
                      <MediaCard
                        item={item}
                        theme={theme}
                        isSaved={savedIds.includes(item.id)}
                        onToggleSave={handleToggleSave}
                        onSelect={handleSelectMedia}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-neutral-400">
                  <Tv className="w-12 h-12 mx-auto text-neutral-700 mb-2" />
                  <p className="text-sm">No shows match the selected genre filters.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* SEARCH SCREEN */}
          {activeTab === 'search' && (
            <motion.div
              key="search-view"
              initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-6"
            >
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-black text-glow-pink flex items-center gap-2">
                  <Search className="w-7 h-7 text-brand-pink" />
                  Search Library
                </h1>
                <p className="text-xs text-neutral-400 mt-1">
                  Access catalog indices containing over 20,000+ streaming entries.
                </p>
              </div>

              {/* Input box inside page for direct mobile entry */}
              <div className="relative w-full max-w-2xl">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter keywords, titles, genres, actors..."
                  className={`w-full px-5 py-4 pl-12 text-sm rounded-2xl border outline-none font-sans transition-all ${
                    theme === 'dark'
                      ? 'bg-neutral-900/40 border-neutral-800 text-white focus:border-brand-pink/50 placeholder-neutral-500'
                      : 'bg-white border-neutral-200 text-neutral-950 focus:border-brand-pink/50 placeholder-neutral-400 shadow-sm'
                  }`}
                  autoFocus
                />
                <Search className="absolute left-4 top-4.5 w-5 h-5 text-neutral-400" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-4 text-neutral-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Search Outcomes */}
              {loadingSearch ? (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                  <div className="w-8 h-8 rounded-full border-2 border-brand-pink border-t-transparent animate-spin mb-3" />
                  <span className="text-xs font-mono uppercase tracking-wider">
                    Searching nepu database...
                  </span>
                </div>
              ) : searchQuery.trim() ? (
                searchResults.length > 0 ? (
                  <div>
                    <h3 className="text-xs font-mono text-neutral-400 mb-4 uppercase">
                      Search results found ({searchResults.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                      {searchResults.map((item, index) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            duration: 0.4, 
                            delay: Math.min(index * 0.03, 0.25), 
                            ease: [0.16, 1, 0.3, 1] 
                          }}
                        >
                          <MediaCard
                            item={item}
                            theme={theme}
                            isSaved={savedIds.includes(item.id)}
                            onToggleSave={handleToggleSave}
                            onSelect={handleSelectMedia}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 text-neutral-400">
                    <Trash2 className="w-12 h-12 mx-auto text-neutral-700 mb-3" />
                    <p className="text-sm">No streaming results found for "{searchQuery}".</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Check your TMDB key settings or search general keywords like "Dune" or "Bad".
                    </p>
                  </div>
                )
              ) : (
                /* Static discovery section if search bar is empty */
                <div className="py-8">
                  <div className="flex items-center gap-1.5 mb-4 text-neutral-300 font-display">
                    <Sparkles className="w-4 h-4 text-brand-pink" />
                    <span className="text-xs font-mono uppercase">Suggested Hot Queries</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {['Dune', 'Inside', 'Oppenheimer', 'Bad', 'Arcane', 'Last of Us', 'Action', 'Sci-Fi'].map(
                      (q) => (
                        <button
                          key={q}
                          onClick={() => setSearchQuery(q)}
                          className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                            theme === 'dark'
                              ? 'bg-neutral-900 border-neutral-800 hover:border-brand-pink text-neutral-300'
                              : 'bg-white border-neutral-200 hover:border-brand-pink text-neutral-700 shadow-sm'
                          }`}
                        >
                          "{q}"
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* SAVED SPACE / MY SPACE SCREEN */}
          {activeTab === 'saved' && (
            <motion.div
              key="saved-view"
              initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-8"
            >
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-black text-glow-pink flex items-center gap-2">
                  <FolderHeart className="w-7 h-7 text-brand-pink" />
                  My Personal Space
                </h1>
                <p className="text-xs text-neutral-400 mt-1">
                  Your bookmarked movies, watchlist, and custom streaming logs.
                </p>
              </div>

              {/* Saved bookmarks grid */}
              <div>
                <h2 className="font-display text-lg sm:text-xl font-extrabold tracking-tight mb-4">
                  My Watchlist ({savedList.length})
                </h2>

                {savedList.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                    {savedList.map((bm, index) => {
                      // Map Bookmark to MediaItem shell
                      const item: MediaItem = {
                        id: bm.id,
                        media_type: bm.media_type,
                        title: bm.title,
                        poster_path: bm.poster_path,
                        backdrop_path: bm.backdrop_path,
                        vote_average: bm.vote_average,
                        overview: '',
                        vote_count: 0,
                      };
                      return (
                        <motion.div
                          key={bm.id}
                          layout
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            duration: 0.4, 
                            delay: Math.min(index * 0.03, 0.25), 
                            ease: [0.16, 1, 0.3, 1] 
                          }}
                        >
                          <MediaCard
                            item={item}
                            theme={theme}
                            isSaved={true}
                            onToggleSave={handleToggleSave}
                            onSelect={handleSelectMedia}
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    className={`text-center py-16 rounded-3xl border ${
                      theme === 'dark' ? 'bg-neutral-900/30 border-neutral-800' : 'bg-white border-neutral-200'
                    }`}
                  >
                    <FolderHeart className="w-12 h-12 mx-auto text-neutral-700 mb-3" />
                    <p className="text-sm text-neutral-400">Your watchlist is completely empty.</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Go to Home or Catalog and click the bookmark button on any movie card.
                    </p>
                  </div>
                )}
              </div>

              {/* Watch progress catalog logs */}
              {watchProgressList.length > 0 && (
                <div className="pt-4 border-t border-rose-500/10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-lg sm:text-xl font-extrabold tracking-tight">
                      Recent Activity logs ({watchProgressList.length})
                    </h2>
                    <button
                      onClick={() => setWatchProgressList([])}
                      className="text-xs font-mono text-neutral-500 hover:text-brand-pink flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Clear History
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {watchProgressList.map((progress) => (
                      <div
                        key={progress.id}
                        onClick={() => handleResumePlayback(progress)}
                        className={`p-3.5 rounded-xl border flex gap-3.5 items-center group cursor-pointer transition-all ${
                          theme === 'dark'
                            ? 'bg-neutral-900/50 hover:bg-neutral-900 border-neutral-800'
                            : 'bg-white hover:bg-neutral-50 border-neutral-200 shadow-sm'
                        }`}
                      >
                        <img
                          src={progress.poster_path}
                          alt={progress.title}
                          className="w-11 h-15 rounded-md object-cover shadow"
                        />
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs font-bold truncate group-hover:text-brand-pink transition-colors">
                            {progress.title}
                          </h3>
                          <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                            {progress.media_type === 'tv'
                              ? `S${progress.season} Ep${progress.episode}`
                              : 'Movie session'}
                          </p>
                          {progress.episodeName && (
                            <p className="text-[9px] text-brand-pink truncate italic leading-tight mt-0.5">
                              {progress.episodeName}
                            </p>
                          )}
                          <p className="text-[9px] text-neutral-500 font-sans mt-1">
                            Watched {new Date(progress.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={(e) => clearHistoryItem(e, progress.id)}
                          className="p-1.5 rounded-full hover:bg-rose-500/10 text-neutral-500 hover:text-brand-pink transition-colors shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Floating Bottom Bar Navigation on Mobile */}
      <BottomBar activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
    </div>
  );
}
