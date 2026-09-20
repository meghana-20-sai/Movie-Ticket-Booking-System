/**
 * SmartCine Movie Controller — Extended
 * All original handlers preserved + new category endpoints added.
 */

import { Movie } from '../models/Movie.js';
import { Show } from '../models/Show.js';
import { Booking } from '../models/Booking.js';
import { runFullSync, getSyncStats } from '../services/movieSyncService.js';

const RECENT_DAYS = parseInt(process.env.RECENT_RELEASE_DAYS || '14', 10);

// ─── Helper ────────────────────────────────────────────────────
const paginate = (req, defaultLimit = 20) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || defaultLimit);
  return { page, limit, skip: (page - 1) * limit };
};

const buildBaseFilter = (req) => {
  const { genre, language, format, minRating, search, industry, isDubbed } = req.query;
  const paramGenre = req.params.genre;
  const paramLanguage = req.params.language;
  const paramIndustry = req.params.industry;

  const query = {};

  const targetGenres = genre || paramGenre;
  if (targetGenres) {
    const genres = targetGenres.split(',').map((g) => g.trim());
    query.genre = { $in: genres.map((g) => new RegExp(g, 'i')) };
  }

  const targetLanguages = language || paramLanguage;
  if (targetLanguages) {
    const languages = targetLanguages.split(',').map((l) => l.trim());
    const langRegexes = languages.map((l) => new RegExp(l, 'i'));
    query.$or = [
      { languages: { $in: langRegexes } },
      { language: { $in: langRegexes } },
      { originalLanguage: { $in: langRegexes } },
    ];
  }

  const targetIndustry = industry || paramIndustry;
  if (targetIndustry) {
    query.industry = new RegExp(targetIndustry, 'i');
  }

  if (isDubbed !== undefined) {
    query.isDubbed = isDubbed === 'true';
  }

  if (format) {
    const formats = format.split(',').map((f) => f.trim());
    query.formats = { $in: formats };
  }
  if (minRating) {
    query.rating = { $gte: Number(minRating) };
  }
  const targetSearch = search || req.query.q;
  if (targetSearch && targetSearch.trim() !== '') {
    const searchRegex = new RegExp(targetSearch.trim(), 'i');
    query.$or = [
      { title: searchRegex },
      { originalTitle: searchRegex },
      { director: searchRegex },
      { cast: { $in: [searchRegex] } },
      { genre: { $in: [searchRegex] } },
      { description: searchRegex },
    ];
  }
  return query;
};

const buildSort = (sortParam) => {
  switch (sortParam) {
    case 'imdb':
    case 'imdbRating':
      return { imdbRating: -1, ratingCount: -1 };
    case 'popular':
    case 'popularity':
      return { ratingCount: -1, rating: -1 };
    case 'rating':
      return { rating: -1 };
    case 'a-z':
      return { title: 1 };
    case 'z-a':
      return { title: -1 };
    case 'releaseDate':
    case 'latest':
    default:
      return { releaseDate: -1 };
  }
};

