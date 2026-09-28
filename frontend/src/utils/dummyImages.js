/**
 * dummyImages.js
 * 
 * High-definition fallback and placeholder image assets for cinemas, theatres,
 * and movie posters. Ensures every cinema card, movie card, and ticket always
 * looks vibrant and premium, even if backend records omit image URLs or images fail to load.
 */

export const DUMMY_CINEMA_IMAGES = [
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1460881680858-30d872d5b530?w=800&auto=format&fit=crop&q=80',
];

export const DUMMY_MOVIE_POSTERS = [
  'https://image.tmdb.org/t/p/w500/b0OnvU5xV5xZ2K2QYgL9uU1dI9c.jpg', // Pushpa 2
  'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg', // Kalki 2898 AD
  'https://image.tmdb.org/t/p/w500/AOBZkWVd7vC3L05FqMekyZc6b0y.jpg', // Devara
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=800&auto=format&fit=crop&q=80',
];

export const getDummyCinemaImage = (seed = 0) => {
  if (typeof seed === 'string') {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    return DUMMY_CINEMA_IMAGES[Math.abs(hash) % DUMMY_CINEMA_IMAGES.length];
  }
  return DUMMY_CINEMA_IMAGES[Math.abs(Number(seed) || 0) % DUMMY_CINEMA_IMAGES.length];
};

export const getDummyMoviePoster = (seed = 0) => {
  if (typeof seed === 'string') {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    return DUMMY_MOVIE_POSTERS[Math.abs(hash) % DUMMY_MOVIE_POSTERS.length];
  }
  return DUMMY_MOVIE_POSTERS[Math.abs(Number(seed) || 0) % DUMMY_MOVIE_POSTERS.length];
};

/**
 * Inline SVG Cinema Poster (guaranteed to render offline/without network)
 */
export const createSvgFallbackPoster = (title = 'Cinema Movie') => {
  const safeTitle = encodeURIComponent((title || 'Cinema Movie').slice(0, 24));
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e1022"/><stop offset="50%" stop-color="%230f1423"/><stop offset="100%" stop-color="%23090a0f"/></linearGradient><radialGradient id="glow" cx="50%" cy="40%" r="50%"><stop offset="0%" stop-color="%23e11d48" stop-opacity="0.35"/><stop offset="100%" stop-color="%23e11d48" stop-opacity="0"/></radialGradient></defs><rect width="500" height="750" fill="url(%23bg)"/><circle cx="250" cy="300" r="220" fill="url(%23glow)"/><g transform="translate(190, 230)" stroke="%23e11d48" stroke-width="3" fill="none"><rect x="0" y="0" width="120" height="80" rx="16" fill="%23e11d48" fill-opacity="0.15"/><polygon points="120,24 160,8 160,72 120,56" fill="%23e11d48" fill-opacity="0.4"/><circle cx="60" cy="40" r="16" fill="%23f59e0b"/><circle cx="35" cy="20" r="6" fill="%23fff" fill-opacity="0.8"/><circle cx="85" cy="20" r="6" fill="%23fff" fill-opacity="0.8"/></g><text x="250" y="440" fill="%23ffffff" font-family="system-ui,-apple-system,sans-serif" font-weight="900" font-size="28" text-anchor="middle">${safeTitle}</text><text x="250" y="480" fill="%23e11d48" font-family="system-ui,-apple-system,sans-serif" font-weight="700" font-size="14" letter-spacing="4" text-anchor="middle">SMARTCINE PREMIERE</text></svg>`;
};

/**
 * Inline SVG Cinema Complex Photo
 */
export const createSvgFallbackCinema = (name = 'SmartCine Cinemas') => {
  const safeName = encodeURIComponent((name || 'SmartCine Cinemas').slice(0, 28));
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><defs><linearGradient id="cbg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231a0b1e"/><stop offset="60%" stop-color="%230a0d18"/><stop offset="100%" stop-color="%2305070d"/></linearGradient></defs><rect width="800" height="450" fill="url(%23cbg)"/><g transform="translate(360, 130)" stroke="%23e11d48" stroke-width="4" fill="none"><rect x="0" y="0" width="80" height="90" rx="10" fill="%23e11d48" fill-opacity="0.15"/><line x1="20" y1="25" x2="35" y2="25" stroke="%23fff" stroke-width="3"/><line x1="45" y1="25" x2="60" y2="25" stroke="%23fff" stroke-width="3"/><line x1="20" y1="45" x2="35" y2="45" stroke="%23fff" stroke-width="3"/><line x1="45" y1="45" x2="60" y2="45" stroke="%23fff" stroke-width="3"/></g><text x="400" y="270" fill="%23ffffff" font-family="system-ui,-apple-system,sans-serif" font-weight="900" font-size="24" text-anchor="middle">${safeName}</text><text x="400" y="305" fill="%23fb7185" font-family="system-ui,-apple-system,sans-serif" font-weight="700" font-size="13" letter-spacing="3" text-anchor="middle">PREMIER AUDITORIUM & LASER IMAX</text></svg>`;
};
