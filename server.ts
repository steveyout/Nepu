import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import compression from 'compression';
import { createServer as createViteServer } from 'vite';
import { mockMovies, mockShows, mockAll, getMockCast, getMockVideos, getMockSeasonDetails } from './src/mock_db';

// Load environment variables
dotenv.config();

const app = express();

// Enable Gzip compression to significantly improve page load metrics (FCP, LCP) on slower networks
app.use(compression());

const PORT = Number(process.env.PORT) || 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

// Helper to determine brand based on host
function getBrandFromHost(host: string): 'nepu' | 'cineby' | 'nepoflix' | 'coreflix' {
  const hostname = host.toLowerCase();
  if (hostname.includes('cineby')) {
    return 'cineby';
  }
  if (hostname.includes('nepoflix')) {
    return 'nepoflix';
  }
  if (hostname.includes('coreflix')) {
    return 'coreflix';
  }
  return 'nepu';
}

// Asynchronously fetch media metadata for SSR purposes
async function fetchMediaMetadata(type: string, id: string): Promise<any | null> {
  const numId = Number(id);
  if (isNaN(numId)) return null;
  try {
    if (!TMDB_API_KEY) {
      return mockAll.find((m) => m.id === numId && m.media_type === type) || null;
    }
    const infoData = await fetchFromTMDB(`/${type}/${id}`);
    if (!infoData || infoData.success === false) return null;
    return {
      id: infoData.id,
      title: infoData.title || infoData.name || '',
      name: infoData.name || infoData.title || '',
      overview: infoData.overview || '',
      poster_path: infoData.poster_path ? `https://image.tmdb.org/t/p/w500${infoData.poster_path}` : 'https://image.tmdb.org/t/p/w500/vpnVM9B6m6X7gZ64oA0htZPLrst.jpg',
      backdrop_path: infoData.backdrop_path ? `https://image.tmdb.org/t/p/original${infoData.backdrop_path}` : 'https://image.tmdb.org/t/p/original/stKGOmXhjR46SVg8367zSsuIuSI.jpg',
      media_type: type as 'movie' | 'tv',
      release_date: infoData.release_date || infoData.first_air_date || '',
      vote_average: infoData.vote_average || 0,
      vote_count: infoData.vote_count || 0,
      genres: infoData.genres || [],
      runtime: infoData.runtime || 0,
      tagline: infoData.tagline || '',
    };
  } catch (err) {
    console.error('Error fetching SSR metadata:', err);
    return mockAll.find((m) => m.id === numId && m.media_type === type) || null;
  }
}

