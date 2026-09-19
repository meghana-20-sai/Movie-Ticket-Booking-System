/**
 * SmartCine Natural Language & Quick Command Parser
 * Parses natural language user input or quick /commands into structured intent and entities
 */

export const parseUserCommand = (input = '') => {
  const text = input.trim();
  const lower = text.toLowerCase();

  // Handle Quick Slash Commands
  if (lower.startsWith('/')) {
    const parts = lower.slice(1).split(' ');
    const cmd = parts[0];
    const rest = parts.slice(1).join(' ');

    switch (cmd) {
      case 'movies':
      case 'movie':
        return {
          intent: 'SEARCH_MOVIES',
          rawInput: text,
          entities: {
            genre: extractGenre(rest),
            language: extractLanguage(rest),
            query: rest,
          },
        };
      case 'showtimes':
      case 'shows':
        return {
          intent: 'SEARCH_SHOWTIMES',
          rawInput: text,
          entities: {
            query: rest,
            date: extractDate(rest),
          },
        };
      case 'theatres':
      case 'theaters':
      case 'cinema':
        return {
          intent: 'SEARCH_THEATRES',
          rawInput: text,
          entities: {
            query: rest,
          },
        };
      case 'seats':
      case 'seat':
        return {
          intent: 'SEARCH_SEATS',
          rawInput: text,
          entities: {
            ticketsCount: extractNumber(rest) || 2,
            preference: extractSeatPreference(rest),
          },
        };
      case 'bestseat':
      case 'bestseats':
        return {
          intent: 'RECOMMEND_SEAT',
          rawInput: text,
          entities: {
            ticketsCount: extractNumber(rest) || 2,
            preference: 'center',
          },
        };
      case 'book':
        return {
          intent: 'BOOK_TICKETS',
          rawInput: text,
          entities: {
            query: rest,
            ticketsCount: extractNumber(rest) || 2,
          },
        };
      case 'mybookings':
      case 'bookings':
        return {
          intent: 'VIEW_BOOKINGS',
          rawInput: text,
          entities: {},
        };
      case 'cancel':
        return {
          intent: 'CANCEL_BOOKING',
          rawInput: text,
          entities: {
            bookingRef: extractBookingRef(text),
          },
        };
      case 'food':
      case 'snacks':
      case 'popcorn':
        return {
          intent: 'ADD_FOOD',
          rawInput: text,
          entities: {
            foodItems: extractFoodItems(text),
          },
        };
      case 'offers':
      case 'coupons':
        return {
          intent: 'SHOW_OFFERS',
          rawInput: text,
          entities: {},
        };
      case 'profile':
        return {
          intent: 'SHOW_PROFILE',
          rawInput: text,
          entities: {},
        };
      case 'admin':
        return {
          intent: 'ADMIN_METRICS',
          rawInput: text,
          entities: {
            query: rest,
          },
        };
      case 'help':
      default:
        return {
          intent: 'HELP',
          rawInput: text,
          entities: {},
        };
    }
  }

  // Natural Language Intent Recognition
  const entities = {
    genre: extractGenre(lower),
    language: extractLanguage(lower),
    date: extractDate(lower),
    time: extractTime(lower),
    ticketsCount: extractTicketsCount(lower),
    maxBudget: extractBudget(lower),
    theatre: extractTheatre(lower),
    seatPreference: extractSeatPreference(lower),
    foodItems: extractFoodItems(lower),
    bookingRef: extractBookingRef(text),
    format: extractFormat(lower),
    movie: extractMovieTitle(text),
    isGroup: /group|together|adjacent|next to each other/i.test(lower),
    isCheapest: /cheapest|lowest price|budget|cheap/i.test(lower),
  };

  // Detect Complex Command Chaining (Movie + Showtime + Seat + Food + Budget)
  const isChained =
    (entities.movie || entities.genre || entities.language) &&
    (entities.ticketsCount || entities.seatPreference) &&
    (entities.foodItems.length > 0 || entities.maxBudget > 0);

  if (isChained) {
    return {
      intent: 'CHAINED_BOOKING_PLAN',
      rawInput: text,
      entities,
    };
  }

  // Admin Inquiries
  if (
    /(today's|weekly|total|overall)?\s*(revenue|earnings|tickets sold|occupancy|cancelled bookings|theatre performance|sales report)/i.test(
      lower
    )
  ) {
    return {
      intent: 'ADMIN_QUERY',
      rawInput: text,
      entities,
    };
  }

  // Cancel Booking
  if (/cancel( my| latest)? booking|refund ticket/i.test(lower)) {
    return {
      intent: 'CANCEL_BOOKING',
      rawInput: text,
      entities,
    };
  }

  // View Bookings
  if (/show( my)? bookings|my tickets|order history|past bookings/i.test(lower)) {
    return {
      intent: 'VIEW_BOOKINGS',
      rawInput: text,
      entities,
    };
  }

  // Group Booking Assistant
  if (entities.isGroup && (entities.ticketsCount >= 3 || /group/i.test(lower))) {
    return {
      intent: 'GROUP_BOOKING',
      rawInput: text,
      entities,
    };
  }

  // Best Seat Recommendation
  if (/best seat|best view|center seat|recliner recommendation|recommend.*seat/i.test(lower)) {
    return {
      intent: 'RECOMMEND_SEAT',
      rawInput: text,
      entities,
    };
  }

  // Seats Search
  if (/seat|seats together|available seats|find.*seat/i.test(lower)) {
    return {
      intent: 'SEARCH_SEATS',
      rawInput: text,
      entities,
    };
  }

  // Food & Snacks
  if (entities.foodItems.length > 0 || /popcorn|coke|snack|drink|beverage|nachos|combo/i.test(lower)) {
    return {
      intent: 'ADD_FOOD',
      rawInput: text,
      entities,
    };
  }

  // Budget Planner
  if (
    entities.maxBudget > 0 &&
    (entities.ticketsCount || /for \d+ (people|person|friends|tickets)/i.test(lower))
  ) {
    return {
      intent: 'BUDGET_PLANNER',
      rawInput: text,
      entities,
    };
  }

  // Recommendation
  if (/recommend|suggest|what should i watch|popular|trending|top rated/i.test(lower)) {
    return {
      intent: 'RECOMMEND_MOVIE',
      rawInput: text,
      entities,
    };
  }

  // Showtimes / Timings
  if (/showtime|timing|shows|tonight|at \d+(:\d+)?\s*(pm|am)|schedule/i.test(lower)) {
    return {
      intent: 'SEARCH_SHOWTIMES',
      rawInput: text,
      entities,
    };
  }

  // Theatres Search
  if (/theatre|theater|cinema|multiplex|inox|pvr|cinepolis/i.test(lower)) {
    return {
      intent: 'SEARCH_THEATRES',
      rawInput: text,
      entities,
    };
  }

  // Offers / Coupons
  if (/offer|coupon|promo|discount|deal/i.test(lower)) {
    return {
      intent: 'SHOW_OFFERS',
      rawInput: text,
      entities,
    };
  }

  // Profile
  if (/my profile|account details|user info/i.test(lower)) {
    return {
      intent: 'SHOW_PROFILE',
      rawInput: text,
      entities,
    };
  }

  // Default to Search Movies
  return {
    intent: 'SEARCH_MOVIES',
    rawInput: text,
    entities,
  };
};

