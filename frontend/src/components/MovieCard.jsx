import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Ticket, Play } from 'lucide-react';

const MovieCard = ({ movie, onWatchTrailer }) => {
  if (!movie) return null;

  const isComingSoon = movie.status === 'coming-soon';

  return (
    <div className="group relative rounded-2xl overflow-hidden glass-card glass-card-hover flex flex-col h-full">
      {/* Poster Image */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
        <img
          src={movie.poster}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-950 via-transparent to-black/30 opacity-90"></div>

        {/* Rating / Status Badge */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {movie.rating > 0 ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/30 text-amber-400 font-bold text-xs shadow-lg">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {movie.rating}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-brand-600/90 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wider">
              {isComingSoon ? 'Coming Soon' : 'New'}
            </span>
          )}

          {movie.certification && (
            <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-slate-300 font-bold text-[10px] border border-slate-700">
              {movie.certification}
            </span>
          )}
        </div>

        {/* Formats Badges */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
          {movie.formats?.slice(0, 3).map((fmt) => (
            <span
              key={fmt}
              className="px-2 py-0.5 rounded bg-brand-950/80 border border-brand-500/40 text-brand-300 text-[10px] font-semibold tracking-wider"
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
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-brand-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-md hover:scale-110 shadow-lg"
            title="Watch Trailer"
          >
            <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
          </button>
        )}
      </div>

      {/* Movie Info */}
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-white line-clamp-1 group-hover:text-brand-400 transition-colors">
            {movie.title}
          </h3>

          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
            </span>
            <span>•</span>
            <span className="truncate max-w-[120px]">{movie.language?.join(', ')}</span>
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            {movie.genre?.slice(0, 2).map((g) => (
              <span key={g} className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md">
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
          <Link
            to={`/movies/${movie._id}`}
            className={`w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-md ${
              isComingSoon
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-600/30 group-hover:shadow-brand-600/50'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            {isComingSoon ? 'View Details' : 'Book Tickets'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
