import { Movie } from '../../models/Movie.js';
import { Booking } from '../../models/Booking.js';
import { Show } from '../../models/Show.js';

export const movieCommandService = {
  async searchMovies(entities = {}, user = null) {
    const filter = { status: { $nin: ['archived'] } };

    // Category-based intent routing
    if (entities.category) {
      const cat = entities.category.toLowerCase();
      if (cat.includes('new') || cat.includes('release') || cat.includes('latest')) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filter.releaseDate = { $gte: thirtyDaysAgo, $lte: new Date() };
      } else if (cat.includes('upcoming') || cat.includes('coming')) {
        filter.status = 'coming-soon';
      } else if (cat.includes('trending')) {
        filter.isTrending = true;
      } else if (cat.includes('popular')) {
        // Will sort by ratingCount below
      } else if (cat.includes('now') || cat.includes('playing') || cat.includes('showing')) {
        filter.status = 'now-showing';
      }
    } else {
      // Default to non-archived
      if (!entities.query) filter.status = { $in: ['now-showing', 'coming-soon'] };
    }

    if (entities.genre) {
      filter.genre = { $in: [new RegExp(entities.genre, 'i')] };
    }

    if (entities.language) {
      filter.languages = { $in: [new RegExp(entities.language, 'i')] };
    }

    if (entities.industry) {
      filter.industry = new RegExp(entities.industry, 'i');
    }

    if (entities.format) {
      filter.formats = { $in: [entities.format] };
    }

    let query = Movie.find(filter);

    if (entities.query && !entities.genre && !entities.language) {
      const searchFilter = {
        ...filter,
        $or: [
          { title: { $regex: entities.query, $options: 'i' } },
          { genre: { $in: [new RegExp(entities.query, 'i')] } },
          { language: { $in: [new RegExp(entities.query, 'i')] } },
          { director: { $regex: entities.query, $options: 'i' } },
          { cast: { $in: [new RegExp(entities.query, 'i')] } },
        ],
      };
      query = Movie.find(searchFilter);
    }

    // Sort by category intent
    let sortOption = { rating: -1, releaseDate: -1 };
    if (entities.category?.toLowerCase().includes('new') || entities.category?.toLowerCase().includes('latest')) {
      sortOption = { releaseDate: -1 };
    } else if (entities.category?.toLowerCase().includes('popular')) {
      sortOption = { ratingCount: -1, rating: -1 };
    } else if (entities.category?.toLowerCase().includes('trending')) {
      sortOption = { viewCount: -1, ratingCount: -1 };
    }

    const movies = await query.sort(sortOption).limit(8);

    const categoryLabel = entities.category || entities.genre || entities.language || entities.query || 'movies';

    return {
      type: 'MOVIES_LIST',
      message: movies.length
        ? `Found ${movies.length} ${categoryLabel} title(s):`
        : `No movies found matching "${categoryLabel}". Here are top trending movies:`,
      movies: movies.length
        ? movies
        : await Movie.find({ status: { $nin: ['archived'] } }).sort({ viewCount: -1 }).limit(6),
      count: movies.length,
    };
  },

  async recommendMovie(entities = {}, user = null) {
    let preferredGenres = [];
    let preferredLanguages = [];

    // If user is authenticated, examine past booking history for personalized weighting
    if (user && user._id) {
      const pastBookings = await Booking.find({ userId: user._id })
        .limit(5);

      if (pastBookings.length > 0) {
        const pastMovieIds = pastBookings.map((b) => b.movieId).filter(Boolean);
        const pastMovies = await Movie.find({ _id: { $in: pastMovieIds } });
        pastMovies.forEach((m) => {
          preferredGenres.push(...m.genre);
          preferredLanguages.push(...m.language);
        });
      }
    }

    // Build recommendation query
    let filter = { status: { $in: ['now-showing', 'coming-soon'] } };
    if (entities.genre) {
      filter.genre = { $in: [new RegExp(entities.genre, 'i')] };
    } else if (preferredGenres.length > 0) {
      filter.genre = { $in: preferredGenres };
    }

    if (entities.language) {
      filter.languages = { $in: [new RegExp(entities.language, 'i')] };
    }

    if (entities.industry) {
      filter.industry = new RegExp(entities.industry, 'i');
    }

    let recommendations = await Movie.find(filter)
      .sort({ isFeatured: -1, rating: -1, releaseDate: -1 })
      .limit(6);

    if (!recommendations.length) {
      recommendations = await Movie.find({ status: { $nin: ['archived'] } })
        .sort({ rating: -1, viewCount: -1 })
        .limit(6);
    }

    return {
      type: 'RECOMMENDATIONS',
      message: user
        ? `🎯 Personalized recommendations based on your preferences & top ratings:`
        : `⭐ Top-rated movies trending in theatres today:`,
      movies: recommendations,
      reason: entities.genre
        ? `Matched highest rated in ${entities.genre}`
        : 'Curated based on box office acclaim, audience reviews, and trending activity',
    };
  },
};
