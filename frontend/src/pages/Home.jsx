import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Play,
  Ticket,
  Star,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Tag,
  Film,
  Building2,
  Armchair,
  Compass,
  CreditCard,
  QrCode,
  Users,
  TrendingUp,
  CalendarDays,
  Flame,
  Clapperboard,
  Award,
  Globe2,
} from 'lucide-react';
import { movieService } from '../services/movieService';
import { useAuth } from '../context/AuthContext';
import MovieCard3D from '../components/3d/MovieCard3D';
import CinemaCanvas from '../components/3d/CinemaCanvas';
import RealisticCinemaHeroBg from '../components/3d/RealisticCinemaHeroBg';
import Hero3DCoverflow from '../components/3d/Hero3DCoverflow';
import Interactive3DTheater from '../components/3d/Interactive3DTheater';
import CommandCenterEmbed from '../components/command/CommandCenterEmbed';
import CommandCenterModal from '../components/command/CommandCenterModal';
import TrailerModal from '../components/TrailerModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

// ── Skeleton Card for loading state ─────────────────────────
const SkeletonCard = () => (
  <div className="animate-pulse rounded-2xl bg-[#0d1222] border border-slate-800 overflow-hidden flex-shrink-0 w-[240px] sm:w-[270px]">
    <div className="aspect-[2/3] bg-slate-800" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-slate-800 rounded w-3/4" />
      <div className="h-3 bg-slate-800 rounded w-1/2" />
    </div>
  </div>
);