// Inject advanced SEO tags, dynamic themes, Open Graph, Twitter Cards, and Schema.org rich snippets dynamically
async function injectDynamicSEO(html: string, host: string, urlPath: string): Promise<string> {
  const brand = getBrandFromHost(host);
  let title = '';
  let desc = '';
  let keywords = '';
  let svg = '';
  let ogImage = '';
  let jsonLd: any = null;

  // 1. Set brand defaults
  if (brand === 'cineby') {
    title = 'Cineby – Stream HD Movies & TV Shows for Free';
    desc = 'Stream the latest movies and TV shows for free in HD quality on Cineby. Browse trending content, get personalized recommendations, and build your ultimate watchlist today without any ads or subscriptions.';
    keywords = 'cineby, cineby works, cineby rest, cineby stream, cineby app, cineby proxy, cineby alternative, free movies, stream tv shows, free movie streaming, cinema online, cineby watch, watch cineby free';
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#09090b"/><rect x="2" y="2" width="60" height="60" rx="14" fill="none" stroke="url(#g)" stroke-width="3.2" opacity="0.85"/><text x="50%" y="58%" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="34" fill="url(#g)" text-anchor="middle">C</text><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ef4444"/><stop offset="100%" stop-color="#991b1b"/></linearGradient></defs></svg>`;
    ogImage = 'https://image.tmdb.org/t/p/original/stKGOmXhjR46SVg8367zSsuIuSI.jpg';
  } else if (brand === 'coreflix') {
    title = 'Coreflix | Stream Movies & TV Shows Online';
    desc = 'Stream the latest movies and TV shows on Coreflix. Browse trending content, get personalized recommendations, and build your ultimate watchlist today.';
    keywords = 'coreflix, coreflix online, coreflix stream, watch movies coreflix, free movies, stream tv shows free, coreflix app, coreflix proxy, coreflix alternative, watch coreflix free';
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#09090b"/><rect x="2" y="2" width="60" height="60" rx="14" fill="none" stroke="url(#g)" stroke-width="3.2" opacity="0.85"/><text x="51%" y="58%" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="28" fill="url(#g)" text-anchor="middle" letter-spacing="-1">CF</text><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#06b6d4"/><stop offset="100%" stop-color="#6366f1"/></linearGradient></defs></svg>`;
    ogImage = 'https://image.tmdb.org/t/p/original/stKGOmXhjR46SVg8367zSsuIuSI.jpg';
  } else if (brand === 'nepoflix') {
    title = 'Nepoflix – Premium Glassmorphic Movie & TV Streaming';
    desc = 'Nepoflix is a sleek, modern, lightning-fast streaming site featuring cyan glassmorphism, dynamic servers, and robust search indices.';
    keywords = 'nepoflix, nepoflix stream, nepoflix movie player, free movies, stream tv shows, cyan glassmorphism player, secure stream, responsive video, watch nepoflix';
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#09090b"/><rect x="2" y="2" width="60" height="60" rx="14" fill="none" stroke="url(#g)" stroke-width="3.2" opacity="0.85"/><text x="51%" y="58%" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="28" fill="url(#g)" text-anchor="middle" letter-spacing="-1">NF</text><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#06b6d4"/><stop offset="100%" stop-color="#6366f1"/></linearGradient></defs></svg>`;
    ogImage = 'https://image.tmdb.org/t/p/original/stKGOmXhjR46SVg8367zSsuIuSI.jpg';
  } else {
    title = 'Nepu – Watch Free Movies & TV Shows in High Quality';
    desc = 'Nepu – Stream HD movies and TV shows for free, ad-free, and no subscriptions needed. Enjoy endless entertainment instantly on Nepu!';
    keywords = 'nepu, nepu stream, nepu movie player, free movies, stream tv shows, pinkish glassmorphism player, vidking premium, responsive bottom bar, clean typography, nepu site, watch nepu';
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#09090b"/><rect x="2" y="2" width="60" height="60" rx="14" fill="none" stroke="url(#g)" stroke-width="3.2" opacity="0.85"/><text x="50%" y="58%" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="34" fill="url(#g)" text-anchor="middle">N</text><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f43f5e"/><stop offset="100%" stop-color="#ec4899"/></linearGradient></defs></svg>`;
    ogImage = 'https://image.tmdb.org/t/p/original/stKGOmXhjR46SVg8367zSsuIuSI.jpg';
  }

  // 2. Default Website Schema.org rich snippet
  const brandName = brand === 'cineby' ? 'Cineby' : brand === 'coreflix' ? 'Coreflix' : brand === 'nepoflix' ? 'Nepoflix' : 'Nepu';
  jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': brandName,
    'url': `https://${host}`,
    'description': desc,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `https://${host}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  // 3. Handle path-specific metadata and schema.org rich snippets
  // Matches /watch/movie/:id or /watch/movie/:id/:slug or /watch/tv/:id or /watch/tv/:id/:slug
  const watchRegex = /^\/watch\/(movie|tv)\/([0-9]+)/i;
  const match = urlPath.match(watchRegex);

  if (match) {
    const mediaType = match[1];
    const mediaId = match[2];
    const media = await fetchMediaMetadata(mediaType, mediaId);

    if (media) {
      const mediaTitle = media.title || media.name || '';
      const releaseYear = media.release_date ? media.release_date.substring(0, 4) : '';
      
      // Override default SEO with item-specific metadata
      title = `Watch ${mediaTitle} (${releaseYear}) Online Free | ${brandName}`;
      desc = `Stream ${mediaTitle} (${releaseYear}) in full HD quality. ${media.overview ? media.overview.substring(0, 160) : 'Watch movies and TV shows for free online without any ads.'}...`;
      ogImage = media.backdrop_path || media.poster_path || ogImage;

      // Define specific schema.org structured data (Movie or TVSeries rich snippet)
      if (mediaType === 'movie') {
        jsonLd = {
          '@context': 'https://schema.org',
          '@type': 'Movie',
          'name': mediaTitle,
          'image': media.poster_path || ogImage,
          'description': media.overview,
          'dateCreated': media.release_date,
          'aggregateRating': {
            '@type': 'AggregateRating',
            'ratingValue': media.vote_average || 8.0,
            'bestRating': '10',
            'ratingCount': media.vote_count || 100
          },
          'releasedEvent': {
            '@type': 'PublicationEvent',
            'startDate': media.release_date,
            'location': {
              '@type': 'Country',
              'name': 'US'
            }
          }
        };
      } else {
        jsonLd = {
          '@context': 'https://schema.org',
          '@type': 'TVSeries',
          'name': mediaTitle,
          'image': media.poster_path || ogImage,
          'description': media.overview,
          'aggregateRating': {
            '@type': 'AggregateRating',
            'ratingValue': media.vote_average || 8.0,
            'bestRating': '10',
            'ratingCount': media.vote_count || 100
          }
        };
      }
    }
  } else if (urlPath.startsWith('/movies')) {
    title = `Explore Blockbuster Movies | ${brandName} Cinema`;
    desc = `Discover top-rated, popular, and trending movies in the ${brandName} index. Filter by genre and stream instantly in high definition.`;
  } else if (urlPath.startsWith('/shows')) {
    title = `Binge Premium TV Shows & Series | ${brandName} Stream`;
    desc = `Browse outstanding TV series, season episodes, and animations on ${brandName} with our elite media player interface.`;
  } else if (urlPath.startsWith('/saved')) {
    title = `My Saved Watchlist | ${brandName} Library`;
    desc = `Your personalized cinematic library. Access saved movies and TV shows on ${brandName} instantly.`;
  } else if (urlPath.startsWith('/search')) {
    title = `Search Movies & TV Shows | ${brandName} Finder`;
    desc = `Search across thousands of indexed titles on ${brandName} to find your next cinematic experience.`;
  }

  let result = html;

  // Replace Title
  result = result.replace(/<title>[^]*?<\/title>/gi, `<title>${title}</title>`);

  // Replace Description
  const descMeta = `<meta name="description" content="${desc.replace(/"/g, '&quot;')}" />`;
  if (result.includes('name="description"')) {
    result = result.replace(/<meta\s+name="description"\s+content="[^]*?"\s*\/?>/gi, descMeta);
  } else {
    result = result.replace('</head>', `  ${descMeta}\n</head>`);
  }

  // Replace Keywords
  const keywordsMeta = `<meta name="keywords" content="${keywords.replace(/"/g, '&quot;')}" />`;
  if (result.includes('name="keywords"')) {
    result = result.replace(/<meta\s+name="keywords"\s+content="[^]*?"\s*\/?>/gi, keywordsMeta);
  } else {
    result = result.replace('</head>', `  ${keywordsMeta}\n</head>`);
  }

  // Open Graph / Twitter Tags (for gorgeous rich previews on Discord, Twitter, Facebook, Telegram)
  const ogTags = `
  <meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />
  <meta property="og:description" content="${desc.replace(/"/g, '&quot;')}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:type" content="video.movie" />
  <meta property="og:url" content="https://${host}${urlPath}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />
  <meta name="twitter:description" content="${desc.replace(/"/g, '&quot;')}" />
  <meta name="twitter:image" content="${ogImage}" />
  `;
  result = result.replace('</head>', `  ${ogTags}\n</head>`);

  // Inject/replace favicon with stable, crawlable URLs (Google explicitly forbids base64 data URIs)
  const faviconTag = `
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" href="/favicon.svg" />
  `;
  if (result.includes('rel="icon"') || result.includes('rel=icon') || result.includes('rel="shortcut icon"')) {
    result = result.replace(/<link\s+rel="[^]*?icon"\s+[^>]*?\/?>/gi, '');
    result = result.replace(/<link\s+rel="shortcut\s+icon"\s+[^>]*?\/?>/gi, '');
  }
  result = result.replace('</head>', `  ${faviconTag}\n</head>`);

  // Inject Schema.org Rich Snippet JSON-LD
  if (jsonLd) {
    const jsonLdScript = `
  <script type="application/ld+json">
    ${JSON.stringify(jsonLd, null, 2)}
  </script>
    `;
    result = result.replace('</head>', `  ${jsonLdScript}\n</head>`);
  }

  return result;
}