// ==========================================
// Entity Extraction Helper Functions
// ==========================================

function extractGenre(text) {
  const genres = [
    'action',
    'sci-fi',
    'adventure',
    'drama',
    'comedy',
    'thriller',
    'horror',
    'romance',
    'crime',
    'animation',
    'fantasy',
    'biography',
    'mystery',
  ];
  for (const g of genres) {
    if (new RegExp(`\\b${g}\\b`, 'i').test(text)) {
      return g.charAt(0).toUpperCase() + g.slice(1);
    }
  }
  return null;
}

function extractLanguage(text) {
  const languages = [
    'english',
    'hindi',
    'telugu',
    'tamil',
    'kannada',
    'malayalam',
    'marathi',
    'bengali',
    'spanish',
    'japanese',
    'korean',
  ];
  for (const l of languages) {
    if (new RegExp(`\\b${l}\\b`, 'i').test(text)) {
      return l.charAt(0).toUpperCase() + l.slice(1);
    }
  }
  return null;
}

function extractDate(text) {
  if (/tonight|today/i.test(text)) return 'today';
  if (/tomorrow/i.test(text)) return 'tomorrow';
  if (/weekend/i.test(text)) return 'weekend';
  return null;
}

function extractTime(text) {
  const match = text.match(/(\d{1,2}(?::\d{2})?)\s*(am|pm)/i);
  if (match) return match[0].toUpperCase();
  if (/morning/i.test(text)) return 'morning';
  if (/afternoon/i.test(text)) return 'afternoon';
  if (/evening|tonight/i.test(text)) return 'evening';
  if (/night/i.test(text)) return 'night';
  return null;
}

