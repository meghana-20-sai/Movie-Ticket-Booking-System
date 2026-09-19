import { Show } from '../../models/Show.js';
import { Movie } from '../../models/Movie.js';

export const showtimeCommandService = {
  async searchShowtimes(entities = {}, user = null) {
    const filter = { status: 'active' };

    // Determine target date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (entities.date === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(dayAfter.getDate() + 1);
      filter.startTime = { $gte: tomorrow, $lt: dayAfter };
    } else {
      // Default to today and upcoming
      filter.startTime = { $gte: new Date() };
    }

    if (entities.format) {
      filter.format = entities.format;
    }

    // Match Movie if provided
    let matchedMovie = null;
    if (entities.movie || entities.genre || entities.language || entities.query) {
      const searchTerms = [entities.movie, entities.genre, entities.language, entities.query].filter(Boolean);
      matchedMovie = await Movie.findOne({
        status: 'now-showing',
        $or: searchTerms.map((term) => ({
          $or: [
            { title: { $regex: term, $options: 'i' } },
            { genre: { $in: [new RegExp(term, 'i')] } },
            { language: { $in: [new RegExp(term, 'i')] } },
          ],
        })),
      });

      if (matchedMovie) {
        filter.movie = matchedMovie._id;
      }
    }

    let sort = { startTime: 1 };
    if (entities.isCheapest || (entities.maxBudget && entities.maxBudget < 500)) {
      sort = { basePrice: 1, startTime: 1 };
    }

    const shows = await Show.find(filter)
      .populate('movie', 'title poster backdrop duration rating certification language formats')
      .populate('theatre', 'name city address')
      .populate('screen', 'name format')
      .sort(sort)
      .limit(6);

    return {
      type: 'SHOWTIMES_LIST',
      message: shows.length
        ? `Found ${shows.length} upcoming showtime(s)${matchedMovie ? ` for "${matchedMovie.title}"` : ''}:`
        : `No exact upcoming showtimes found. Here are currently active screenings:`,
      shows: shows.length
        ? shows
        : await Show.find({ status: 'active', startTime: { $gte: new Date() } })
            .populate('movie', 'title poster backdrop duration rating')
            .populate('theatre', 'name city')
            .populate('screen', 'name format')
            .limit(4),
      matchedMovie,
    };
  },
};
