/**
 * SmartCine Movie Sync Service
 * Fetches movie data from TMDB and upserts into MongoDB.
 * TMDB API: https://developers.themoviedb.org/3
 *
 * Architecture:
 *   TMDB API → normalizeMovie() → upsertMovie() → MongoDB
 *
 * No scraping. Official TMDB API used per their terms of service.
 */

import { Movie } from '../models/Movie.js';

const TMDB_BASE = process.env.MOVIE_API_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_KEY = process.env.MOVIE_API_KEY || '';
const TMDB_IMG = 'https://image.tmdb.org/t/p';
const RECENT_DAYS = parseInt(process.env.RECENT_RELEASE_DAYS || '14', 10);

// Internal sync stats
let lastSyncStats = {
  lastRun: null,
  added: 0,
  updated: 0,
  errors: 0,
  status: 'never',
};

/**
 * Fetch from TMDB with error handling
 */
const tmdbFetch = async (endpoint, extraParams = {}) => {
  if (!TMDB_KEY) throw new Error('MOVIE_API_KEY not configured');

  const params = new URLSearchParams({
    api_key: TMDB_KEY,
    region: 'IN',
    ...extraParams,
  });

  const url = `${TMDB_BASE}${endpoint}?${params}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) throw new Error(`TMDB ${res.status}: ${res.statusText}`);
  return res.json();
};

/**
 * Map TMDB genre IDs to genre names
 */
const GENRE_MAP = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  // Indian specific genres
  10759: 'Action & Adventure',
  10765: 'Sci-Fi & Fantasy',
};

/**
 * Map TMDB language codes to human-readable names
 */
const LANG_MAP = {
  te: 'Telugu',
  hi: 'Hindi',
  ta: 'Tamil',
  ml: 'Malayalam',
  kn: 'Kannada',
  en: 'English',
  mr: 'Marathi',
  bn: 'Bengali',
  pa: 'Punjabi',
  gu: 'Gujarati',
  fr: 'French',
  ja: 'Japanese',
  ko: 'Korean',
  es: 'Spanish',
  de: 'German',
};

const mapLanguage = (code) => LANG_MAP[code] || code?.toUpperCase() || 'English';

/**
 * Map TMDB language code to Industry Name
 */
const mapIndustry = (code) => {
  switch (code) {
    case 'te': return 'Tollywood';
    case 'ta': return 'Kollywood';
    case 'hi': return 'Bollywood';
    case 'ml': return 'Mollywood';
    case 'kn': return 'Sandalwood';
    case 'en': return 'Hollywood';
    default: return 'Other';
  }
};

/**
 * Normalize a TMDB movie object to our Movie schema
 */
const normalizeMovie = (tmdb) => {
  const genres = (tmdb.genre_ids || [])
    .map((id) => GENRE_MAP[id])
    .filter(Boolean);

  const langCode = tmdb.original_language || 'en';
  const originalLang = mapLanguage(langCode);
  const industry = mapIndustry(langCode);
  
  // Set default languages array to just the original language
  const languages = [originalLang];
  let dubbedLanguages = [];
  let isDubbed = false;
  
  // Mock dubbed logic for popular Indian/Hollywood movies if we want
  // In a real scenario we'd check alternative titles or translations endpoint
  if (['Hollywood', 'Bollywood', 'Tollywood', 'Kollywood'].includes(industry) && (tmdb.popularity > 20 || tmdb.vote_count > 100)) {
    if (originalLang !== 'Hindi') dubbedLanguages.push('Hindi');
    if (originalLang !== 'Telugu') dubbedLanguages.push('Telugu');
    if (originalLang !== 'Tamil') dubbedLanguages.push('Tamil');
    
    // Only keep up to 2-3 dubbed languages for realism
    dubbedLanguages = dubbedLanguages.slice(0, 3);
    
    if (dubbedLanguages.length > 0) {
      isDubbed = true;
      languages.push(...dubbedLanguages);
    }
  }

  const rating = tmdb.vote_average ? Math.min(5, tmdb.vote_average / 2) : 0; // Normalize 0-10 to 0-5

  const releaseDate = tmdb.release_date ? new Date(tmdb.release_date) : new Date();
  const now = new Date();
  const diffDays = (now - releaseDate) / (1000 * 60 * 60 * 24);

  let status = 'now-showing';
  if (diffDays < -7) status = 'coming-soon';
  else if (diffDays > 180) status = 'ended';

  return {
    title: tmdb.title || tmdb.name || 'Untitled',
    originalTitle: tmdb.original_title || tmdb.title || '',
    description: tmdb.overview || 'No description available.',
    poster: tmdb.poster_path ? `${TMDB_IMG}/w500${tmdb.poster_path}` : '',
    backdrop: tmdb.backdrop_path ? `${TMDB_IMG}/original${tmdb.backdrop_path}` : '',
    genre: genres.length ? genres : ['Drama'],
    language: [originalLang], // primary language
    languages: languages, // all languages including dubbed
    originalLanguage: originalLang,
    languageCode: langCode,
    isDubbed: isDubbed,
    dubbedLanguages: dubbedLanguages,
    industry: industry,
    region: tmdb.origin_country && tmdb.origin_country.length > 0 ? tmdb.origin_country[0] : 'Unknown',
    country: tmdb.origin_country && tmdb.origin_country.length > 0 ? tmdb.origin_country[0] : 'Unknown',
    duration: tmdb.runtime || Math.floor(Math.random() * (160 - 120 + 1) + 120), // Fallback random duration if missing
    certification: 'UA',
    releaseDate,
    rating: Math.round(rating * 10) / 10,
    ratingCount: tmdb.vote_count || 0,
    status,
    formats: ['2D', '3D'],
    externalMovieId: String(tmdb.id),
    source: 'tmdb',
    lastSyncedAt: new Date(),
  };
};

/**
 * Upsert a single normalized movie. Prevents duplicates via externalMovieId.
 */
const upsertMovie = async (normalized) => {
  if (!normalized.poster) {
    // Skip movies without posters
    return { action: 'skipped' };
  }

  const existing = await Movie.findOne({ externalMovieId: normalized.externalMovieId });

  if (existing) {
    await Movie.updateOne(
      { _id: existing._id },
      {
        $set: {
          poster: normalized.poster,
          backdrop: normalized.backdrop,
          rating: normalized.rating,
          ratingCount: normalized.ratingCount,
          status: normalized.status,
          description: normalized.description,
          genre: normalized.genre,
          lastSyncedAt: new Date(),
        },
      }
    );
    return { action: 'updated' };
  } else {
    await Movie.create(normalized);
    return { action: 'added' };
  }
};

/**
 * Fetch movie details (runtime) for a list of TMDB IDs
 */
const enrichWithRuntime = async (movies) => {
  const enriched = await Promise.all(
    movies.slice(0, 10).map(async (m) => {
      try {
        const details = await tmdbFetch(`/movie/${m.id}`);
        return { ...m, runtime: details.runtime || m.runtime };
      } catch {
        return m;
      }
    })
  );
  return enriched;
};

/**
 * Sync a page of TMDB results
 */
const syncPage = async (endpoint, params = {}, enrich = false) => {
  const data = await tmdbFetch(endpoint, { page: 1, ...params });
  let movies = data.results || [];

  if (enrich) {
    movies = await enrichWithRuntime(movies);
  }

  let added = 0;
  let updated = 0;

  for (const movie of movies) {
    try {
      const normalized = normalizeMovie(movie);
      const result = await upsertMovie(normalized);
      if (result.action === 'added') added++;
      else if (result.action === 'updated') updated++;
    } catch (err) {
      console.warn(`[Sync] Failed to upsert movie ${movie.title}:`, err.message);
    }
  }

  return { added, updated };
};

/**
 * Update isTrending flag for top-performing movies
 */
const updateTrendingFlags = async () => {
  // Reset all trending flags
  await Movie.updateMany({}, { $set: { isTrending: false } });

  // Set trending for top 20 by viewCount + recent ratingCount
  const trending = await Movie.find({ status: { $in: ['now-showing', 'ended'] } })
    .sort({ viewCount: -1, ratingCount: -1, rating: -1 })
    .limit(20);

  if (trending.length > 0) {
    await Movie.updateMany(
      { _id: { $in: trending.map((m) => m._id) } },
      { $set: { isTrending: true } }
    );
  }
};

/**
 * Full sync: Now Playing + Upcoming + Popular + Trending (India)
 */
export const runFullSync = async () => {
  if (!TMDB_KEY) {
    console.warn('[Sync] MOVIE_API_KEY not set — skipping TMDB sync');
    lastSyncStats = {
      lastRun: new Date(),
      added: 0,
      updated: 0,
      errors: 1,
      status: 'no_api_key',
    };
    return lastSyncStats;
  }

  console.log('[Sync] Starting full movie sync from TMDB...');
  let totalAdded = 0;
  let totalUpdated = 0;
  let errors = 0;

  const syncJobs = [
    { name: 'Now Playing (India)', endpoint: '/movie/now_playing', params: {} },
    { name: 'Upcoming (India)', endpoint: '/movie/upcoming', params: {} },
    { name: 'Popular (India)', endpoint: '/movie/popular', params: {} },
    { name: 'Trending Week', endpoint: '/trending/movie/week', params: {} },
    // Indian language specific
    { name: 'Telugu Movies', endpoint: '/discover/movie', params: { with_original_language: 'te', sort_by: 'release_date.desc' } },
    { name: 'Hindi Movies', endpoint: '/discover/movie', params: { with_original_language: 'hi', sort_by: 'release_date.desc' } },
    { name: 'Tamil Movies', endpoint: '/discover/movie', params: { with_original_language: 'ta', sort_by: 'release_date.desc' } },
  ];

  for (const job of syncJobs) {
    try {
      console.log(`[Sync] Syncing: ${job.name}...`);
      const result = await syncPage(job.endpoint, job.params);
      totalAdded += result.added;
      totalUpdated += result.updated;
      // Polite delay to respect TMDB rate limits (40 req/10s)
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.error(`[Sync] Error syncing ${job.name}:`, err.message);
      errors++;
    }
  }

  // Update trending flags after sync
  try {
    await updateTrendingFlags();
  } catch (err) {
    console.warn('[Sync] Failed to update trending flags:', err.message);
  }

  lastSyncStats = {
    lastRun: new Date(),
    added: totalAdded,
    updated: totalUpdated,
    errors,
    status: errors === 0 ? 'healthy' : errors < syncJobs.length ? 'partial' : 'failed',
  };

  console.log(`[Sync] Complete — Added: ${totalAdded}, Updated: ${totalUpdated}, Errors: ${errors}`);
  return lastSyncStats;
};

/**
 * Get last sync stats without running a sync
 */
export const getSyncStats = () => {
  const nextSync = lastSyncStats.lastRun
    ? new Date(lastSyncStats.lastRun.getTime() + 6 * 60 * 60 * 1000)
    : null;

  return {
    ...lastSyncStats,
    nextSync,
    apiKeyConfigured: !!TMDB_KEY,
  };
};

/**
 * Schedule periodic sync every N hours
 */
export const startSyncSchedule = (intervalHours = 6) => {
  if (!TMDB_KEY) {
    console.warn('[Sync] MOVIE_API_KEY not set — periodic sync disabled');
    return;
  }

  const intervalMs = intervalHours * 60 * 60 * 1000;
  console.log(`[Sync] Scheduled sync every ${intervalHours} hours`);

  // Run once after 30 seconds on startup (non-blocking)
  setTimeout(() => runFullSync().catch(console.error), 30_000);

  // Then every N hours
  setInterval(() => runFullSync().catch(console.error), intervalMs);
};
