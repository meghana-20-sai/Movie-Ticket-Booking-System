import { parseUserCommand } from '../services/command/intentParser.js';
import { movieCommandService } from '../services/command/movieCommandService.js';
import { showtimeCommandService } from '../services/command/showtimeCommandService.js';
import { theatreCommandService } from '../services/command/theatreCommandService.js';
import { seatCommandService } from '../services/command/seatCommandService.js';
import { budgetCommandService } from '../services/command/budgetCommandService.js';
import { foodCommandService } from '../services/command/foodCommandService.js';
import { bookingCommandService } from '../services/command/bookingCommandService.js';
import { adminCommandService } from '../services/command/adminCommandService.js';
import { Coupon } from '../models/Coupon.js';

export const parseCommand = async (req, res, next) => {
  try {
    const { command } = req.body;
    const user = req.user || null;

    if (!command || !command.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Command query cannot be empty.',
      });
    }

    // Step 1: Parse Intent & Extract Entities
    const parsed = parseUserCommand(command);
    const { intent, entities } = parsed;

    let result = null;

    // Step 2: Route through Modular Command Services
    switch (intent) {
      case 'SEARCH_MOVIES':
        result = await movieCommandService.searchMovies(entities, user);
        break;

      case 'RECOMMEND_MOVIE':
      case 'MOVIE_RECOMMENDATION':
        result = await movieCommandService.recommendMovie(entities, user);
        break;

      case 'SEARCH_SHOWTIMES':
      case 'RECOMMEND_SHOWTIME':
        result = await showtimeCommandService.searchShowtimes(entities, user);
        break;

      case 'SEARCH_THEATRES':
        result = await theatreCommandService.searchTheatres(entities);
        break;

      case 'SEARCH_SEATS':
        if (entities.showId) {
          result = await seatCommandService.getSeatsForShow(entities.showId);
        } else {
          result = await seatCommandService.recommendSeat(entities);
        }
        break;

      case 'RECOMMEND_SEAT':
        result = await seatCommandService.recommendSeat(entities);
        break;

      case 'GROUP_BOOKING':
        result = await seatCommandService.groupBooking(entities);
        break;

      case 'BUDGET_PLANNER':
        result = await budgetCommandService.planBudget(entities);
        break;

      case 'ADD_FOOD':
      case 'RECOMMEND_FOOD':
        result = await foodCommandService.handleFoodCommand(entities);
        break;

      case 'VIEW_BOOKINGS':
        result = await bookingCommandService.viewBookings(user);
        break;

      case 'CANCEL_BOOKING':
        result = await bookingCommandService.cancelBooking(entities, user);
        break;

      case 'CHAINED_BOOKING_PLAN':
      case 'BOOK_TICKETS':
        result = await bookingCommandService.createChainedPlan(entities, user);
        break;

      case 'ADMIN_QUERY':
      case 'ADMIN_METRICS':
        result = await adminCommandService.handleAdminQuery(entities, user);
        break;

      case 'SHOW_OFFERS':
      case 'SHOW_COUPONS': {
        const coupons = await Coupon.find({ isActive: true });
        result = {
          type: 'COUPONS_LIST',
          message: `🎟️ Active SmartCine Promotional Discounts & Promo Codes:`,
          coupons,
        };
        break;
      }

      case 'SHOW_PROFILE':
        result = {
          type: 'PROFILE_REDIRECT',
          message: user ? `👤 Welcome back, ${user.name}!` : `Please log in to view your profile.`,
          user,
        };
        break;

      case 'HELP':
      default:
        result = {
          type: 'HELP',
          message: `🤖 SmartCine Intelligent Command Center Help:`,
          suggestions: [
            'Find 2 action movies tonight under ₹600',
            'Find 3 seats together',
            'Find the best seats for 2 people',
            'Show my bookings',
            'Add 2 popcorns and 2 drinks',
            'Find a Telugu movie tonight under ₹500',
            'Cancel my latest booking',
            'Show today\'s revenue (Admin)',
            '/movies action',
            '/showtimes',
            '/bestseat',
            '/food',
            '/offers',
          ],
        };
        break;
    }

    res.json({
      success: true,
      parsed: {
        intent,
        entities,
        rawInput: command,
      },
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getSuggestions = async (req, res, next) => {
  try {
    const suggestions = [
      { label: '🎬 Find 2 action movies tonight under ₹600', query: 'Find 2 action movies tonight under ₹600', category: 'Movies' },
      { label: '💺 Find the best seats for 2 people', query: 'Find the best seats for 2 people', category: 'Seats' },
      { label: '👥 Find 4 seats together near center', query: 'Find 4 seats together near center', category: 'Group' },
      { label: '💰 Plan movie for 3 people under ₹1000', query: 'Find a movie for 3 people under ₹1000', category: 'Budget' },
      { label: '🍿 Add 2 large popcorns and 2 drinks', query: 'Add 2 popcorns and 2 drinks', category: 'Food' },
      { label: '🎟️ Show my booking passes', query: 'Show my bookings', category: 'Bookings' },
      { label: '⭐ Recommend top rated movies', query: 'Recommend top rated movies', category: 'Recommendations' },
      { label: '🏷️ Show active promo offers', query: 'Show active discount coupons', category: 'Offers' },
    ];

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    next(error);
  }
};
