import { Show } from '../models/Show.js';
import { Screen } from '../models/Screen.js';
import { Seat } from '../models/Seat.js';
import { seatLockService } from '../services/seatLockService.js';

// @desc    Get complete seat layout for a show with booked and locked statuses
// @route   GET /api/shows/:showId/seats
export const getSeatsForShow = async (req, res) => {
  try {
    const { showId } = req.params;
    const currentUserId = req.user ? req.user._id.toString() : req.query.userId || null;

    const show = await Show.findById(showId)
      .populate('movieId', 'title duration certification poster')
      .populate('theatreId', 'name address city')
      .populate('screenId', 'name format seatLayout capacity');

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    let seats = await Seat.find({ screenId: show.screenId._id, isActive: true }).sort({
      row: 1,
      number: 1,
    });

    // If no seat documents found, generate dynamically from screen layout
    if (seats.length === 0 && show.screenId.seatLayout && show.screenId.seatLayout.rows) {
      const generatedSeats = [];
      for (const r of show.screenId.seatLayout.rows) {
        for (let num = 1; num <= (r.seatsCount || 10); num++) {
          generatedSeats.push({
            seatId: `${r.rowLabel}-${num}`,
            row: r.rowLabel,
            number: num,
            category: r.category || 'Regular',
            priceMultiplier: r.priceMultiplier || 1.0,
            price: Math.round(show.basePrice * (r.priceMultiplier || 1.0)),
          });
        }
      }
      seats = generatedSeats;
    }

    const lockedSeatsList = seatLockService.getLockedSeats(showId);
    const lockedMap = new Map();
    for (const lock of lockedSeatsList) {
      lockedMap.set(lock.seatId, lock);
    }

    const bookedSet = new Set(show.bookedSeats || []);

    const enrichedSeats = seats.map((seat) => {
      const seatKey = seat.seatId || `${seat.row}-${seat.number}`;
      const price = seat.price || Math.round(show.basePrice * (seat.priceMultiplier || 1.0));

      let status = 'available';

      if (bookedSet.has(seatKey)) {
        status = 'occupied';
      } else if (lockedMap.has(seatKey)) {
        const lock = lockedMap.get(seatKey);
        if (currentUserId && lock.userId === currentUserId) {
          status = 'selected'; // Locked by the requesting user
        } else {
          status = 'locked'; // Locked by someone else
        }
      }

      return {
        id: seatKey,
        seatId: seatKey,
        row: seat.row,
        number: seat.number,
        category: seat.category,
        priceMultiplier: seat.priceMultiplier,
        price,
        status,
        expiresAt: lockedMap.has(seatKey) ? lockedMap.get(seatKey).expiresAt : null,
      };
    });

    // Group seats by rows for easy frontend rendering
    const rowsMap = {};
    for (const s of enrichedSeats) {
      if (!rowsMap[s.row]) {
        rowsMap[s.row] = {
          rowLabel: s.row,
          category: s.category,
          price: s.price,
          seats: [],
        };
      }
      rowsMap[s.row].seats.push(s);
    }

    const sortedRows = Object.values(rowsMap).sort((a, b) => a.rowLabel.localeCompare(b.rowLabel));

    res.json({
      success: true,
      data: {
        show: {
          _id: show._id,
          date: show.date,
          startTime: show.startTime,
          endTime: show.endTime,
          format: show.format,
          language: show.language,
          basePrice: show.basePrice,
          movie: show.movieId,
          theatre: show.theatreId,
          screen: show.screenId,
        },
        rows: sortedRows,
        totalSeats: enrichedSeats.length,
        availableSeatsCount: enrichedSeats.filter((s) => s.status === 'available').length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Lock seats temporarily for user
// @route   POST /api/shows/:showId/lock-seats
export const lockSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const { seatIds, socketId } = req.body;
    const userId = req.user._id.toString();

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one seat.' });
    }

    if (seatIds.length > 10) {
      return res.status(400).json({ success: false, message: 'Maximum 10 seats allowed per booking.' });
    }

    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    // Check if any seat is already booked permanently
    const bookedSet = new Set(show.bookedSeats || []);
    for (const seatId of seatIds) {
      if (bookedSet.has(seatId)) {
        return res.status(409).json({
          success: false,
          message: `Seat ${seatId} is already booked and unavailable.`,
        });
      }
    }

    const lockResult = seatLockService.lockSeats(showId, seatIds, userId, socketId);

    if (!lockResult.success) {
      return res.status(409).json({
        success: false,
        message: lockResult.message,
        conflictingSeat: lockResult.conflictingSeat,
      });
    }

    res.json({
      success: true,
      message: 'Seats locked successfully for 5 minutes',
      data: {
        lockedSeats: lockResult.lockedSeats,
        expiresAt: lockResult.expiresAt,
        ttlSeconds: 300,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Release temporarily locked seats
// @route   POST /api/shows/:showId/release-seats
export const releaseSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const { seatIds } = req.body;
    const userId = req.user._id.toString();

    if (!seatIds || !Array.isArray(seatIds)) {
      return res.status(400).json({ success: false, message: 'seatIds array is required' });
    }

    const result = seatLockService.releaseSeats(showId, seatIds, userId);

    res.json({
      success: true,
      message: 'Seats released successfully',
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
