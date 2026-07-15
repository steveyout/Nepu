import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { mockMovies, mockShows, mockAll, getMockCast, getMockVideos, getMockSeasonDetails } from './src/mock_db';

// Load environment variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

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
  
  // Base URLs
  const urls = [
    { loc: `${APP_URL}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${APP_URL}/movies`, changefreq: 'weekly', priority: '0.8' },
    { loc: `${APP_URL}/shows`, changefreq: 'weekly', priority: '0.8' },
    { loc: `${APP_URL}/saved`, changefreq: 'daily', priority: '0.7' },
  ];

  // Add the trending mock movies for SEO coverage
  mockAll.forEach((item) => {
    urls.push({
      loc: `${APP_URL}/watch/${item.media_type}/${item.id}`,
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
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`nepu server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
