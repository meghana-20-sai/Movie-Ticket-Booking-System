import { Booking } from '../../models/Booking.js';
import { Show } from '../../models/Show.js';
import { Movie } from '../../models/Movie.js';
import { seatCommandService } from './seatCommandService.js';
import { foodCommandService } from './foodCommandService.js';

export const bookingCommandService = {
  async viewBookings(user) {
    if (!user || !user._id) {
      return {
        type: 'AUTH_REQUIRED',
        message: 'Please sign in to view your bookings and tickets.',
      };
    }

    const bookings = await Booking.find({ user: user._id })
      .populate('show')
      .populate({
        path: 'show',
        populate: [
          { path: 'movie', select: 'title poster duration rating' },
          { path: 'theatre', select: 'name city' },
          { path: 'screen', select: 'name format' },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(5);

    return {
      type: 'USER_BOOKINGS',
      message: bookings.length
        ? `Here are your recent SmartCine booking passes:`
        : `You haven't made any bookings yet. Explore movies to book your first ticket!`,
      bookings,
    };
  },

  async cancelBooking(entities = {}, user = null) {
    if (!user || !user._id) {
      return {
        type: 'AUTH_REQUIRED',
        message: 'Please sign in to cancel or manage your bookings.',
      };
    }

    let booking = null;
    if (entities.bookingRef) {
      booking = await Booking.findOne({
        bookingReference: entities.bookingRef,
        user: user._id,
      }).populate({
        path: 'show',
        populate: [{ path: 'movie' }, { path: 'theatre' }],
      });
    } else {
      // Find latest confirmed booking
      booking = await Booking.findOne({
        user: user._id,
        status: 'confirmed',
      })
        .populate({
          path: 'show',
          populate: [{ path: 'movie' }, { path: 'theatre' }],
        })
        .sort({ createdAt: -1 });
    }

    if (!booking) {
      return {
        type: 'ERROR',
        message: 'No active eligible booking found to cancel.',
      };
    }

    const showTime = new Date(booking.show.startTime);
    const now = new Date();
    const diffHours = (showTime - now) / (1000 * 60 * 60);

    const isEligible = diffHours >= 2 && booking.status === 'confirmed';

    return {
      type: 'CANCELLATION_PREVIEW',
      booking,
      isEligible,
      message: isEligible
        ? `Eligible for 100% refund (₹${booking.totalAmount}). Show is in ${Math.round(diffHours)} hours.`
        : `Cannot be cancelled online. Cancellations are only permitted at least 2 hours before showtime.`,
      actionRequired: isEligible ? 'CONFIRM_CANCELLATION' : 'NONE',
    };
  },

  async createChainedPlan(entities = {}, user = null) {
    // 1. Match Movie
    const searchTerms = [entities.movie, entities.genre, entities.language].filter(Boolean);
    let movie = null;
    if (searchTerms.length > 0) {
      movie = await Movie.findOne({
        status: 'now-showing',
        $or: searchTerms.map((term) => ({
          $or: [
            { title: { $regex: term, $options: 'i' } },
            { genre: { $in: [new RegExp(term, 'i')] } },
            { language: { $in: [new RegExp(term, 'i')] } },
          ],
        })),
      });
    }

    if (!movie) {
      movie = await Movie.findOne({ status: 'now-showing' }).sort({ rating: -1 });
    }

    // 2. Find Showtime
    const show = await Show.findOne({
      movie: movie._id,
      status: 'active',
      startTime: { $gte: new Date() },
    })
      .populate('theatre')
      .populate('screen')
      .sort({ startTime: 1 });

    if (!show) {
      return {
        type: 'ERROR',
        message: `No upcoming showtimes available for "${movie?.title}".`,
      };
    }

    // 3. Find Best Seats
    const seatResult = await seatCommandService.recommendSeat({
      showId: show._id,
      ticketsCount: entities.ticketsCount || 2,
      seatPreference: entities.seatPreference || 'center',
    });

    const recommendedSeats = seatResult.recommendedSeats || [];
    const ticketTotal = recommendedSeats.reduce((sum, s) => sum + s.price, 0);

    // 4. Food Selection
    const foodItems = entities.foodItems.length > 0
      ? entities.foodItems
      : [{ name: 'SmartCine Duo Combo', quantity: 1, price: 390 }];
    const foodTotal = foodItems.reduce((sum, f) => sum + (f.price * f.quantity), 0);

    // 5. Price & Fees Calculation
    const convenienceFee = Math.round(ticketTotal * 0.08);
    const subtotal = ticketTotal + foodTotal + convenienceFee;
    const discount = entities.maxBudget ? Math.max(0, Math.round(subtotal * 0.1)) : 0; // 10% promo
    const finalTotal = subtotal - discount;

    const budget = entities.maxBudget || 1200;
    const withinBudget = finalTotal <= budget;

    return {
      type: 'SMARTCINE_PLAN',
      message: `✨ SMARTCINE PLAN GENERATED:`,
      plan: {
        movie: {
          id: movie._id,
          title: movie.title,
          poster: movie.poster,
          certification: movie.certification,
          duration: movie.duration,
        },
        show: {
          id: show._id,
          startTime: show.startTime,
          theatreName: show.theatre?.name,
          city: show.theatre?.city,
          screenName: show.screen?.name,
          format: show.format,
        },
        seats: recommendedSeats.map((s) => ({
          id: s._id,
          seatNumber: s.seatNumber,
          row: s.row,
          tier: s.tier,
          price: s.price,
        })),
        food: foodItems,
        pricing: {
          ticketTotal,
          foodTotal,
          convenienceFee,
          discount,
          finalTotal,
          budget,
          withinBudget,
          remainingBudget: withinBudget ? budget - finalTotal : 0,
        },
      },
      action: {
        label: 'Confirm & Continue',
        type: 'PROCEED_TO_BOOKING',
        showId: show._id,
        seatIds: recommendedSeats.map((s) => s._id),
      },
      disclaimer: 'Payment is NEVER executed automatically. Explicit confirmation is required.',
    };
  },
};