function extractTicketsCount(text) {
  // Check digit patterns
  const match = text.match(/(\d+)\s*(?:tickets|seats|people|persons|adults|passes)/i);
  if (match) return parseInt(match[1], 10);

  // Check word numbers
  const wordMap = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
  };
  for (const [word, num] of Object.entries(wordMap)) {
    if (new RegExp(`\\b${word}\\s+(?:tickets|seats|people|persons|adults)\\b`, 'i').test(text)) {
      return num;
    }
  }

  // Bare number near seats/people
  const bareMatch = text.match(/(?:for|get|find|book)\s+(\d+)/i);
  if (bareMatch) return parseInt(bareMatch[1], 10);

  return null;
}

function extractNumber(text) {
  const match = text.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

function extractBudget(text) {
  const match = text.match(/(?:under|below|less than|within|budget of)?\s*(?:₹|rs\.?|inr)?\s*(\d{2,6})/i);
  if (match && /under|below|less than|within|budget|₹|rs/i.test(text)) {
    return parseInt(match[1], 10);
  }
  return null;
}

function extractTheatre(text) {
  if (/inox/i.test(text)) return 'INOX';
  if (/pvr/i.test(text)) return 'PVR';
  if (/cinepolis/i.test(text)) return 'Cinépolis';
  if (/imax/i.test(text)) return 'IMAX';
  return null;
}

function extractSeatPreference(text) {
  if (/recliner|vip|luxury/i.test(text)) return 'recliner';
  if (/prime|premium/i.test(text)) return 'prime';
  if (/classic|economy/i.test(text)) return 'classic';
  if (/center|middle|central/i.test(text)) return 'center';
  if (/front|front row/i.test(text)) return 'front';
  if (/back|back row|balcony/i.test(text)) return 'back';
  if (/aisle/i.test(text)) return 'aisle';
  return 'best';
}

function extractFoodItems(text) {
  const items = [];
  const popcornMatch = text.match(/(\d+)?\s*(?:large|medium|small)?\s*popcorn/i);
  if (popcornMatch) {
    items.push({
      name: 'Caramel Popcorn',
      quantity: popcornMatch[1] ? parseInt(popcornMatch[1], 10) : 1,
      price: 220,
    });
  }

  const drinkMatch = text.match(/(\d+)?\s*(?:coke|drinks?|pepsi|beverages?|soda)/i);
  if (drinkMatch) {
    items.push({
      name: 'Cold Beverage (Large)',
      quantity: drinkMatch[1] ? parseInt(drinkMatch[1], 10) : 1,
      price: 130,
    });
  }

  const nachosMatch = text.match(/(\d+)?\s*nachos/i);
  if (nachosMatch) {
    items.push({
      name: 'Crispy Cheese Nachos',
      quantity: nachosMatch[1] ? parseInt(nachosMatch[1], 10) : 1,
      price: 180,
    });
  }

  return items;
}

function extractBookingRef(text) {
  const match = text.match(/SC-[A-Z0-9]{8,12}/i);
  return match ? match[0].toUpperCase() : null;
}

function extractFormat(text) {
  if (/imax 3d|imax/i.test(text)) return 'IMAX 3D';
  if (/4dx/i.test(text)) return '4DX';
  if (/3d/i.test(text)) return '3D';
  if (/2d/i.test(text)) return '2D';
  return null;
}

function extractMovieTitle(text) {
  // Look for quotes e.g. "Deadpool & Wolverine" or for Movie XYZ
  const quoted = text.match(/["']([^"']+)["']/);
  if (quoted) return quoted[1];

  const forMovieMatch = text.match(/for\s+(?:movie\s+)?([A-Za-z0-9\s:&-]+?)(?:\s+(?:at|on|tonight|today|in|under|with)|\s*$)/i);
  if (forMovieMatch && !/people|tickets|seats|group/i.test(forMovieMatch[1])) {
    return forMovieMatch[1].trim();
  }
  return null;
}
