import { Show } from '../models/Show.js';
import { Screen } from '../models/Screen.js';
import { Theatre } from '../models/Theatre.js';
import { Movie } from '../models/Movie.js';
import { seatLockService } from '../services/seatLockService.js';

// Helper to convert "HH:MM" to total minutes from midnight for collision detection
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

// @desc    Get shows with filtering and theatre grouping
// @route   GET /api/shows
export const getShows = async (req, res) => {
  try {
    const { movieId, theatreId, city, date, format } = req.query;
    const query = { status: { $ne: 'cancelled' } };

    if (movieId) query.movieId = movieId;
    if (theatreId) query.theatreId = theatreId;
    if (date) query.date = date;
    if (format) query.format = format;

    // Filter by city if supplied
    if (city && city !== 'all') {
      const cityTheatres = await Theatre.find({
        city: new RegExp(`^${city.trim()}$`, 'i'),
        isActive: true,
      }).select('_id');
      const theatreIds = cityTheatres.map((t) => t._id);
      query.theatreId = { $in: theatreIds };
    }

    const shows = await Show.find(query)
      .populate('movieId', 'title poster duration certification language genre rating')
      .populate('theatreId', 'name address city location amenities')
      .populate('screenId', 'name format capacity')
      .sort({ date: 1, startTime: 1 });

    // Calculate occupancy status for each show
    const enrichedShows = shows.map((show) => {
      const totalCapacity = show.screenId?.capacity || 80;
      const bookedCount = (show.bookedSeats || []).length;
      const lockedList = seatLockService.getLockedSeats(show._id);
      const lockedCount = lockedList.length;
      const occupiedTotal = bookedCount + lockedCount;
      const remainingSeats = Math.max(0, totalCapacity - occupiedTotal);
      const occupancyRate = totalCapacity > 0 ? (occupiedTotal / totalCapacity) * 100 : 0;

      let availabilityStatus = 'Available';
      if (remainingSeats === 0) {
        availabilityStatus = 'Sold Out';
      } else if (occupancyRate >= 85) {
        availabilityStatus = 'Almost Full';
      } else if (occupancyRate >= 50) {
        availabilityStatus = 'Filling Fast';
      }

      return {
        ...show.toObject(),
        remainingSeats,
        occupancyRate: Math.round(occupancyRate),
        availabilityStatus,
      };
    });

    res.json({
      success: true,
      data: enrichedShows,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get shows for a specific movie grouped by theatre and date
// @route   GET /api/shows/movie/:movieId
export const getShowsForMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { date, city } = req.query;

    const query = { movieId, status: { $ne: 'cancelled' } };
    if (date) query.date = date;

    if (city && city !== 'all') {
      const cityTheatres = await Theatre.find({
        city: new RegExp(`^${city.trim()}$`, 'i'),
        isActive: true,
      }).select('_id');
      const theatreIds = cityTheatres.map((t) => t._id);
      query.theatreId = { $in: theatreIds };
    }

    const shows = await Show.find(query)
      .populate('theatreId', 'name address city amenities')
      .populate('screenId', 'name format capacity')
      .sort({ startTime: 1 });

    // Group by theatre
    const theatreMap = new Map();

    for (const show of shows) {
      if (!show.theatreId) continue;
      const theatreKey = show.theatreId._id.toString();

      if (!theatreMap.has(theatreKey)) {
        theatreMap.set(theatreKey, {
          theatre: show.theatreId,
          showsByFormat: {},
        });
      }

      const theatreData = theatreMap.get(theatreKey);
      const format = show.format || '2D';

      if (!theatreData.showsByFormat[format]) {
        theatreData.showsByFormat[format] = [];
      }

      const totalCapacity = show.screenId?.capacity || 80;
      const bookedCount = (show.bookedSeats || []).length;
      const lockedCount = seatLockService.getLockedSeats(show._id).length;
      const occupiedTotal = bookedCount + lockedCount;
      const remainingSeats = Math.max(0, totalCapacity - occupiedTotal);
      const occupancyRate = totalCapacity > 0 ? (occupiedTotal / totalCapacity) * 100 : 0;

      let availabilityStatus = 'Available';
      if (remainingSeats === 0) availabilityStatus = 'Sold Out';
      else if (occupancyRate >= 85) availabilityStatus = 'Almost Full';
      else if (occupancyRate >= 50) availabilityStatus = 'Filling Fast';

      theatreData.showsByFormat[format].push({
        _id: show._id,
        startTime: show.startTime,
        endTime: show.endTime,
        format: show.format,
        language: show.language,
        basePrice: show.basePrice,
        screenName: show.screenId?.name || 'Screen 1',
        remainingSeats,
        availabilityStatus,
      });
    }

    const result = Array.from(theatreMap.values());

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get available upcoming dates for a movie
// @route   GET /api/shows/movie/:movieId/dates
export const getAvailableDates = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { city } = req.query;

    const query = { movieId, status: { $ne: 'cancelled' } };

    if (city && city !== 'all') {
      const cityTheatres = await Theatre.find({
        city: new RegExp(`^${city.trim()}$`, 'i'),
        isActive: true,
      }).select('_id');
      query.theatreId = { $in: cityTheatres.map((t) => t._id) };
    }

    const distinctDates = await Show.find(query).distinct('date');
    const sortedDates = distinctDates.sort();

    res.json({
      success: true,
      data: sortedDates,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single show details
// @route   GET /api/shows/:id
export const getShowById = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movieId')
      .populate('theatreId')
      .populate('screenId');

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    res.json({ success: true, data: show });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create show with conflict & overlap detection (Admin)
// @route   POST /api/shows
export const createShow = async (req, res) => {
  try {
    const { movieId, theatreId, screenId, date, startTime, endTime, language, format, basePrice } = req.body;

    // Check movie, theatre, screen exist
    const [movie, theatre, screen] = await Promise.all([
      Movie.findById(movieId),
      Theatre.findById(theatreId),
      Screen.findById(screenId),
    ]);

    if (!movie || !theatre || !screen) {
      return res.status(400).json({ success: false, message: 'Invalid movie, theatre, or screen reference.' });
    }

    // Overlap validation on the same screen and date
    const newStart = timeToMinutes(startTime);
    const newEnd = timeToMinutes(endTime);

    if (newEnd <= newStart) {
      return res.status(400).json({ success: false, message: 'End time must be later than start time.' });
    }

    const existingShows = await Show.find({
      screenId,
      date,
      status: { $ne: 'cancelled' },
    });

    for (const s of existingShows) {
      const existingStart = timeToMinutes(s.startTime);
      const existingEnd = timeToMinutes(s.endTime);

      // Overlap condition: (StartA < EndB) and (EndA > StartB)
      if (newStart < existingEnd && newEnd > existingStart) {
        return res.status(409).json({
          success: false,
          message: `Schedule conflict: An existing show is already scheduled on ${screen.name} from ${s.startTime} to ${s.endTime}.`,
        });
      }
    }

    const show = await Show.create({
      movieId,
      theatreId,
      screenId,
      date,
      startTime,
      endTime,
      language: language || movie.language[0] || 'English',
      format: format || screen.format || '2D',
      basePrice: basePrice || 200,
    });

    res.status(201).json({
      success: true,
      message: 'Show scheduled successfully',
      data: show,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update show (Admin)
// @route   PUT /api/shows/:id
export const updateShow = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    const { date, startTime, endTime, language, format, basePrice, status } = req.body;

    if (startTime && endTime) {
      const newStart = timeToMinutes(startTime);
      const newEnd = timeToMinutes(endTime);
      if (newEnd <= newStart) {
        return res.status(400).json({ success: false, message: 'End time must be after start time' });
      }

      // Check conflict excluding current show
      const conflicts = await Show.find({
        _id: { $ne: show._id },
        screenId: show.screenId,
        date: date || show.date,
        status: { $ne: 'cancelled' },
      });

      for (const s of conflicts) {
        const exStart = timeToMinutes(s.startTime);
        const exEnd = timeToMinutes(s.endTime);
        if (newStart < exEnd && newEnd > exStart) {
          return res.status(409).json({
            success: false,
            message: `Conflict with show running ${s.startTime} - ${s.endTime}`,
          });
        }
      }
    }

    if (date) show.date = date;
    if (startTime) show.startTime = startTime;
    if (endTime) show.endTime = endTime;
    if (language) show.language = language;
    if (format) show.format = format;
    if (basePrice !== undefined) show.basePrice = basePrice;
    if (status) show.status = status;

    const updated = await show.save();

    res.json({
      success: true,
      message: 'Show updated successfully',
      data: updated,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete/Cancel show (Admin)
// @route   DELETE /api/shows/:id
export const deleteShow = async (req, res) => {
  try {
    const show = await Show.findByIdAndDelete(req.params.id);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }
    res.json({ success: true, message: 'Show deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
