import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Clock,
  Calendar,
  Play,
  Ticket,
  MapPin,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  ChevronDown,
  Bell,
  Sparkles,
  TrendingUp,
  Flame,
  Globe,
  Users,
} from 'lucide-react';
import { movieService } from '../services/movieService';
import { useAuth } from '../context/AuthContext';
import MovieCard3D from '../components/3d/MovieCard3D';
import DateSelector from '../components/DateSelector';
import TheatreCard from '../components/TheatreCard';
import TrailerModal from '../components/TrailerModal';
import ReviewModal from '../components/ReviewModal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const MovieDetails = () => {
  const { movieId } = useParams();
  const { city, isAuthenticated } = useAuth();

  const [movie, setMovie] = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [theatresWithShows, setTheatresWithShows] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showsLoading, setShowsLoading] = useState(false);
  const [notified, setNotified] = useState(false);

  const [trailerOpen, setTrailerOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  // Check watchlist/notification state from localStorage
  useEffect(() => {
    const watchlist = JSON.parse(localStorage.getItem('sc_watchlist') || '[]');
    setNotified(watchlist.includes(movieId));
  }, [movieId]);

  // 1. Fetch movie details and available dates; increment view count
  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        const [movieRes, datesRes, reviewsRes] = await Promise.all([
          movieService.getMovieById(movieId),
          movieService.getAvailableDates(movieId, { city }),
          movieService.getMovieReviews(movieId),
        ]);

        if (movieRes.success) {
          setMovie(movieRes.data);
          setRelatedMovies(movieRes.related || []);
          // Increment view count (fire and forget)
          movieService.incrementView(movieId).catch(() => {});
        }

        if (datesRes.success && datesRes.data.length > 0) {
          setAvailableDates(datesRes.data);
          setSelectedDate(datesRes.data[0]);
        }

        if (reviewsRes.success) {
          setReviews(reviewsRes.data);
        }
      } catch (error) {
        console.error('Failed to load movie details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  }, [movieId, city]);

  // 2. Fetch shows when selectedDate or city changes
  useEffect(() => {
    const fetchShowsForDate = async () => {
      if (!selectedDate) return;
      try {
        setShowsLoading(true);
        const res = await movieService.getShowsForMovie(movieId, {
          date: selectedDate,
          city,
        });
        if (res.success) {
          setTheatresWithShows(res.data);
        }
      } catch (error) {
        console.error('Failed to load shows:', error);
      } finally {
        setShowsLoading(false);
      }
    };

    fetchShowsForDate();
  }, [movieId, selectedDate, city]);

  const scrollToBookings = () => {
    const el = document.getElementById('booking-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleReviewSubmitted = (newReview) => {
    setReviews((prev) => [newReview, ...prev]);
  };

  const handleNotifyMe = () => {
    const watchlist = JSON.parse(localStorage.getItem('sc_watchlist') || '[]');
    if (notified) {
      const updated = watchlist.filter((id) => id !== movieId);
      localStorage.setItem('sc_watchlist', JSON.stringify(updated));
      setNotified(false);
    } else {
      watchlist.push(movieId);
      localStorage.setItem('sc_watchlist', JSON.stringify(watchlist));
      setNotified(true);
    }
  };

  // Compute dynamic status flags from model data
  const isComingSoon = movie?.status === 'coming-soon' || (movie?.releaseDate && new Date(movie.releaseDate) > new Date());
  const diffDays = movie?.releaseDate ? (new Date() - new Date(movie.releaseDate)) / (1000 * 60 * 60 * 24) : 999;
  const isNewRelease = diffDays >= 0 && diffDays <= 30;
  const hasNoShows = !isComingSoon && availableDates.length === 0 && !loading;

  if (loading) {
    return <LoadingSpinner text="Loading movie premiere details..." />;
  }

  if (!movie) {
    return (
      <EmptyState
        title="Movie not found"
        description="The movie you are looking for is no longer in theatres or does not exist."
        actionText="Explore Movies"
        actionLink="/movies"
      />
    );
  }

  return (
    <div className="space-y-12 pb-24">
      {/* Movie Hero Header with Backdrop */}
      <section className="relative w-full min-h-[500px] flex items-end overflow-hidden">
        {/* Backdrop Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={movie.backdrop || movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover object-top scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070913] via-[#070913]/85 to-black/40"></div>
        </div>

        {/* Content Details */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
            {/* Poster Card with 3D Tilt Hover */}
            <div className="hidden md:block md:col-span-1">
              <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden bg-[#0d1222] border border-slate-700/80 shadow-[0_20px_50px_-10px_rgba(225,29,72,0.35)] hover:scale-105 transition-transform duration-500">
                <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Movie Info */}
            <div className="md:col-span-3 space-y-4">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Official Yellow IMDb Badge */}
                {(movie.imdbRating || movie.rating > 0) && (
                  <a
                    href={movie.imdbId ? `https://www.imdb.com/title/${movie.imdbId}` : 'https://www.imdb.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="imdb-badge text-xs font-black shadow-lg hover:scale-105 transition-transform cursor-pointer"
                    title="View verified title on IMDb"
                  >
                    IMDb <span className="text-black font-black">{movie.imdbRating || (movie.rating * 1.8).toFixed(1)}</span>
                    <span className="text-[10px] text-black/70 font-normal">({movie.imdbVotes || 'Verified'})</span>
                  </a>
                )}

                {movie.rating > 0 && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {movie.rating} / 5.0
                  </span>
                )}

                {movie.awards && (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 font-semibold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {movie.awards}
                  </span>
                )}

                <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 font-bold text-xs">
                  {movie.certification}
                </span>

                <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
                </span>

                {isNewRelease && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs uppercase animate-pulse">
                    🆕 New Release
                  </span>
                )}

                {movie.isTrending && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 font-bold text-xs">
                    <TrendingUp className="w-3 h-3" /> Trending
                  </span>
                )}

                {movie.isFeatured && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-500/40 text-brand-400 font-bold text-xs">
                    <Sparkles className="w-3 h-3" /> Featured
                  </span>
                )}

                <span className="px-3 py-1 rounded-full bg-brand-950 border border-brand-500/40 text-brand-300 font-bold text-xs uppercase">
                  {movie.status.replace('-', ' ')}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                {movie.title}
              </h1>

              {/* Formats & Languages */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <div className="flex flex-wrap gap-1">
                  {movie.formats?.map((f) => (
                    <span
                      key={f}
                      className="px-2 py-0.5 rounded bg-brand-600/30 border border-brand-500/40 text-brand-300 font-bold text-[10px]"
                    >
                      {f}
                    </span>
                  ))}
                </div>
                <span>•</span>
                <span className="font-semibold">{movie.language?.join(', ')}</span>
                <span>•</span>
                <span>{movie.genre?.join(', ')}</span>
              </div>

              {/* Synopsis */}
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
                {movie.description}
              </p>

              {/* Cast & Crew */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 text-slate-400">
                <div>
                  <span className="font-bold text-white">Cast: </span>
                  <span>{movie.cast?.join(', ')}</span>
                </div>
                <div>
                  <span className="font-bold text-white">Director: </span>
                  <span>{movie.director}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                {!isComingSoon && !hasNoShows && (
                  <button
                    onClick={scrollToBookings}
                    className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-xl shadow-brand-600/30 hover:scale-105 active:scale-95 transition-all"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Book Tickets</span>
                  </button>
                )}

                {(isComingSoon || hasNoShows) && (
                  <button
                    onClick={handleNotifyMe}
                    className={`flex items-center gap-2 px-7 py-3.5 rounded-2xl border font-bold text-sm hover:scale-105 active:scale-95 transition-all ${
                      notified
                        ? 'bg-violet-600/20 border-violet-500/40 text-violet-300'
                        : 'bg-cinema-900/80 border-slate-700 text-slate-200 hover:border-violet-500/50'
                    }`}
                  >
                    <Bell className={`w-4 h-4 ${notified ? 'fill-violet-400' : ''}`} />
                    <span>{notified ? 'Notification Set ✓' : 'Notify Me'}</span>
                  </button>
                )}

                {hasNoShows && !isComingSoon && (
                  <span className="text-xs text-slate-400 italic py-2">
                    Currently not available for booking in your city.
                  </span>
                )}

                {movie.trailerUrl && (
                  <button
                    onClick={() => setTrailerOpen(true)}
                    className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm backdrop-blur-md hover:scale-105 transition-all"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Watch Trailer</span>
                  </button>
                )}

                {isAuthenticated && !isComingSoon && (
                  <button
                    onClick={() => setReviewModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-cinema-850 hover:bg-slate-800 border border-slate-700 text-amber-400 font-bold text-xs transition-all"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>Rate Movie</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking / Theatres & Showtimes Section */}
      {!isComingSoon && (
        <section id="booking-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-500" />
                <span className="text-xs font-black uppercase tracking-wider text-brand-400">
                  Select Theatre & Showtime in {city}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mt-0.5">Available Cinemas</h2>
            </div>
          </div>

          {/* Date Selector */}
          {availableDates.length > 0 ? (
            <DateSelector
              availableDates={availableDates}
              selectedDate={selectedDate}
              onSelectDate={(d) => setSelectedDate(d)}
            />
          ) : (
            <p className="text-xs text-slate-400">No scheduled shows found for {city}.</p>
          )}

          {/* Theatres List */}
          {showsLoading ? (
            <LoadingSpinner text="Loading theatre showtimes..." />
          ) : theatresWithShows.length > 0 ? (
            <div className="space-y-4">
              {theatresWithShows.map((theatreData) => (
                <TheatreCard
                  key={theatreData.theatre._id}
                  theatreData={theatreData}
                  movie={movie}
                  selectedDate={selectedDate}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No showtimes available"
              description={`There are currently no shows scheduled for this date in ${city}. Please select another date or city.`}
            />
          )}
        </section>
      )}

      {/* Reviews & Ratings Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-900">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              Community Ratings
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
              Audience Reviews ({reviews.length})
            </h3>
          </div>

          {isAuthenticated ? (
            <button
              onClick={() => setReviewModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600/20 hover:bg-brand-600 border border-brand-500/40 text-brand-300 hover:text-white text-xs font-bold transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Write a Review</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="text-xs text-slate-400 hover:text-white underline font-medium"
            >
              Sign in to write a review
            </Link>
          )}
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="bg-cinema-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-brand-600/30 border border-brand-500/40 flex items-center justify-center text-brand-400 font-bold text-xs">
                      {rev.userId?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">
                        {rev.userId?.name || 'Verified Moviegoer'}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {rev.userId?.preferredCity || 'India'}
                      </p>
                    </div>
                  </div>

                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {rev.rating}.0
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{rev.comment}"
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                  <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <ShieldCheck className="w-3 h-3" /> Verified Customer
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No reviews yet. Be the first to share your thoughts!</p>
        )}
      </section>

      {/* Related Movies */}
      {relatedMovies.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-900">
          <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            You Might Also Like
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {relatedMovies.map((rm) => (
              <Link key={rm._id} to={`/movies/${rm._id}`} className="group block">
                <div className="aspect-[2/3] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 group-hover:border-brand-500/50 transition-all">
                  <img
                    src={rm.poster}
                    alt={rm.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.src = 'https://placehold.co/200x300/1e293b/94a3b8?text=SmartCine'; }}
                    loading="lazy"
                  />
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-300 truncate group-hover:text-white transition-colors">{rm.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Modals */}
      <TrailerModal
        isOpen={trailerOpen}
        onClose={() => setTrailerOpen(false)}
        trailerUrl={movie.trailerUrl}
        title={movie.title}
      />

      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        movieId={movie._id}
        movieTitle={movie.title}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
};

export default MovieDetails;