app.use(express.json());

// In-memory cache to guarantee lightning-fast performance
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

function getCached(key: string): any | null {
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, expiry: Date.now() + CACHE_DURATION });
}

// Helper to fetch from TMDB with fallback
async function fetchFromTMDB(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  if (!TMDB_API_KEY) {
    throw new Error('No TMDB API Key');
  }

  const queryParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: 'en-US',
    ...params,
  }).toString();

  const url = `https://api.themoviedb.org/3${endpoint}?${queryParams}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDB responded with status ${response.status}`);
  }
  return response.json();
}

// API Routes
app.get('/api/trending', async (req, res) => {
  const cacheKey = 'trending';
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    if (!TMDB_API_KEY) {
      // Return mock list if key is missing
      setCache(cacheKey, mockAll);
      return res.json(mockAll);
    }

    const data = await fetchFromTMDB('/trending/all/day');
    // Normalize items
    const results = (data.results || []).map((item: any) => ({
      id: item.id,
      title: item.title || item.name || '',
      name: item.name || item.title || '',
      overview: item.overview || '',
      poster_path: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://image.tmdb.org/t/p/w500/vpnVM9B6m6X7gZ64oA0htZPLrst.jpg',
      backdrop_path: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : 'https://image.tmdb.org/t/p/original/stKGOmXhjR46SVg8367zSsuIuSI.jpg',
      media_type: item.media_type || (item.title ? 'movie' : 'tv'),
      release_date: item.release_date || item.first_air_date || '',
      vote_average: item.vote_average || 0,
      vote_count: item.vote_count || 0,
    }));

    setCache(cacheKey, results);
    return res.json(results);
  } catch (err) {
    console.warn('Error fetching trending, returning fallbacks:', err);
    return res.json(mockAll);
  }
});

