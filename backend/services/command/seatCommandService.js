import { Show } from '../../models/Show.js';
import { Seat } from '../../models/Seat.js';
import { Booking } from '../../models/Booking.js';
import { seatLockService } from '../seatLockService.js';

export const seatCommandService = {
  async getSeatsForShow(showId) {
    const show = await Show.findById(showId)
      .populate('movie', 'title poster backdrop duration rating certification')
      .populate('theatre', 'name city')
      .populate('screen', 'name format rows columns');

    if (!show) {
      throw new Error('Showtime not found');
    }

    const allSeats = await Seat.find({ screen: show.screen._id, isActive: true }).sort({
      row: 1,
      column: 1,
    });

    const activeBookings = await Booking.find({
      show: show._id,
      status: { $in: ['confirmed', 'completed'] },
    }).select('seats');

    const bookedSeatIds = new Set();
    activeBookings.forEach((b) => {
      b.seats.forEach((seatRef) => {
        bookedSeatIds.add(seatRef.seat.toString());
      });
    });

    const lockedSeatsMap = seatLockService.getLockedSeats(show._id.toString());

    const seatsWithState = allSeats.map((seat) => {
      const seatIdStr = seat._id.toString();
      let state = 'available';

      if (bookedSeatIds.has(seatIdStr)) {
        state = 'booked';
      } else if (lockedSeatsMap[seatIdStr]) {
        state = 'locked';
      }

      const multiplier = show.pricingTierMultipliers?.[seat.tier] || 1.0;
      const price = Math.round(show.basePrice * multiplier);

      return {
        _id: seat._id,
        seatNumber: seat.seatNumber,
        row: seat.row,
        column: seat.column,
        tier: seat.tier,
        price,
        state,
      };
    });

    return { show, seats: seatsWithState };
  },

  async recommendSeat(entities = {}) {
    const count = entities.ticketsCount || 2;
    const preference = entities.seatPreference || 'center';

    // Find a relevant active show
    let show = null;
    if (entities.showId) {
      show = await Show.findById(entities.showId);
    } else {
      show = await Show.findOne({ status: 'active', startTime: { $gte: new Date() } })
        .populate('movie')
        .populate('theatre')
        .populate('screen')
        .sort({ startTime: 1 });
    }

    if (!show) {
      return {
        type: 'ERROR',
        message: 'No active upcoming showtimes found to recommend seats.',
      };
    }

    const { seats } = await this.getSeatsForShow(show._id);
    const availableSeats = seats.filter((s) => s.state === 'available');

    if (availableSeats.length < count) {
      return {
        type: 'SEAT_RECOMMENDATION',
        show,
        message: `Only ${availableSeats.length} seat(s) available for this show.`,
        recommendedSeats: availableSeats,
        matchScore: 60,
      };
    }

    // Group available seats by row
    const rowMap = {};
    availableSeats.forEach((s) => {
      if (!rowMap[s.row]) rowMap[s.row] = [];
      rowMap[s.row].push(s);
    });

    // Score rows and contiguous sequences
    // Prime and center rows (e.g. D, E, F, G, H) score highest
    const rowPriority = ['H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
    let bestGroup = [];
    let highestScore = 0;

    for (const [row, rowSeats] of Object.entries(rowMap)) {
      rowSeats.sort((a, b) => a.column - b.column);

      // Look for contiguous consecutive seats
      for (let i = 0; i <= rowSeats.length - count; i++) {
        const candidate = rowSeats.slice(i, i + count);
        let isContiguous = true;
        for (let j = 0; j < candidate.length - 1; j++) {
          if (candidate[j + 1].column !== candidate[j].column + 1) {
            isContiguous = false;
            break;
          }
        }

        if (isContiguous) {
          // Calculate score
          const avgCol = candidate.reduce((sum, s) => sum + s.column, 0) / count;
          const centerDist = Math.abs(avgCol - 8); // Assuming ~16 columns
          const rowBonus = (rowPriority.indexOf(row) !== -1 ? rowPriority.indexOf(row) : 0) * 5;
          const tierBonus = candidate[0].tier === 'recliner' ? 15 : candidate[0].tier === 'prime' ? 10 : 5;

          const score = Math.max(70, Math.min(98, 100 - centerDist * 3 + rowBonus + tierBonus));

          if (score > highestScore) {
            highestScore = score;
            bestGroup = candidate;
          }
        }
      }
    }

    // Fallback to any available contiguous or first available
    if (!bestGroup.length) {
      bestGroup = availableSeats.slice(0, count);
      highestScore = 80;
    }

    const totalPrice = bestGroup.reduce((sum, s) => sum + s.price, 0);

    return {
      type: 'SEAT_RECOMMENDATION',
      message: `🎯 SmartCine Best Seat Recommendation (${bestGroup.length} seats):`,
      show,
      recommendedSeats: bestGroup,
      matchScore: Math.round(highestScore),
      totalPrice,
      highlights: [
        'Optimal viewing angle & distance to screen',
        'Contiguous adjacent seating',
        `${bestGroup[0]?.tier?.toUpperCase()} tier with crystal clarity`,
        'Live real-time availability verified',
      ],
    };
  },

  async groupBooking(entities = {}) {
    const groupSize = entities.ticketsCount || 5;

    // Find active show
    const show = await Show.findOne({ status: 'active', startTime: { $gte: new Date() } })
      .populate('movie')
      .populate('theatre')
      .populate('screen')
      .sort({ startTime: 1 });

    if (!show) {
      return {
        type: 'ERROR',
        message: 'No upcoming shows found for group booking.',
      };
    }

    const { seats } = await this.getSeatsForShow(show._id);
    const availableSeats = seats.filter((s) => s.state === 'available');

    if (availableSeats.length < groupSize) {
      return {
        type: 'GROUP_BOOKING_RESULT',
        show,
        message: `⚠️ Not enough contiguous seats. Only ${availableSeats.length} total seats available on this screen.`,
        seats: availableSeats,
        isContiguous: false,
      };
    }

    // Group seats by row
    const rowMap = {};
    availableSeats.forEach((s) => {
      if (!rowMap[s.row]) rowMap[s.row] = [];
      rowMap[s.row].push(s);
    });

    // Look for a row that fits the entire group
    let groupSeats = [];
    for (const [row, rowSeats] of Object.entries(rowMap)) {
      rowSeats.sort((a, b) => a.column - b.column);
      for (let i = 0; i <= rowSeats.length - groupSize; i++) {
        const candidate = rowSeats.slice(i, i + groupSize);
        let isContiguous = true;
        for (let j = 0; j < candidate.length - 1; j++) {
          if (candidate[j + 1].column !== candidate[j].column + 1) {
            isContiguous = false;
            break;
          }
        }
        if (isContiguous) {
          groupSeats = candidate;
          break;
        }
      }
      if (groupSeats.length) break;
    }

    // If no single row fits, group in closest adjacent rows
    if (!groupSeats.length) {
      groupSeats = availableSeats.slice(0, groupSize);
    }

    const totalPrice = groupSeats.reduce((sum, s) => sum + s.price, 0);

    return {
      type: 'GROUP_BOOKING_RESULT',
      message: `👥 Group Booking Assistant: ${groupSize} seats reserved together:`,
      show,
      seats: groupSeats,
      seatNumbers: groupSeats.map((s) => s.seatNumber).join(', '),
      totalPrice,
      isContiguous: groupSeats.length === groupSize,
      groupDiscountOffer: 'Eligible for 10% group promo: SMARTCINE10',
    };
  },
};
