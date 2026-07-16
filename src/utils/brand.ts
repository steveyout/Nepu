export type Brand = 'nepu' | 'cineby' | 'nepoflix';

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
  return 'nepu';
}

export function getBrandConfig(brand: Brand) {
  switch (brand) {
    case 'cineby':
      return {
        name: 'Cineby',
        shortName: 'CB',
        themeColor: 'fbbf24', // Amber/yellow for cinematic cineby feel
        accentClass: 'brand-cineby',
        gradient: 'from-amber-400 to-orange-500',
        keywords: 'cineby, cineby stream, cineby app, cineby proxy, cineby alternative, free movies, stream tv shows, free movie streaming, cinema online, cineby watch, watch cineby free',
        desc: 'Cineby - Stream HD movies and TV shows for free, no ads, and no sign-up. The ultimate premium movie streaming alternative for cinema lovers.',
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