app.get('/api/popular', async (req, res) => {
  const type = req.query.type === 'tv' ? 'tv' : 'movie';
  const cacheKey = `popular_${type}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    if (!TMDB_API_KEY) {
      const fallback = type === 'movie' ? mockMovies : mockShows;
      setCache(cacheKey, fallback);
      return res.json(fallback);
    }

    const data = await fetchFromTMDB(`/${type}/popular`);
    const results = (data.results || []).map((item: any) => ({
      id: item.id,
      title: item.title || item.name || '',
      name: item.name || item.title || '',
      overview: item.overview || '',
      poster_path: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://image.tmdb.org/t/p/w500/vpnVM9B6m6X7gZ64oA0htZPLrst.jpg',
      backdrop_path: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : 'https://image.tmdb.org/t/p/original/stKGOmXhjR46SVg8367zSsuIuSI.jpg',
      media_type: type,
      release_date: item.release_date || item.first_air_date || '',
      vote_average: item.vote_average || 0,
      vote_count: item.vote_count || 0,
    }));

    setCache(cacheKey, results);
    return res.json(results);
  } catch (err) {
    const fallback = type === 'movie' ? mockMovies : mockShows;
    return res.json(fallback);
  }
});

app.get('/api/search', async (req, res) => {
  const query = String(req.query.q || '').trim();
  if (!query) {
    return res.json([]);
  }

  const cacheKey = `search_${query}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    if (!TMDB_API_KEY) {
      const lower = query.toLowerCase();
      const filtered = mockAll.filter(
        (m) =>
          (m.title && m.title.toLowerCase().includes(lower)) ||
          (m.overview && m.overview.toLowerCase().includes(lower))
      );
      return res.json(filtered);
    }

    const data = await fetchFromTMDB('/search/multi', { query });
    const results = (data.results || [])
      .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
      .map((item: any) => ({
        id: item.id,
        title: item.title || item.name || '',
        name: item.name || item.title || '',
        overview: item.overview || '',
        poster_path: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://image.tmdb.org/t/p/w500/vpnVM9B6m6X7gZ64oA0htZPLrst.jpg',
        backdrop_path: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : 'https://image.tmdb.org/t/p/original/stKGOmXhjR46SVg8367zSsuIuSI.jpg',
        media_type: item.media_type,
        release_date: item.release_date || item.first_air_date || '',
        vote_average: item.vote_average || 0,
        vote_count: item.vote_count || 0,
      }));

    setCache(cacheKey, results);
    return res.json(results);
  } catch (err) {
    const lower = query.toLowerCase();
    const filtered = mockAll.filter(
      (m) =>
        (m.title && m.title.toLowerCase().includes(lower)) ||
        (m.overview && m.overview.toLowerCase().includes(lower))
    );
    return res.json(filtered);
  }
});