// ─── GET /api/movies ───────────────────────────────────────────
export const getMovies = async (req, res) => {
  try {
    const { status, sort } = req.query;
    const { page, limit, skip } = paginate(req, 20);

    const query = buildBaseFilter(req);
    if (status) query.status = status;

    const sortOption = buildSort(sort);
    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query).sort(sortOption).skip(skip).limit(limit);

    res.json({
      success: true,
      data: movies,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/movies/now-showing ──────────────────────────────
// Only movies that actually have active/future shows
export const getNowShowing = async (req, res) => {
  try {
    const { page, limit, skip } = paginate(req, 12);
    const query = buildBaseFilter(req);

    // Find movies that have future shows
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeShows = await Show.distinct('movieId', {
      date: { $gte: today.toISOString().split('T')[0] },
      status: { $in: ['scheduled', 'open'] },
    });

    query._id = { $in: activeShows };

    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .sort({ isFeatured: -1, rating: -1, releaseDate: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: movies,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/movies/new-releases ────────────────────────────
export const getNewReleases = async (req, res) => {
  try {
    const { page, limit, skip } = paginate(req, 12);
    const query = buildBaseFilter(req);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    query.releaseDate = { $gte: thirtyDaysAgo, $lte: new Date() };
    query.status = { $nin: ['archived'] };

    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .sort({ releaseDate: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: movies,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/movies/recent ───────────────────────────────────
export const getRecentlyReleased = async (req, res) => {
  try {
    const { page, limit, skip } = paginate(req, 12);
    const query = buildBaseFilter(req);

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - RECENT_DAYS);
    query.releaseDate = { $gte: daysAgo, $lte: new Date() };
    query.status = { $nin: ['archived'] };

    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .sort({ releaseDate: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: movies,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit), recentDays: RECENT_DAYS },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/movies/upcoming ────────────────────────────────
export const getUpcoming = async (req, res) => {
  try {
    const { page, limit, skip } = paginate(req, 12);
    const query = buildBaseFilter(req);

    // Upcoming: release date in the future OR status = coming-soon
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    query.$or = [
      { releaseDate: { $gte: tomorrow } },
      { status: 'coming-soon' },
    ];

    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .sort({ releaseDate: 1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: movies,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/movies/popular ─────────────────────────────────
export const getPopular = async (req, res) => {
  try {
    const { page, limit, skip } = paginate(req, 12);
    const query = buildBaseFilter(req);
    query.status = { $nin: ['archived'] };

    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .sort({ ratingCount: -1, rating: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: movies,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/movies/trending ────────────────────────────────
export const getTrending = async (req, res) => {
  try {
    const { page, limit, skip } = paginate(req, 12);
    const query = buildBaseFilter(req);
    query.status = { $nin: ['archived'] };

    // Primary: isTrending flag; fallback: viewCount + ratings
    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .sort({ isTrending: -1, viewCount: -1, ratingCount: -1, rating: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: movies,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/movies/featured ────────────────────────────────
export const getFeatured = async (req, res) => {
  try {
    const { limit } = paginate(req, 8);
    const query = buildBaseFilter(req);
    query.isFeatured = true;
    query.status = { $nin: ['archived'] };

    const movies = await Movie.find(query).sort({ releaseDate: -1 }).limit(limit);

    res.json({ success: true, data: movies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/movies/:id ─────────────────────────────────────
export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    // Fetch related movies (same genre)
    const related = await Movie.find({
      _id: { $ne: movie._id },
      genre: { $in: movie.genre },
      status: { $nin: ['archived'] },
    })
      .sort({ rating: -1 })
      .limit(6);

    res.json({ success: true, data: movie, related });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PATCH /api/movies/:id/view ──────────────────────────────
export const incrementView = async (req, res) => {
  try {
    await Movie.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /api/movies (Admin) ─────────────────────────────────
export const createMovie = async (req, res) => {
  try {
    const movie = await Movie.create({ ...req.body, source: 'manual' });
    res.status(201).json({ success: true, message: 'Movie added successfully', data: movie });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── PUT /api/movies/:id (Admin) ──────────────────────────────
export const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.json({ success: true, message: 'Movie updated successfully', data: movie });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ─── DELETE /api/movies/:id (Admin) ──────────────────────────
// Archives instead of hard delete to preserve booking history
export const deleteMovie = async (req, res) => {
  try {
    // Check if any bookings reference this movie
    const bookingCount = await Booking.countDocuments({ movieId: req.params.id });
    if (bookingCount > 0) {
      // Archive instead of delete to preserve history
      const movie = await Movie.findByIdAndUpdate(
        req.params.id,
        { status: 'archived' },
        { new: true }
      );
      if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
      return res.json({ success: true, message: 'Movie archived (has booking history)', archived: true });
    }

    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });
    res.json({ success: true, message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /api/movies/sync (Admin) ───────────────────────────
export const syncMoviesNow = async (req, res) => {
  try {
    const stats = await runFullSync();
    res.json({ success: true, message: 'Movie sync completed', data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sync failed: ' + error.message });
  }
};

// ─── GET /api/movies/sync/status (Admin) ─────────────────────
export const getSyncStatus = async (req, res) => {
  try {
    const stats = getSyncStats();
    const totalMovies = await Movie.countDocuments();

    // By status
    const byStatus = await Movie.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const statusMap = {};
    byStatus.forEach((s) => { statusMap[s._id] = s.count; });

    // By language (originalLanguage field) — top languages
    const byLanguage = await Movie.aggregate([
      { $match: { originalLanguage: { $exists: true, $ne: null, $ne: '' } } },
      { $group: { _id: '$originalLanguage', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    const languageMap = {};
    byLanguage.forEach((l) => { languageMap[l._id] = l.count; });

    // By industry
    const byIndustry = await Movie.aggregate([
      { $match: { industry: { $exists: true, $ne: null, $ne: '' } } },
      { $group: { _id: '$industry', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const industryMap = {};
    byIndustry.forEach((i) => { industryMap[i._id] = i.count; });

    res.json({
      success: true,
      data: {
        sync: stats,
        catalog: {
          total: totalMovies,
          nowShowing: statusMap['now-showing'] || 0,
          comingSoon: statusMap['coming-soon'] || 0,
          ended: statusMap['ended'] || 0,
          archived: statusMap['archived'] || 0,
        },
        languages: languageMap,
        industries: industryMap,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PATCH /api/movies/:id/featured (Admin) ──────────────────
export const toggleFeatured = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found' });

    movie.isFeatured = !movie.isFeatured;
    await movie.save();
    res.json({ success: true, data: { isFeatured: movie.isFeatured }, message: `Movie ${movie.isFeatured ? 'featured' : 'unfeatured'}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/movies/imdb/top-rated ─────────────────────────
export const getTopIMDbMoviesHandler = async (req, res) => {
  try {
    const limit = Math.min(50, parseInt(req.query.limit, 10) || 12);
    const { language } = req.query;

    const query = {
      imdbRating: { $gte: 7.0 },
    };

    if (language && language !== 'All') {
      query.$or = [
        { originalLanguage: new RegExp(`^${language}$`, 'i') },
        { languages: new RegExp(`^${language}$`, 'i') },
        { language: new RegExp(`^${language}$`, 'i') },
      ];
    }

    const movies = await Movie.find(query)
      .sort({ imdbRating: -1, ratingCount: -1 })
      .limit(limit);

    res.json({
      success: true,
      count: movies.length,
      data: movies,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
