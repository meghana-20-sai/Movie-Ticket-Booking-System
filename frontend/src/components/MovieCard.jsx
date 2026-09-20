import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Ticket, Play, Award } from 'lucide-react';

const MovieCard = ({ movie, onWatchTrailer }) => {
  if (!movie) return null;

  const isComingSoon = movie.status === 'coming-soon';
  const effectiveImdbRating = movie.imdbRating || (movie.rating > 0 ? (movie.rating * 1.8).toFixed(1) : null);

  return (
    <div className="group relative rounded-2xl overflow-hidden glass-card glass-card-hover flex flex-col h-full border border-slate-800/80 hover:border-rose-500/50 transition-all duration-300">
      {/* Poster Image */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#0a0e1a]">
        <img
          src={movie.poster}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070913] via-transparent to-black/40 opacity-90" />

        {/* Rating / Status Badge */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
          {effectiveImdbRating ? (
            <span className="imdb-badge shadow-md">
              IMDb {effectiveImdbRating}
            </span>
          ) : movie.rating > 0 ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 text-amber-400 font-bold text-xs shadow-lg">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {movie.rating}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-rose-600/90 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wider shadow-md">
              {isComingSoon ? 'Coming Soon' : 'New'}
            </span>
          )}

          {movie.certification && (
            <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-slate-300 font-bold text-[10px] border border-slate-700">
              {movie.certification}
            </span>
          )}
          {movie.isDubbed && (
            <span className="px-2 py-0.5 rounded bg-emerald-600/90 backdrop-blur-md text-white font-bold text-[10px] border border-emerald-500/50 uppercase">
              Multi-Lang
            </span>
          )}
        </div>

        {/* Formats Badges */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1 z-10">
          {movie.formats?.slice(0, 3).map((fmt) => (
            <span
              key={fmt}
              className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                fmt.includes('3D') || fmt === 'IMAX'
                  ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-sm'
                  : 'bg-slate-900/80 border border-slate-700 text-slate-300'
              }`}
            >
              {fmt}
            </span>
          ))}
        </div>

        {/* Quick Trailer Button Overlay */}
        {movie.trailerUrl && onWatchTrailer && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onWatchTrailer(movie.trailerUrl, movie.title);
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md hover:scale-110 shadow-lg z-20"
            title="Watch Trailer"
          >
            <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
          </button>
        )}
      </div>

      {/* Movie Info */}
      <div className="p-4 flex flex-col flex-grow justify-between space-y-3">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-white line-clamp-1 group-hover:text-rose-400 transition-colors">
            {movie.title}
          </h3>

          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
            </span>
            <span>•</span>
            <span className="truncate max-w-[120px] font-medium text-slate-300">
              {movie.language?.[0] || movie.originalLanguage || 'Feature Film'}
            </span>
            <span>•</span>
            <span>{new Date(movie.releaseDate).getFullYear()}</span>
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            {movie.genre?.slice(0, 2).map((g) => (
              <span key={g} className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/40">
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <Link
          to={isComingSoon ? `/movies/${movie._id}` : `/movies/${movie._id}`}
          className="block w-full mt-2"
        >
          <button
            className={`w-full py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md ${
              isComingSoon
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                : 'bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white shadow-rose-600/30'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>{isComingSoon ? 'View Details' : 'Book Tickets'}</span>
          </button>
        </Link>
      </div>
    </div>
  );
};

export default MovieCard;
