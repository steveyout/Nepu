import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { mockMovies, mockShows, mockAll, getMockCast, getMockVideos, getMockSeasonDetails } from './src/mock_db';

// Load environment variables
dotenv.config();

const app = express();
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

// Inject SEO tags dynamically based on the requested host
function injectSEOTags(html: string, host: string): string {
  const brand = getBrandFromHost(host);
  let title = '';
  let desc = '';
  let keywords = '';
  let svg = '';

  if (brand === 'cineby') {
    title = 'Cineby – Stream HD Movies & TV Shows for Free';
    desc = 'Stream the latest movies and TV shows for free in HD quality on Cineby. Browse trending content, get personalized recommendations, and build your ultimate watchlist today without any ads or subscriptions.';
    keywords = 'cineby, cineby works, cineby rest, cineby stream, cineby app, cineby proxy, cineby alternative, free movies, stream tv shows, free movie streaming, cinema online, cineby watch, watch cineby free';
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#09090b"/><rect x="2" y="2" width="60" height="60" rx="14" fill="none" stroke="url(#g)" stroke-width="3.2" opacity="0.85"/><text x="50%" y="58%" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="34" fill="url(#g)" text-anchor="middle">C</text><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ef4444"/><stop offset="100%" stop-color="#991b1b"/></linearGradient></defs></svg>`;
  } else if (brand === 'coreflix') {
    title = 'Coreflix | Stream Movies & TV Shows Online';
    desc = 'Stream the latest movies and TV shows on Coreflix. Browse trending content, get personalized recommendations, and build your ultimate watchlist today.';
    keywords = 'coreflix, coreflix online, coreflix stream, watch movies coreflix, free movies, stream tv shows free, coreflix app, coreflix proxy, coreflix alternative, watch coreflix free';
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#09090b"/><rect x="2" y="2" width="60" height="60" rx="14" fill="none" stroke="url(#g)" stroke-width="3.2" opacity="0.85"/><text x="51%" y="58%" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="28" fill="url(#g)" text-anchor="middle" letter-spacing="-1">CF</text><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#06b6d4"/><stop offset="100%" stop-color="#6366f1"/></linearGradient></defs></svg>`;
  } else if (brand === 'nepoflix') {
    title = 'Nepoflix – Premium Glassmorphic Movie & TV Streaming';
    desc = 'Nepoflix is a sleek, modern, lightning-fast streaming site featuring cyan glassmorphism, dynamic servers, and robust search indices.';
    keywords = 'nepoflix, nepoflix stream, nepoflix movie player, free movies, stream tv shows, cyan glassmorphism player, secure stream, responsive video, watch nepoflix';
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#09090b"/><rect x="2" y="2" width="60" height="60" rx="14" fill="none" stroke="url(#g)" stroke-width="3.2" opacity="0.85"/><text x="51%" y="58%" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="28" fill="url(#g)" text-anchor="middle" letter-spacing="-1">NF</text><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#06b6d4"/><stop offset="100%" stop-color="#6366f1"/></linearGradient></defs></svg>`;
  } else {
    title = 'Nepu – Watch Free Movies & TV Shows in High Quality';
    desc = 'Nepu – Stream HD movies and TV shows for free, ad-free, and no subscriptions needed. Enjoy endless entertainment instantly on Nepu!';
    keywords = 'nepu, nepu stream, nepu movie player, free movies, stream tv shows, pinkish glassmorphism player, vidking premium, responsive bottom bar, clean typography, nepu site, watch nepu';
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#09090b"/><rect x="2" y="2" width="60" height="60" rx="14" fill="none" stroke="url(#g)" stroke-width="3.2" opacity="0.85"/><text x="50%" y="58%" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="34" fill="url(#g)" text-anchor="middle">N</text><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f43f5e"/><stop offset="100%" stop-color="#ec4899"/></linearGradient></defs></svg>`;
  }

  // Convert SVG to Base64 for index.html link tag
  const base64Svg = Buffer.from(svg).toString('base64');

  let result = html;
  
  // Replace title
  result = result.replace(/<title>[^]*?<\/title>/gi, `<title>${title}</title>`);
  
  // Replace description meta tag
  if (result.includes('name="description"')) {
    result = result.replace(/<meta\s+name="description"\s+content="[^]*?"\s*\/?>/gi, `<meta name="description" content="${desc}" />`);
  } else {
    result = result.replace('</head>', `  <meta name="description" content="${desc}" />\n</head>`);
  }

  // Replace keywords meta tag
  if (result.includes('name="keywords"')) {
    result = result.replace(/<meta\s+name="keywords"\s+content="[^]*?"\s*\/?>/gi, `<meta name="keywords" content="${keywords}" />`);
  } else {
    result = result.replace('</head>', `  <meta name="keywords" content="${keywords}" />\n</head>`);
  }

  // Inject/replace favicon tag with the correct base64 SVG data URI
  const faviconTag = `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,${base64Svg}" />`;
  if (result.includes('rel="icon"') || result.includes('rel=icon')) {
    result = result.replace(/<link\s+rel="[^]*?icon"\s+[^>]*?\/?>/gi, faviconTag);
  } else {
    result = result.replace('</head>', `  ${faviconTag}\n</head>`);
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

  // Add the trending mock movies for SEO coverage
  mockAll.forEach((item) => {
    urls.push({
      loc: `${dynamicDomain}/watch/${item.media_type}/${item.id}`,
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

// Dynamic /favicon.ico handler for search engines and direct requests!
app.get('/favicon.ico', (req, res) => {
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

// Vite server integrations
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Serves static files, but index.html is bypassed to run dynamic SEO meta-tags injection
    app.use(express.static(distPath, { index: false }));
    app.get('*', (req, res) => {
      const host = req.get('host') || '';
      try {
        const filePath = path.join(distPath, 'index.html');
        if (fs.existsSync(filePath)) {
          let html = fs.readFileSync(filePath, 'utf8');
          html = injectSEOTags(html, host);
          res.send(html);
        } else {
          res.sendFile(filePath);
        }
      } catch (err) {
        console.error('Error serving dynamic index.html:', err);
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`nepu server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
