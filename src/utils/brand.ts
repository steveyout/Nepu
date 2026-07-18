export type Brand = 'nepu' | 'cineby' | 'nepoflix' | 'coreflix';

export function getBrand(): Brand {
  if (typeof window === 'undefined') return 'nepu';
  const hostname = window.location.hostname.toLowerCase();
  const search = window.location.search.toLowerCase();
  
  if (hostname.includes('cineby') || search.includes('brand=cineby')) {
    return 'cineby';
  }
  if (hostname.includes('nepoflix') || search.includes('brand=nepoflix')) {
    return 'nepoflix';
  }
  if (hostname.includes('coreflix') || search.includes('brand=coreflix')) {
    return 'coreflix';
  }
  return 'nepu';
}

export function getBrandConfig(brand: Brand) {
  switch (brand) {
    case 'cineby':
      return {
        name: 'Cineby',
        shortName: 'CB',
        themeColor: 'ef4444', // Reddish theme color for premium cinematic feel
        accentClass: 'brand-cineby',
        gradient: 'from-red-500 to-rose-700', // Beautiful reddish gradient
        keywords: 'cineby, cineby works, cineby rest, cineby stream, cineby app, cineby proxy, cineby alternative, free movies, stream tv shows, free movie streaming, cinema online, cineby watch, watch cineby free',
        desc: 'Stream the latest movies and TV shows for free in HD quality on Cineby. Browse trending content, get personalized recommendations, and build your ultimate watchlist today without any ads or subscriptions.',
        tagline: 'Cineby – Stream HD Movies & TV Shows for Free',
      };
    case 'nepoflix':
      return {
        name: 'Nepoflix',
        shortName: 'NF',
        themeColor: '06b6d4', // Cyan
        accentClass: 'brand-nepoflix',
        gradient: 'from-cyan-500 to-indigo-500',
        keywords: 'nepoflix, nepoflix stream, nepoflix movie player, free movies, stream tv shows, cyan glassmorphism player, secure stream, responsive video, watch nepoflix',
        desc: 'Nepoflix is a sleek, modern, lightning-fast streaming site featuring cyan glassmorphism, dynamic servers, and robust search indices.',
        tagline: 'Nepoflix – Premium Glassmorphic Movie & TV Streaming',
      };
    case 'coreflix':
      return {
        name: 'Coreflix',
        shortName: 'CF',
        themeColor: '06b6d4', // Cyan (same theme as nepoflix)
        accentClass: 'brand-coreflix',
        gradient: 'from-cyan-500 to-indigo-500',
        keywords: 'coreflix, coreflix online, coreflix stream, watch movies coreflix, free movies, stream tv shows free, coreflix app, coreflix proxy, coreflix alternative, watch coreflix free',
        desc: 'Stream the latest movies and TV shows on Coreflix. Browse trending content, get personalized recommendations, and build your ultimate watchlist today.',
        tagline: 'Coreflix | Stream Movies & TV Shows Online',
      };
    case 'nepu':
    default:
      return {
        name: 'Nepu',
        shortName: 'N',
        themeColor: 'f43f5e', // Pink
        accentClass: 'brand-nepu',
        gradient: 'from-rose-500 to-pink-600',
        keywords: 'nepu, nepu stream, nepu movie player, free movies, stream tv shows, pinkish glassmorphism player, vidking premium, responsive bottom bar, clean typography, nepu site, watch nepu',
        desc: 'Nepu – Stream HD movies and TV shows for free, ad-free, and no subscriptions needed. Enjoy endless entertainment instantly on Nepu!',
        tagline: 'Nepu – Watch Free Movies & TV Shows in High Quality',
      };
  }
}