app.get('/api/details/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  const numId = Number(id);
  const cacheKey = `details_${type}_${id}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    if (!TMDB_API_KEY) {
      const info = mockAll.find((m) => m.id === numId && m.media_type === type) || mockAll[0];
      const detail = {
        info,
        cast: getMockCast(numId),
        videos: getMockVideos(numId),
        recommendations: mockAll.filter((m) => m.id !== numId).slice(0, 4),
      };
      setCache(cacheKey, detail);
      return res.json(detail);
    }

    const [infoData, creditsData, videosData, recsData] = await Promise.all([
      fetchFromTMDB(`/${type}/${id}`),
      fetchFromTMDB(`/${type}/${id}/credits`),
      fetchFromTMDB(`/${type}/${id}/videos`),
      fetchFromTMDB(`/${type}/${id}/recommendations`),
    ]);

    const info = {
      id: infoData.id,
      title: infoData.title || infoData.name || '',
      name: infoData.name || infoData.title || '',
      overview: infoData.overview || '',
      poster_path: infoData.poster_path ? `https://image.tmdb.org/t/p/w500${infoData.poster_path}` : 'https://image.tmdb.org/t/p/w500/vpnVM9B6m6X7gZ64oA0htZPLrst.jpg',
      backdrop_path: infoData.backdrop_path ? `https://image.tmdb.org/t/p/original${infoData.backdrop_path}` : 'https://image.tmdb.org/t/p/original/stKGOmXhjR46SVg8367zSsuIuSI.jpg',
      media_type: type as 'movie' | 'tv',
      release_date: infoData.release_date || infoData.first_air_date || '',
      vote_average: infoData.vote_average || 0,
      vote_count: infoData.vote_count || 0,
      genres: infoData.genres || [],
      runtime: infoData.runtime || 0,
      tagline: infoData.tagline || '',
      number_of_seasons: infoData.number_of_seasons || 0,
      number_of_episodes: infoData.number_of_episodes || 0,
    };

    const cast = (creditsData.cast || []).slice(0, 10).map((c: any) => ({
      id: c.id,
      name: c.name,
      character: c.character,
      profile_path: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null,
    }));

    const videos = (videosData.results || []).filter((v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));

    const recommendations = (recsData.results || []).slice(0, 6).map((item: any) => ({
      id: item.id,
      title: item.title || item.name || '',
      name: item.name || item.title || '',
      overview: item.overview || '',
      poster_path: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://image.tmdb.org/t/p/w500/vpnVM9B6m6X7gZ64oA0htZPLrst.jpg',
      backdrop_path: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : 'https://image.tmdb.org/t/p/original/stKGOmXhjR46SVg8367zSsuIuSI.jpg',
      media_type: type as 'movie' | 'tv',
      release_date: item.release_date || item.first_air_date || '',
      vote_average: item.vote_average || 0,
      vote_count: item.vote_count || 0,
    }));

    const detail = { info, cast, videos, recommendations };
    setCache(cacheKey, detail);
    return res.json(detail);
  } catch (err) {
    const info = mockAll.find((m) => m.id === numId && m.media_type === type) || mockAll[0];
    const detail = {
      info,
      cast: getMockCast(numId),
      videos: getMockVideos(numId),
      recommendations: mockAll.filter((m) => m.id !== numId).slice(0, 4),
    };
    return res.json(detail);
  }
});

