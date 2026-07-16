import { motion } from 'motion/react';
import { Film, Tv, Bookmark, Search, Sun, Moon, Sparkles } from 'lucide-react';
import { getBrand, getBrandConfig } from '../utils/brand';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
  searchQuery,
  setSearchQuery,
}: NavbarProps) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Sparkles },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'shows', label: 'TV Shows', icon: Tv },
    { id: 'saved', label: 'My Space', icon: Bookmark },
  ];

  const brand = getBrand();
  const brandConfig = getBrandConfig(brand);

  return (
    <header
      id="nepu-header"
      className={`sticky top-0 z-40 w-full transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-[#050505]/40 border-b border-white/10 text-white shadow-lg'
          : 'bg-white/75 border-b border-rose-500/10 text-neutral-900 shadow-sm'
      } backdrop-blur-2xl px-4 sm:px-8 py-3.5 flex items-center justify-between`}
    >
      {/* Logo with immersive styling */}
      <div
        id="nepu-logo-container"
        className="flex items-center gap-2.5 cursor-pointer select-none"
        onClick={() => setActiveTab('home')}
      >
        <motion.div
          animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.03, 0.97, 1] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="w-9 h-9 rounded-xl bg-pink-gradient flex items-center justify-center text-white font-extrabold bg-pink-glow text-lg"
        >
          {brandConfig.shortName}
        </motion.div>
        <h1 className="font-display text-2xl font-black tracking-tighter bg-gradient-to-r from-brand-pink to-brand-violet bg-clip-text text-transparent text-glow-pink">
          {brandConfig.name.toUpperCase()}
        </h1>
      </div>

      {/* Desktop Navigation */}
      <nav id="nepu-desktop-nav" className="hidden md:flex items-center gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id !== 'saved') {
                  setSearchQuery('');
                }
              }}
              className={`relative px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest font-display flex items-center gap-2 transition-all duration-200 ${
                isActive
                  ? 'text-white'
                  : theme === 'dark'
                  ? 'text-gray-400 hover:text-white hover:bg-white/5'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="activeTabGlow"
                  className="absolute inset-0 bg-pink-gradient rounded-full -z-10 bg-pink-glow"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Side: Search Input, Theme Toggle & Profile Indicator */}
      <div id="nepu-navbar-controls" className="flex items-center gap-3">
        {/* Quick Search */}
        <div id="nav-search-bar" className="relative hidden sm:block w-48 lg:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (activeTab !== 'search' && e.target.value) {
                setActiveTab('search');
              }
            }}
            placeholder="Search titles..."
            className={`w-full px-4 py-2 pl-10 text-xs rounded-full border outline-none font-sans transition-all backdrop-blur-md ${
              theme === 'dark'
                ? 'bg-white/5 border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-pink-500/50 focus:border-pink-500/50 placeholder-neutral-500'
                : 'bg-neutral-50 border-neutral-200 text-neutral-950 focus:border-brand-pink/50 placeholder-neutral-400 focus:bg-white'
            }`}
          />
          <Search className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
        </div>

        {/* Mobile Search Button (Quick trigger if search input is hidden) */}
        <button
          id="btn-mobile-search-trigger"
          onClick={() => setActiveTab('search')}
          className={`sm:hidden p-2 rounded-full transition-colors ${
            activeTab === 'search'
              ? 'text-brand-pink bg-rose-500/10'
              : theme === 'dark'
              ? 'text-neutral-300 hover:bg-neutral-900'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Theme Mode Toggle Button */}
        <button
          id="btn-theme-toggle"
          onClick={toggleTheme}
          className={`p-2 rounded-full transition-all duration-300 ${
            theme === 'dark'
              ? 'text-yellow-400 hover:bg-yellow-400/10 bg-neutral-900'
              : 'text-rose-600 hover:bg-rose-500/10 bg-neutral-100'
          }`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <motion.div
              initial={{ rotate: -90, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Sun className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ rotate: 90, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Moon className="w-5 h-5" />
            </motion.div>
          )}
        </button>

        {/* Premium Immersive Profile node */}
        <div 
          className="hidden sm:block w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 border-2 border-white/20 shadow-md transform hover:scale-105 transition-transform"
          title="Streaming User Profile"
        />
      </div>
    </header>
  );
}
