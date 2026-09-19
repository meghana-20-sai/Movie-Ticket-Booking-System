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
  Armchair,
  Compass,
  CreditCard,
  QrCode,
  Users,
} from 'lucide-react';
import { movieService } from '../services/movieService';
import { useAuth } from '../context/AuthContext';
import MovieCard3D from '../components/3d/MovieCard3D';
import CinemaCanvas from '../components/3d/CinemaCanvas';
import CommandCenterEmbed from '../components/command/CommandCenterEmbed';
import CommandCenterModal from '../components/command/CommandCenterModal';
import TrailerModal from '../components/TrailerModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const Home = () => {
  const { city } = useAuth();
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trailerState, setTrailerState] = useState({ isOpen: false, url: '', title: '' });
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);

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

  const handleWatchTrailer = (url, title) => {
    setTrailerState({ isOpen: true, url, title });
  };

  if (loading) {
    return <LoadingSpinner text="Preparing cinema experience..." />;
  }

  return (
    <div className="space-y-20 pb-24 overflow-hidden">
      {/* 3D Cinematic Hero Section */}
      <section className="relative w-full min-h-[640px] lg:h-[720px] flex items-center justify-center overflow-hidden">
        {/* Three.js 3D WebGL Canvas Layer */}
        <CinemaCanvas />

        {/* Ambient Dark Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-950 via-cinema-950/60 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-950/80 via-transparent to-cinema-950/80 pointer-events-none" />

        {/* Hero Central Typography & CTAs */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 pt-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-600/20 border border-brand-500/40 text-brand-300 text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-600/20 backdrop-blur-md animate-in fade-in duration-700">
            <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-spin" />
            <span>Next-Gen Cinema Ticketing Experience</span>
          </div>

          {/* Main Hero Header */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight uppercase drop-shadow-2xl">
              SMART<span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-rose-400 to-amber-400">CINE</span>
            </h1>
            <p className="text-lg sm:text-2xl font-bold text-slate-200 tracking-tight">
              "Your movie. Your seat. Your experience."
            </p>
          </div>

          {/* Supporting Text */}
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed drop-shadow-md">
            Discover blockbuster movies, find your perfect viewing seat, and book your entire movie experience intelligently.
          </p>

          {/* Primary & Secondary Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link to="/movies">
              <Button size="lg" variant="gradient" className="gap-2 font-black shadow-xl shadow-brand-600/40 text-sm px-7 h-12">
                <Ticket className="w-4 h-4" />
                <span>Explore Movies</span>
              </Button>
            </Link>

            <Button
              size="lg"
              variant="outline"
              onClick={() => setIsCommandModalOpen(true)}
              className="gap-2 font-bold bg-cinema-900/80 backdrop-blur-md border-brand-500/40 text-brand-200 hover:text-white hover:border-brand-400 text-sm px-7 h-12"
            >
              <Sparkles className="w-4 h-4 text-brand-400 animate-pulse" />
              <span>Ask SmartCine</span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-slate-400">
                ⌘K
              </kbd>
            </Button>
          </div>

          {/* Feature Highlights Bar */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400 font-semibold">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-500" />
              <span>Real-Time Seat Locking</span>
            </div>
            <div className="flex items-center gap-2">
              <Armchair className="w-4 h-4 text-rose-400" />
              <span>Best Angle AI Recommendations</span>
            </div>
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>Instant QR Pass & PDF</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Now Showing Section with 3D Cards */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                <Film className="w-6 h-6 text-brand-500" />
                <span>Now Showing in {city}</span>
              </h2>
              <p className="text-xs text-slate-400">
                Experience the latest releases in IMAX 3D, 4DX, and Dolby Atmos
              </p>
            </div>

            <Link
              to="/movies?status=now-showing"
              className="flex items-center gap-1 text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* 3D Movie Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {nowShowing.slice(0, 8).map((movie) => (
              <MovieCard3D
                key={movie._id}
                movie={movie}
                onWatchTrailer={handleWatchTrailer}
              />
            ))}
          </div>
        </section>

        {/* Embedded SmartCine Command Center Showcase */}
        <section>
          <CommandCenterEmbed />
        </section>

        {/* Coming Soon Section */}
        {comingSoon.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                  <Sparkles className="w-6 h-6 text-amber-400" />
                  <span>Upcoming Premieres</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Be the first to know and book early advance screenings
                </p>
              </div>

              <Link
                to="/movies?status=coming-soon"
                className="flex items-center gap-1 text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors"
              >
                <span>Explore Upcoming</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {comingSoon.slice(0, 4).map((movie) => (
                <MovieCard3D
                  key={movie._id}
                  movie={movie}
                  onWatchTrailer={handleWatchTrailer}
                />
              ))}
            </div>
          </section>
        )}

        {/* How It Works & Core Advantages */}
        <section className="rounded-3xl border border-slate-800/80 bg-cinema-900/60 p-8 sm:p-12 shadow-2xl backdrop-blur-md">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-brand-400">
              The SmartCine Advantage
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              Effortless Cinema from Selection to Entry
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-cinema-850 border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-white">Intelligent Command Copilot</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Find shows matching your genre, budget, group size, and favorite time slot using plain English or speech.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-cinema-850 border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-white">Zero Concurrency Clashes</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Socket.IO 5-minute atomic seat holds ensure you never lose selected seats during checkout.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-cinema-850 border border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-white">Paperless Dynamic QR Pass</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instant digital passes with scannable gate validation tokens and one-click PDF downloads.
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
