/**
 * SmartCine IMDb Service
 * Enriches and provides IMDb metadata, ratings, and multi-language movie lookups.
 */

import { Movie } from '../models/Movie.js';

// Open OMDB / IMDb free proxy or key if present in env
const OMDB_KEY = process.env.OMDB_API_KEY || 'trilogy'; // common educational/demo key or fallback

/**
 * Fetch IMDb details for a movie title or IMDb ID
 */
export const fetchIMDbDetails = async (query, year = '') => {
  try {
    const isImdbId = query.startsWith('tt');
    const param = isImdbId ? `i=${encodeURIComponent(query)}` : `t=${encodeURIComponent(query)}`;
    const yearParam = year ? `&y=${encodeURIComponent(year)}` : '';
    
    const url = `https://www.omdbapi.com/?apikey=${OMDB_KEY}&${param}${yearParam}&plot=short`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    
    if (!res.ok) return null;
    const data = await res.json();
    
    if (data.Response === 'True') {
      const parsedRating = parseFloat(data.imdbRating);
      return {
        imdbId: data.imdbID || '',
        imdbRating: !isNaN(parsedRating) ? parsedRating : null,
        imdbVotes: data.imdbVotes || '',
        awards: data.Awards && data.Awards !== 'N/A' ? data.Awards : '',
        director: data.Director && data.Director !== 'N/A' ? data.Director : '',
        cast: data.Actors && data.Actors !== 'N/A' ? data.Actors.split(',').map(s => s.trim()) : [],
        certification: data.Rated && data.Rated !== 'N/A' ? data.Rated : 'UA',
      };
    }
    return null;
  } catch (err) {
    console.warn(`[IMDb Service] Error fetching IMDb details for ${query}:`, err.message);
    return null;
  }
};

/**
 * Enrich an existing movie in DB with IMDb data if missing
 */
export const enrichMovieWithIMDb = async (movie) => {
  if (movie.imdbRating && movie.imdbRating > 0 && movie.imdbId) {
    return movie;
  }

  const imdbData = await fetchIMDbDetails(movie.title, movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '');
  if (imdbData && imdbData.imdbRating) {
    movie.imdbId = imdbData.imdbId || movie.imdbId;
    movie.imdbRating = imdbData.imdbRating;
    movie.imdbVotes = imdbData.imdbVotes || movie.imdbVotes;
    if (imdbData.awards) movie.awards = imdbData.awards;
    await movie.save();
  }
  return movie;
};

/**
 * Get Top Rated Movies according to IMDb rating across all languages
 */
export const getTopIMDbMovies = async (limit = 12, language = null) => {
  const query = {
    status: { $in: ['now-showing', 'coming-soon'] },
    imdbRating: { $gte: 7.0 }
  };

  if (language && language !== 'All') {
    query.$or = [
      { originalLanguage: new RegExp(`^${language}$`, 'i') },
      { languages: new RegExp(`^${language}$`, 'i') },
      { language: new RegExp(`^${language}$`, 'i') }
    ];
  }

  return await Movie.find(query)
    .sort({ imdbRating: -1, ratingCount: -1 })
    .limit(limit);
};
