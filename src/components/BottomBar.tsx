import { motion } from 'motion/react';
import { Film, Tv, Bookmark, Search, Sparkles } from 'lucide-react';

interface BottomBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: 'dark' | 'light';
}

export default function BottomBar({ activeTab, setActiveTab, theme }: BottomBarProps) {
  const items = [
    { id: 'home', label: 'Home', icon: Sparkles },
    { id: 'movies', label: 'Movies', icon: Film },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'shows', label: 'TV Shows', icon: Tv },
    { id: 'saved', label: 'My Space', icon: Bookmark },
  ];

  const barBgClass =
    theme === 'dark'
      ? 'bg-neutral-950/80 border-t border-rose-500/10 text-white'
      : 'bg-white/85 border-t border-rose-500/10 text-neutral-900';

  return (
    <div
      id="nepu-mobile-bottom-bar"
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 py-2.5 backdrop-blur-lg ${barBgClass}`}
    >
      <div id="mobile-bottom-items" className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              id={`mobile-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className="relative flex flex-col items-center justify-center py-1 px-3 text-center focus:outline-none transition-colors"
            >
              <div
                className={`relative p-1.5 rounded-full z-10 ${
                  isActive
                    ? 'text-white scale-110'
                    : theme === 'dark'
                    ? 'text-neutral-400'
                    : 'text-neutral-500'
                } transition-all duration-300`}
              >
                <Icon className="w-5 h-5" />
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveIndicator"
                    className="absolute inset-0 bg-pink-gradient rounded-full bg-pink-glow -z-10"
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  />
                )}
              </div>
              <span
                className={`text-[9px] font-sans font-medium mt-1 ${
                  isActive
                    ? theme === 'dark'
                      ? 'text-brand-pink font-semibold'
                      : 'text-rose-600 font-semibold'
                    : 'text-neutral-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