const SkeletonRow = ({ count = 4 }) => (
  <div className="flex items-center gap-7 overflow-hidden py-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

// ── Rolling Cinema Poster Card ─────────────────────────────
const RollingCinemaCard = ({ movie, onWatchTrailer }) => {
  const effectiveImdb = movie.imdbRating || (movie.rating > 0 ? (movie.rating * 1.8).toFixed(1) : null);
  const lang = movie.originalLanguage || (Array.isArray(movie.language) ? movie.language[0] : movie.language) || 'Cinema';
  const format = movie.formats?.includes('3D') ? '3D' : (movie.formats?.includes('IMAX') ? 'IMAX' : null);

  return (
    <div className="group/card relative w-[220px] sm:w-[245px] h-[335px] sm:h-[365px] rounded-2xl overflow-hidden bg-[#0d1222] border border-slate-800/90 shadow-xl transition-all duration-300 hover:border-rose-500/80 hover:shadow-[0_12px_35px_-8px_rgba(225,29,72,0.45),0_0_20px_-4px_rgba(245,197,24,0.3)] hover:-translate-y-1.5 flex-shrink-0 select-none">
      {/* Poster image */}
      <img
        src={movie.poster}
        alt={movie.title}
        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover/card:scale-105"
        loading="lazy"
      />

      {/* Dark cinematic gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#070913] via-[#070913]/40 to-transparent" />

      {/* Top Floating Badges */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
        {effectiveImdb && (
          <span className="imdb-badge text-[11px] font-black shadow-md">
            IMDb {effectiveImdb}
          </span>
        )}
        {format && (
          <span className="px-2 py-0.5 rounded bg-gradient-to-r from-rose-600 to-amber-500 text-[10px] font-black uppercase text-white shadow-sm ml-auto">
            {format}
          </span>
        )}
      </div>

      {/* Bottom Content & Interactive Quick Actions */}
      <div className="absolute inset-x-0 bottom-0 p-3 z-10 space-y-1.5 bg-gradient-to-t from-[#070913] via-[#070913]/95 to-transparent">
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-rose-600/30 border border-rose-500/40 text-rose-300 text-[10px] font-bold">
            {lang}
          </span>
          {movie.genre && (
            <span className="text-[10px] text-slate-400 font-medium truncate">
              {Array.isArray(movie.genre)
                ? movie.genre.slice(0, 2).join(' ')
                : typeof movie.genre === 'string'
                ? movie.genre.split(' ').slice(0, 2).join(' ')
                : ''}
            </span>
          )}
        </div>

        <h3 className="text-sm sm:text-base font-black text-white line-clamp-1 group-hover/card:text-amber-300 transition-colors">
          {movie.title}
        </h3>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-0.5">
          <Link to={`/movies/${movie._id || movie.id}`} className="flex-1">
            <Button size="sm" className="w-full font-black bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white shadow-md text-xs h-7 px-2">
              <Ticket className="w-3 h-3 mr-1" />
              Book
            </Button>
          </Link>
          {movie.trailerUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onWatchTrailer?.(movie.trailerUrl, movie.title);
              }}
              className="w-7 h-7 rounded-lg bg-slate-800/90 hover:bg-rose-600 text-white flex items-center justify-center border border-slate-700 shadow-md transition-colors"
              title="Watch Trailer"
            >
              <Play className="w-3 h-3 fill-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Ultra-Smooth Rolling Cinema Marquee ─────────────────────
const RollingCinemaMarquee = ({ movies = [], loading = false, onWatchTrailer, direction = 'left' }) => {
  if (loading && (!movies || movies.length === 0)) {
    return (
      <div className="flex items-center gap-5 overflow-hidden py-2 px-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse w-[220px] sm:w-[245px] h-[335px] sm:h-[365px] rounded-2xl bg-[#0d1222] border border-slate-800 flex-shrink-0" />
        ))}
      </div>
    );
  }

  if (!movies || movies.length === 0) return null;

  // Build enough duplicates so track rolls seamlessly across any screen
  let items = [...movies];
  while (items.length < 10) {
    items = [...items, ...movies];
  }
  const duplicated = [...items, ...items];

  const animClass = direction === 'left' ? 'animate-rolling-left' : 'animate-rolling-right';

  return (
    <div className="relative overflow-hidden w-full rolling-marquee-track py-2">
      {/* Left and Right Smooth Gradient Edge Fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-[#070913] to-transparent z-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-[#070913] to-transparent z-20" />

      <div className={`flex items-center gap-5 w-max ${animClass}`}>
        {duplicated.map((movie, idx) => (
          <RollingCinemaCard
            key={`${movie._id || movie.id || idx}-${idx}`}
            movie={movie}
            onWatchTrailer={onWatchTrailer}
          />
        ))}
      </div>
    </div>
  );
};

// ── Movie Section Component with Smooth Scrolling & Generous Whitespace ──
const MovieSection = ({ icon: Icon, iconColor, title, subtitle, movies, loading, linkTo, linkLabel, onWatchTrailer, badgeType }) => {
  const scrollRef = useRef(null);

  if (!loading && (!movies || movies.length === 0)) return null;

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -620 : 620;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="space-y-8 py-4">
      {/* Section Header with Generous Whitespace */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-800/70">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5 drop-shadow-sm">
            <Icon className={`w-6 h-6 ${iconColor}`} />
            <span>{title}</span>
          </h2>
          {subtitle && <p className="text-xs sm:text-sm text-slate-400 mt-1.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          {/* Scroll Navigation Controls for Easy Browsing */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-full bg-slate-900/90 hover:bg-rose-600/80 border border-slate-700 hover:border-rose-500 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-md"
              aria-label="Scroll left"
              title="Previous movies"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-full bg-slate-900/90 hover:bg-rose-600/80 border border-slate-700 hover:border-rose-500 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-md"
              aria-label="Scroll right"
              title="Next movies"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {linkTo && (
            <Link
              to={linkTo}
              className="flex items-center gap-1 text-xs font-bold text-rose-400 hover:text-amber-400 transition-colors ml-1"
            >
              <span>{linkLabel || 'View All'}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {loading ? (
        <SkeletonRow />
      ) : (
        /* Smooth Scrolling Movie Rail with Generous Padding & Card Gap */
        <div
          ref={scrollRef}
          className="flex items-stretch gap-7 sm:gap-8 overflow-x-auto pb-6 pt-3 px-2 scrollbar-thin scrollbar-thumb-slate-800 hover:scrollbar-thumb-rose-600/50 scroll-smooth"
          style={{ scrollSnapType: 'x proximity' }}
        >
          {movies.map((movie) => (
            <div
              key={movie._id}
              className="flex-shrink-0 w-[240px] sm:w-[270px]"
              style={{ scrollSnapAlign: 'start' }}
            >
              <MovieCard3D
                movie={movie}
                onWatchTrailer={onWatchTrailer}
                badgeType={badgeType}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

// ── Home Page ───────────────────────────────────────────────
const Home = () => {
  const { city } = useAuth();
  const navigate = useNavigate();

  const [featured, setFeatured] = useState([]);
  const [topImdb, setTopImdb] = useState([]);
  const [selectedImdbLang, setSelectedImdbLang] = useState('All');
  const [filteredImdbMovies, setFilteredImdbMovies] = useState([]);
  
  const [nowShowing, setNowShowing] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [latestTelugu, setLatestTelugu] = useState([]);
  const [latestHindi, setLatestHindi] = useState([]);
  const [latestTamil, setLatestTamil] = useState([]);
  const [latestMalayalam, setLatestMalayalam] = useState([]);
  const [latestKannada, setLatestKannada] = useState([]);
  const [hollywood, setHollywood] = useState([]);
  const [trending, setTrending] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [topRated, setTopRated] = useState([]);

  const [loadState, setLoadState] = useState({
    featured: true,
    topImdb: true,
    nowShowing: true,
    newReleases: true,
    latestTelugu: true,
    latestHindi: true,
    latestTamil: true,
    latestMalayalam: true,
    latestKannada: true,
    hollywood: true,
    trending: true,
    upcoming: true,
    topRated: true,
  });

  const [trailerState, setTrailerState] = useState({ isOpen: false, url: '', title: '' });
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);

  // Available Languages for IMDb Filter Tabs
  const IMDB_LANGUAGES = ['All', 'Telugu', 'Hindi', 'Tamil', 'Malayalam', 'Kannada', 'English', 'Punjabi', 'Marathi', 'Bengali', 'Japanese'];

  // Fetch all sections in parallel
  useEffect(() => {
    const fetchSection = async (fetcher, setter, key) => {
      try {
        const res = await fetcher({ limit: 12 });
        if (res.success) setter(res.data);
      } catch (err) {
        console.error(`Failed to load ${key}:`, err);
      } finally {
        setLoadState((prev) => ({ ...prev, [key]: false }));
      }
    };

    fetchSection(movieService.getFeatured, setFeatured, 'featured');
    fetchSection(movieService.getTopIMDb, (data) => {
      setTopImdb(data);
      setFilteredImdbMovies(data);
    }, 'topImdb');
    fetchSection(movieService.getNowShowing, setNowShowing, 'nowShowing');
    fetchSection(movieService.getNewReleases, setNewReleases, 'newReleases');
    fetchSection((params) => movieService.getByLanguage('Telugu', params), setLatestTelugu, 'latestTelugu');
    fetchSection((params) => movieService.getByLanguage('Hindi', params), setLatestHindi, 'latestHindi');
    fetchSection((params) => movieService.getByLanguage('Tamil', params), setLatestTamil, 'latestTamil');
    fetchSection((params) => movieService.getByLanguage('Malayalam', params), setLatestMalayalam, 'latestMalayalam');
    fetchSection((params) => movieService.getByLanguage('Kannada', params), setLatestKannada, 'latestKannada');
    fetchSection((params) => movieService.getByIndustry('Hollywood', params), setHollywood, 'hollywood');
    fetchSection(movieService.getTrending, setTrending, 'trending');
    fetchSection(movieService.getUpcoming, setUpcoming, 'upcoming');
    fetchSection(movieService.getPopular, setTopRated, 'topRated');
  }, []);

  // Filter IMDb movies when language tab changes
  useEffect(() => {
    if (selectedImdbLang === 'All') {
      setFilteredImdbMovies(topImdb);
    } else {
      const filtered = topImdb.filter((m) => {
        const orig = m.originalLanguage?.toLowerCase() || '';
        const langs = (m.languages || []).map(l => l.toLowerCase());
        const target = selectedImdbLang.toLowerCase();
        return orig === target || langs.includes(target) || (m.language || []).some(l => l.toLowerCase() === target);
      });
      setFilteredImdbMovies(filtered);
    }
  }, [selectedImdbLang, topImdb]);

  const imdbScrollRef = useRef(null);
  const scrollImdb = (direction) => {
    if (imdbScrollRef.current) {
      const scrollAmount = direction === 'left' ? -620 : 620;
      imdbScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleWatchTrailer = (url, title) => {
    setTrailerState({ isOpen: true, url, title });
  };

  // Determine coverflow showcase movies
  const coverflowMovies = topImdb.length > 0 ? topImdb : (featured.length > 0 ? featured : nowShowing);
  const heroMovies = featured.length > 0 ? featured : nowShowing.slice(0, 5);

  return (
    <div className="space-y-10 sm:space-y-14 pb-28 overflow-x-hidden">
      {/* ── 3D Cinematic Hero Section with ChatGPT Realistic Cinema Background ── */}
      <section className="relative w-full flex items-center justify-center overflow-hidden pt-8 pb-4">
        {/* Realistic 3D Cinema Theater Background from ChatGPT link */}
        <RealisticCinemaHeroBg movies={heroMovies} />

        {/* Hero Central Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 pt-4 pb-2">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-600/20 border border-rose-500/40 text-rose-300 text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-600/20 backdrop-blur-md animate-in fade-in duration-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>Next-Gen Cinema Ticketing • Powered by IMDb</span>
          </div>

          {/* Main Hero Header */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight uppercase drop-shadow-2xl">
              SMART<span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-amber-400 to-indigo-400">CINE</span>
            </h1>
            <p className="text-lg sm:text-2xl font-bold text-slate-200 tracking-tight drop-shadow-md">
              "Every Language. Real IMDb Scores. 3D Immersion."
            </p>
          </div>

          {/* Supporting Text */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed drop-shadow-md">
            Discover verified IMDb top-rated movies across Telugu, Tamil, Hindi, Malayalam, Kannada, Hollywood & International cinema with real-time seat locking.
          </p>

          {/* Primary Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
            <Link to="/movies">
              <Button size="lg" className="gap-2 font-black bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white shadow-xl shadow-rose-600/40 text-sm px-8 h-12 border-0">
                <Ticket className="w-4 h-4" />
                <span>Explore All Movies</span>
              </Button>
            </Link>

            <Button
              size="lg"
              variant="outline"
              onClick={() => setIsCommandModalOpen(true)}
              className="gap-2 font-bold bg-[#0d1222]/80 backdrop-blur-md border-slate-700 hover:border-rose-500/60 text-slate-200 hover:text-white text-sm px-7 h-12 shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Ask AI Copilot</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-400">
                ⌘K
              </kbd>
            </Button>
          </div>

          {/* 3D Coverflow Hero Showcase */}
          <div className="pt-4 pb-2">
            <div className="flex items-center justify-center gap-2 mb-2 text-xs font-black uppercase tracking-widest text-amber-400">
              <Award className="w-4 h-4" />
              <span>Featured 3D Blockbuster Coverflow</span>
            </div>
            <Hero3DCoverflow movies={coverflowMovies} onWatchTrailer={handleWatchTrailer} />
          </div>
        </div>
      </section>

      {/* ── Auto-Rolling Cinemas Reel (Directly in that space) ── */}
      <section className="relative z-20 space-y-4 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between gap-4 pb-2.5 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2.5">
                  <span>Rolling Cinemas Automatically</span>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-rose-600 to-amber-500 text-white uppercase tracking-wider shadow-sm animate-pulse">
                    Live Auto-Roll
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Continuous automatic cinema reel • Hover any movie to pause, watch trailer & book seats
                </p>
              </div>
            </div>

            <Link
              to="/movies?status=now-showing"
              className="flex items-center gap-1 text-xs font-bold text-rose-400 hover:text-amber-400 transition-colors"
            >
              <span>View All Now Showing</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Row 1: Rolling Left */}
        <RollingCinemaMarquee
          movies={nowShowing.length > 0 ? nowShowing : (featured.length > 0 ? featured : topImdb)}
          loading={loadState.nowShowing && nowShowing.length === 0}
          onWatchTrailer={handleWatchTrailer}
          direction="left"
        />

        {/* Row 2: Rolling Right (Trending / Popular blockbusters) */}
        <RollingCinemaMarquee
          movies={trending.length > 0 ? trending : (topRated.length > 0 ? topRated : topImdb)}
          loading={loadState.trending && trending.length === 0}
          onWatchTrailer={handleWatchTrailer}
          direction="right"
        />
      </section>

      {/* ── Main Content Container with Generous Whitespace & Spacing ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 space-y-16 sm:space-y-20">
        {/* 🌟 IMDb Top-Rated Database Section with Language Tabs & Scrolling Rail 🌟 */}
        <section className="space-y-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
                <Award className="w-3.5 h-3.5" />
                <span>IMDb Verified Database</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
                <span className="imdb-badge text-sm">IMDb</span>
                <span>Top Rated Movies Across All Languages</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
                Highest rated cinema sensations from India & global industries with verified IMDb scores
              </p>
            </div>
            <div className="flex items-center gap-3 self-start sm:self-auto">
              {/* Scroll Controls for IMDb Movies */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => scrollImdb('left')}
                  className="w-8 h-8 rounded-full bg-slate-900/90 hover:bg-amber-500/80 border border-slate-700 hover:border-amber-500 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-md"
                  aria-label="Scroll left"
                  title="Previous movies"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollImdb('right')}
                  className="w-8 h-8 rounded-full bg-slate-900/90 hover:bg-amber-500/80 border border-slate-700 hover:border-amber-500 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-md"
                  aria-label="Scroll right"
                  title="Next movies"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <Link
                to="/movies?sort=imdb"
                className="flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors ml-1"
              >
                <span>Full Leaderboard</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Interactive Language Selector Tabs with Generous Whitespace */}
          <div className="flex items-center gap-2.5 overflow-x-auto py-3 mb-6 scrollbar-none">
            {IMDB_LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedImdbLang(lang)}
                className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all duration-200 ${
                  selectedImdbLang === lang
                    ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-black shadow-lg shadow-amber-500/25 scale-105'
                    : 'bg-[#0e1424] text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Filtered IMDb Movie Scrolling Rail with Whitespace */}
          {loadState.topImdb ? (
            <SkeletonRow />
          ) : filteredImdbMovies.length > 0 ? (
            <div
              ref={imdbScrollRef}
              className="flex items-stretch gap-7 sm:gap-8 overflow-x-auto pb-6 pt-3 px-2 scrollbar-thin scrollbar-thumb-slate-800 hover:scrollbar-thumb-amber-500/50 scroll-smooth"
              style={{ scrollSnapType: 'x proximity' }}
            >
              {filteredImdbMovies.map((movie) => (
                <div
                  key={movie._id}
                  className="flex-shrink-0 w-[240px] sm:w-[270px]"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <MovieCard3D
                    movie={movie}
                    onWatchTrailer={handleWatchTrailer}
                    badgeType="featured"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 rounded-2xl bg-[#0d1222]/60 border border-slate-800">
              <Film className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400 font-bold">No movies found in {selectedImdbLang}</p>
              <button 
                onClick={() => setSelectedImdbLang('All')}
                className="mt-3 text-xs text-rose-400 underline font-bold"
              >
                View all languages
              </button>
            </div>
          )}
        </section>

        {/* 🎬 Interactive 3D Virtual Cinema Studio 🎬 */}
        <Interactive3DTheater
          movies={topImdb.length > 0 ? topImdb : nowShowing}
          onWatchTrailer={handleWatchTrailer}
        />

        {/* 🔥 Now Showing */}
        <MovieSection
          icon={Flame}
          iconColor="text-rose-500"
          title={`Now Showing in ${city}`}
          subtitle="Experience the latest releases in IMAX 3D, 4DX, and Dolby Atmos"
          movies={nowShowing}
          loading={loadState.nowShowing}
          linkTo="/movies?status=now-showing"
          onWatchTrailer={handleWatchTrailer}
        />

        {/* 🍿 Latest Telugu Movies */}
        {latestTelugu.length > 0 && (
          <MovieSection
            icon={Film}
            iconColor="text-amber-400"
            title="Tollywood & Telugu Masterpieces"
            subtitle="Pushpa 2, Kalki 2898 AD, Devara and latest Telugu theatricals"
            movies={latestTelugu}
            loading={loadState.latestTelugu}
            linkTo="/movies?status=new-releases&language=Telugu"
            linkLabel="View All Telugu"
            onWatchTrailer={handleWatchTrailer}
            badgeType="new"
          />
        )}

        {/* 🍿 Latest Hindi Movies */}
        {latestHindi.length > 0 && (
          <MovieSection
            icon={Film}
            iconColor="text-rose-400"
            title="Bollywood & Hindi Blockbusters"
            subtitle="Stree 2, 12th Fail, Chandu Champion, Jawan and top Hindi releases"
            movies={latestHindi}
            loading={loadState.latestHindi}
            linkTo="/movies?status=new-releases&language=Hindi"
            linkLabel="View All Hindi"
            onWatchTrailer={handleWatchTrailer}
            badgeType="new"
          />
        )}

        {/* 🍿 Latest Tamil Movies */}
        {latestTamil.length > 0 && (
          <MovieSection
            icon={Film}
            iconColor="text-amber-500"
            title="Kollywood & Tamil Cinema"
            subtitle="The Greatest of All Time (GOAT), Maharaja, Leo and top Tamil hits"
            movies={latestTamil}
            loading={loadState.latestTamil}
            linkTo="/movies?status=new-releases&language=Tamil"
            linkLabel="View All Tamil"
            onWatchTrailer={handleWatchTrailer}
            badgeType="new"
          />
        )}

        {/* 🍿 Latest Malayalam Movies */}
        {latestMalayalam.length > 0 && (
          <MovieSection
            icon={Film}
            iconColor="text-emerald-400"
            title="Mollywood & Malayalam Excellence"
            subtitle="Manjummel Boys, Aadujeevitham, Aavesham, Premalu and Bramayugam"
            movies={latestMalayalam}
            loading={loadState.latestMalayalam}
            linkTo="/movies?status=new-releases&language=Malayalam"
            linkLabel="View All Malayalam"
            onWatchTrailer={handleWatchTrailer}
            badgeType="new"
          />
        )}

        {/* 🍿 Latest Kannada Movies */}
        {latestKannada.length > 0 && (
          <MovieSection
            icon={Film}
            iconColor="text-yellow-400"
            title="Sandalwood & Kannada Sensation"
            subtitle="KGF Chapter 2, Kantara, 777 Charlie and latest releases"
            movies={latestKannada}
            loading={loadState.latestKannada}
            linkTo="/movies?status=new-releases&language=Kannada"
            linkLabel="View All Kannada"
            onWatchTrailer={handleWatchTrailer}
            badgeType="new"
          />
        )}

        {/* 🌎 Hollywood / English */}
        {hollywood.length > 0 && (
          <MovieSection
            icon={Film}
            iconColor="text-indigo-400"
            title="Hollywood & International IMAX Releases"
            subtitle="Oppenheimer, Dune 2, Deadpool & Wolverine, Spider-Man Across the Spider-Verse"
            movies={hollywood}
            loading={loadState.hollywood}
            linkTo="/movies?status=new-releases&industry=Hollywood"
            linkLabel="View All Hollywood"
            onWatchTrailer={handleWatchTrailer}
            badgeType="new"
          />
        )}

        {/* 📅 Coming Soon & Anticipated 3D Releases */}
        {(loadState.upcoming || upcoming.length > 0) && (
          <MovieSection
            icon={CalendarDays}
            iconColor="text-violet-400"
            title="Upcoming & Advance Booking"
            subtitle="Avatar: Fire and Ash, Spider-Man: Beyond the Spider-Verse, Baahubali 3 & more"
            movies={upcoming}
            loading={loadState.upcoming}
            linkTo="/movies?status=coming-soon"
            linkLabel="Explore Upcoming"
            onWatchTrailer={handleWatchTrailer}
            badgeType="upcoming"
          />
        )}

        {/* Embedded SmartCine Command Center Showcase */}
        <section>
          <CommandCenterEmbed />
        </section>

        {/* 📈 Trending Now */}
        <MovieSection
          icon={TrendingUp}
          iconColor="text-rose-400"
          title="Trending Now"
          subtitle="What everyone is watching and talking about this week"
          movies={trending}
          loading={loadState.trending}
          linkTo="/movies?sort=trending"
          linkLabel="See Trending"
          onWatchTrailer={handleWatchTrailer}
          badgeType="trending"
        />

        {/* The SmartCine Advantage Feature Bar */}
        <section className="rounded-3xl border border-slate-800/80 bg-gradient-to-b from-[#0d1222]/80 to-[#070913]/90 p-8 sm:p-12 shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-rose-600/10 blur-3xl pointer-events-none" />
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-rose-400">
              The SmartCine Advantage
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Intelligent Cinema from Selection to Entry
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div className="p-6 rounded-2xl bg-[#0e1424] border border-slate-800 space-y-3 hover:border-rose-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-white">Intelligent Command Copilot</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Find shows matching your genre, budget, group size, and language using plain conversational English or speech.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0e1424] border border-slate-800 space-y-3 hover:border-amber-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-white">Atomic Real-Time Seat Locking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Socket.IO 5-minute atomic seat holds guarantee zero double-booking or seat-sniping clashes during checkout.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0e1424] border border-slate-800 space-y-3 hover:border-indigo-500/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-white">Paperless Dynamic QR Pass</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instant digital passes with scannable gate validation tokens, Apple Wallet style UI, and one-click PDF tickets.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={trailerState.isOpen}
        url={trailerState.url}
        title={trailerState.title}
        onClose={() => setTrailerState({ isOpen: false, url: '', title: '' })}
      />

      {/* Global Command Center Dialog */}
      <CommandCenterModal
        isOpen={isCommandModalOpen}
        onClose={() => setIsCommandModalOpen(false)}
      />
    </div>
  );
};

export default Home;