app.get('/api/tv/:id/season/:season_number', async (req, res) => {
  const { id, season_number } = req.params;
  const numId = Number(id);
  const numSeason = Number(season_number);
  const cacheKey = `tv_${id}_season_${season_number}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    if (!TMDB_API_KEY) {
      const data = getMockSeasonDetails(numId, numSeason);
      setCache(cacheKey, data);
      return res.json(data);
    }

    const data = await fetchFromTMDB(`/tv/${id}/season/${season_number}`);
    const episodes = (data.episodes || []).map((ep: any) => ({
      id: ep.id,
      name: ep.name,
      overview: ep.overview || '',
      episode_number: ep.episode_number,
      season_number: ep.season_number,
      still_path: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : 'https://image.tmdb.org/t/p/w500/stKGOmXhjR46SVg8367zSsuIuSI.jpg',
      air_date: ep.air_date || '',
      vote_average: ep.vote_average || 0,
    }));

    const result = {
      id: data.id,
      name: data.name || `Season ${season_number}`,
      overview: data.overview || '',
      season_number: numSeason,
      poster_path: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : 'https://image.tmdb.org/t/p/w500/vpnVM9B6m6X7gZ64oA0htZPLrst.jpg',
      episodes,
    };

    setCache(cacheKey, result);
    return res.json(result);
  } catch (err) {
    const data = getMockSeasonDetails(numId, numSeason);
    return res.json(data);
  }
});

// Dynamic XML Sitemap Generator for SEO optimization!
app.get('/sitemap.xml', (req, res) => {
  res.header('Content-Type', 'application/xml');
  
  // Dynamically switch to visited domain from request
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const dynamicDomain = `${protocol}://${host}`;
  
  // Base URLs
  const urls = [
    { loc: `${dynamicDomain}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${dynamicDomain}/movies`, changefreq: 'weekly', priority: '0.8' },
    { loc: `${dynamicDomain}/shows`, changefreq: 'weekly', priority: '0.8' },
    { loc: `${dynamicDomain}/saved`, changefreq: 'daily', priority: '0.7' },
  ];

  // Add the trending mock movies for SEO coverage with nice descriptive slugs!
  const serverSlugify = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  mockAll.forEach((item) => {
    const slug = serverSlugify(item.title || item.name || 'stream');
    urls.push({
      loc: `${dynamicDomain}/watch/${item.media_type}/${item.id}/${slug}`,
      changefreq: 'monthly',
      priority: '0.6',
    });
  });

  const xmlEntries = urls
    .map(
      (url) => `
  <url>
    <loc>${url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
    )
    .join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${xmlEntries}
</urlset>`;

  return res.send(sitemap.trim());
});

// Dynamic /favicon.ico and /favicon.svg handler for search engines and direct requests!
app.get(['/favicon.ico', '/favicon.svg'], (req, res) => {
  const host = req.get('host') || '';
  const brand = getBrandFromHost(host);
  
  let svg = '';
  if (brand === 'cineby') {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#09090b"/><rect x="2" y="2" width="60" height="60" rx="14" fill="none" stroke="url(#g)" stroke-width="3.2" opacity="0.85"/><text x="50%" y="58%" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="34" fill="url(#g)" text-anchor="middle">C</text><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ef4444"/><stop offset="100%" stop-color="#991b1b"/></linearGradient></defs></svg>`;
  } else if (brand === 'coreflix') {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#09090b"/><rect x="2" y="2" width="60" height="60" rx="14" fill="none" stroke="url(#g)" stroke-width="3.2" opacity="0.85"/><text x="51%" y="58%" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="28" fill="url(#g)" text-anchor="middle" letter-spacing="-1">CF</text><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#06b6d4"/><stop offset="100%" stop-color="#6366f1"/></linearGradient></defs></svg>`;
  } else if (brand === 'nepoflix') {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#09090b"/><rect x="2" y="2" width="60" height="60" rx="14" fill="none" stroke="url(#g)" stroke-width="3.2" opacity="0.85"/><text x="51%" y="58%" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="28" fill="url(#g)" text-anchor="middle" letter-spacing="-1">NF</text><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#06b6d4"/><stop offset="100%" stop-color="#6366f1"/></linearGradient></defs></svg>`;
  } else {
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#09090b"/><rect x="2" y="2" width="60" height="60" rx="14" fill="none" stroke="url(#g)" stroke-width="3.2" opacity="0.85"/><text x="50%" y="58%" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="34" fill="url(#g)" text-anchor="middle">N</text><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f43f5e"/><stop offset="100%" stop-color="#ec4899"/></linearGradient></defs></svg>`;
  }

  res.header('Content-Type', 'image/svg+xml');
  res.header('Cache-Control', 'public, max-age=86400');
  res.send(svg);
});

// In-memory cache for production index.html to avoid disk reads on every request
let cachedProductionHtml: string | null = null;

// Dynamic Document Requests Handler for SSR and Rich Snippets!
async function handleDocumentRequest(req: express.Request, res: express.Response, viteInstance?: any) {
  const host = req.get('host') || 'localhost:3000';
  const urlPath = req.path;

  try {
    let html = '';
    if (process.env.NODE_ENV !== 'production' && viteInstance) {
      const indexPath = path.join(process.cwd(), 'index.html');
      if (fs.existsSync(indexPath)) {
        html = fs.readFileSync(indexPath, 'utf8');
        html = await viteInstance.transformIndexHtml(req.originalUrl, html);
      }
    } else {
      if (cachedProductionHtml) {
        html = cachedProductionHtml;
      } else {
        const distPath = path.join(process.cwd(), 'dist');
        const indexPath = path.join(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          html = fs.readFileSync(indexPath, 'utf8');
          cachedProductionHtml = html;
        }
      }
    }

    if (html) {
      const finalHtml = await injectDynamicSEO(html, host, urlPath);
      return res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml);
    }

    // fallback
    if (process.env.NODE_ENV !== 'production') {
      res.sendFile(path.join(process.cwd(), 'index.html'));
    } else {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    }
  } catch (err) {
    console.error('Error handling document request SSR:', err);
    if (process.env.NODE_ENV !== 'production') {
      res.sendFile(path.join(process.cwd(), 'index.html'));
    } else {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    }
  }
}

// Vite server integrations
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    
    // Serve static files via Vite middleware
    app.use(vite.middlewares);

    // Dynamic SEO routing in Development
    app.get(['/', '/movies', '/shows', '/saved', '/search', '/watch/:type/:id', '/watch/:type/:id/:slug'], async (req, res) => {
      await handleDocumentRequest(req, res, vite);
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Serves static files with aggressive caching (1 year max age and immutable) since assets are hashed, bypassing index.html
    app.use(express.static(distPath, {
      index: false,
      maxAge: '1y',
      immutable: true,
    }));
    app.get('*', async (req, res) => {
      await handleDocumentRequest(req, res);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`nepu server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
