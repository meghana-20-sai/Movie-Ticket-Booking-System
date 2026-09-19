import { Movie } from '../../models/Movie.js';
import { Booking } from '../../models/Booking.js';

export const movieCommandService = {
  async searchMovies(entities = {}, user = null) {
    const filter = { status: 'now-showing' };

    if (entities.genre) {
      filter.genre = { $in: [new RegExp(entities.genre, 'i')] };
    }

    if (entities.language) {
      filter.language = { $in: [new RegExp(entities.language, 'i')] };
    }

    if (entities.format) {
      filter.formats = { $in: [entities.format] };
    }

    let query = Movie.find(filter);

    if (entities.query && !entities.genre && !entities.language) {
      query = Movie.find({
        status: 'now-showing',
        $or: [
          { title: { $regex: entities.query, $options: 'i' } },
          { genre: { $in: [new RegExp(entities.query, 'i')] } },
          { language: { $in: [new RegExp(entities.query, 'i')] } },
        ],
      });
    }

    const movies = await query.sort({ rating: -1, releaseDate: -1 }).limit(6);

    return {
      type: 'MOVIES_LIST',
      message: movies.length
        ? `Found ${movies.length} cinema title(s) matching your criteria:`
        : `No movies found matching "${entities.query || entities.genre || entities.language}". Here are top trending movies:`,
      movies: movies.length ? movies : await Movie.find({ status: 'now-showing' }).limit(4),
      count: movies.length,
    };
  },

  async recommendMovie(entities = {}, user = null) {
    let preferredGenres = [];
    let preferredLanguages = [];

    // If user is authenticated, examine past booking history for personalized weighting
    if (user && user._id) {
      const pastBookings = await Booking.find({ user: user._id })
        .populate('show')
        .limit(5);

      const pastMovieIds = pastBookings.map((b) => b.show?.movie).filter(Boolean);
      if (pastMovieIds.length > 0) {
        const pastMovies = await Movie.find({ _id: { $in: pastMovieIds } });
        pastMovies.forEach((m) => {
          preferredGenres.push(...m.genre);
          preferredLanguages.push(...m.language);
        });
      }
    }

    // Build recommendation query
    let filter = { status: 'now-showing' };
    if (entities.genre) {
      filter.genre = { $in: [new RegExp(entities.genre, 'i')] };
    } else if (preferredGenres.length > 0) {
      filter.genre = { $in: preferredGenres };
    }

    if (entities.language) {
      filter.language = { $in: [new RegExp(entities.language, 'i')] };
    }

    let recommendations = await Movie.find(filter)
      .sort({ rating: -1, releaseDate: -1 })
      .limit(4);

    if (!recommendations.length) {
      recommendations = await Movie.find({ status: 'now-showing' })
        .sort({ rating: -1 })
        .limit(4);
    }

    return {
      type: 'RECOMMENDATIONS',
      message: user
        ? `🎯 Personalized recommendations based on your preferences & top critic ratings:`
        : `⭐ Top-rated movies trending in theatres today:`,
      movies: recommendations,
      reason: entities.genre
        ? `Matched highest rated in ${entities.genre}`
        : 'Curated based on box office acclaim and audience review score',
    };
  },
};
