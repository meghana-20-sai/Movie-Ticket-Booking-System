import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Play,
  Ticket,
  Star,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Zap,
  Tag,
  Film,
  Building2,
} from 'lucide-react';
import { movieService } from '../services/movieService';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/MovieCard';
import TrailerModal from '../components/TrailerModal';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const { city } = useAuth();
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trailerState, setTrailerState] = useState({ isOpen: false, url: '', title: '' });
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const fetchHomeMovies = async () => {
      try {
        setLoading(true);
        const res = await movieService.getMovies({ limit: 12, sort: 'popular' });
        if (res.success) {
          setMovies(res.data);
        }
      } catch (error) {
        console.error('Failed to load home movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeMovies();
  }, []);

  const nowShowing = movies.filter((m) => m.status === 'now-showing');
  const comingSoon = movies.filter((m) => m.status === 'coming-soon');
  const heroMovie = nowShowing[heroIndex] || movies[0];

  const handleWatchTrailer = (url, title) => {
    setTrailerState({ isOpen: true, url, title });
  };

  if (loading) {
    return <LoadingSpinner text="Preparing cinema experience..." />;
  }

  return (
    <div className="space-y-16 pb-20">
      {/* Cinematic Hero Section */}
      {heroMovie && (
        <section className="relative w-full min-h-[580px] lg:h-[680px] flex items-end overflow-hidden">
          {/* Hero Backdrop */}
          <div className="absolute inset-0 z-0">
            <img
              src={heroMovie.backdrop || heroMovie.poster}
              alt={heroMovie.title}
              className="w-full h-full object-cover object-top scale-105 transition-all duration-1000"
            />
            {/* Cinematic Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/75 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#090a0f] via-[#090a0f]/80 to-transparent"></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 w-full">
            <div className="max-w-2xl space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-brand-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-brand-600/40">
                  Featured Premiere
                </span>

                {heroMovie.rating > 0 && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 text-amber-400 font-black text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {heroMovie.rating} / 5.0
                  </span>
                )}

                <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 font-bold text-xs">
                  {heroMovie.certification}
                </span>

                <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {Math.floor(heroMovie.duration / 60)}h {heroMovie.duration % 60}m
                </span>
              </div>

              {/* Movie Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
                {heroMovie.title}
              </h1>

              {/* Description */}
              <p className="text-slate-300 text-sm sm:text-base line-clamp-3 leading-relaxed max-w-xl">
                {heroMovie.description}
              </p>

              {/* Meta details */}
              <div className="flex flex-wrap gap-2 pt-1 text-xs text-slate-400">
                <span className="font-semibold text-white">Cast:</span>
                <span>{heroMovie.cast?.slice(0, 3).join(', ')}</span>
                <span>•</span>
                <span className="font-semibold text-white">Director:</span>
                <span>{heroMovie.director}</span>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-3">
                <Link
                  to={`/movies/${heroMovie._id}`}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-xl shadow-brand-600/40 hover:shadow-brand-600/60 hover:scale-105 active:scale-95 transition-all"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Book Tickets in {city}</span>
                </Link>

                {heroMovie.trailerUrl && (
                  <button
                    onClick={() => handleWatchTrailer(heroMovie.trailerUrl, heroMovie.title)}
                    className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm backdrop-blur-md hover:scale-105 transition-all"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Watch Trailer</span>
                  </button>
                )}
              </div>
            </div>

            {/* Hero Quick Navigation Dots */}
            {nowShowing.length > 1 && (
              <div className="flex items-center gap-2 mt-8">
                {nowShowing.slice(0, 5).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setHeroIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      heroIndex === idx ? 'w-8 bg-brand-500' : 'w-2 bg-slate-700 hover:bg-slate-500'
                    }`}
                  ></button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Now Showing Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-ping"></span>
              <span className="text-xs font-black uppercase tracking-widest text-brand-400">
                Playing in {city}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Now Showing</h2>
          </div>

          <Link
            to="/movies?status=now-showing"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-400 hover:text-brand-300 group"
          >
            <span>View All Movies</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {nowShowing.slice(0, 5).map((movie) => (
            <MovieCard key={movie._id} movie={movie} onWatchTrailer={handleWatchTrailer} />
          ))}
        </div>
      </section>

      {/* Formats Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-cinema-900 via-cinema-850 to-cinema-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="max-w-xl space-y-4">
            <span className="px-3 py-1 rounded-full bg-brand-600/20 text-brand-400 border border-brand-500/30 text-xs font-bold uppercase tracking-wider">
              Supreme Visuals & Acoustics
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              Experience Cinema Beyond Imagination
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Step into laser-sharp IMAX projections, crystal-clear 360° Dolby Atmos surround audio, and plush luxury recliners across our partner multiplexes.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-cinema-950/70 border border-slate-800 text-center">
                <p className="text-sm font-black text-brand-400">IMAX Laser</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Expanded 1.90:1</p>
              </div>
              <div className="p-3 rounded-2xl bg-cinema-950/70 border border-slate-800 text-center">
                <p className="text-sm font-black text-brand-400">Dolby Atmos</p>
                <p className="text-[10px] text-slate-500 mt-0.5">3D Spatial Sound</p>
              </div>
              <div className="p-3 rounded-2xl bg-cinema-950/70 border border-slate-800 text-center">
                <p className="text-sm font-black text-brand-400">4DX Sensations</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Motion & Wind</p>
              </div>
              <div className="p-3 rounded-2xl bg-cinema-950/70 border border-slate-800 text-center">
                <p className="text-sm font-black text-brand-400">VIP Lounges</p>
                <p className="text-[10px] text-slate-500 mt-0.5">In-Seat Butler</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      {comingSoon.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-brand-400">
                Upcoming Blockbusters
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">Coming Soon</h2>
            </div>
            <Link
              to="/movies?status=coming-soon"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-400 hover:text-brand-300 group"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {comingSoon.slice(0, 5).map((movie) => (
              <MovieCard key={movie._id} movie={movie} onWatchTrailer={handleWatchTrailer} />
            ))}
          </div>
        </section>
      )}

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={trailerState.isOpen}
        onClose={() => setTrailerState({ isOpen: false, url: '', title: '' })}
        trailerUrl={trailerState.url}
        title={trailerState.title}
      />
    </div>
  );
};

export default Home;
