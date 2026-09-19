import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Film, Sparkles, Play, Ticket } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export default function MovieCard3D({ movie, onWatchTrailer }) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12; // Max 12deg tilt
    const rotateY = ((x - centerX) / centerX) * 12;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div
      className="group relative perspective-1000 select-none"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <div
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(${isHovered ? 1.03 : 1}, ${
            isHovered ? 1.03 : 1
          }, 1)`,
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.5s ease-out',
        }}
        className="relative h-[430px] rounded-2xl overflow-hidden bg-cinema-900 border border-slate-800/80 shadow-2xl transition-all duration-300 group-hover:border-brand-500/50 group-hover:shadow-brand-600/20"
      >
        {/* Poster Image */}
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-108"
          loading="lazy"
        />

        {/* Ambient Glow Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-950 via-cinema-950/40 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-95" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-slate-700/80 text-[10px] font-black uppercase text-slate-300">
              {movie.certification || 'UA'}
            </span>
            {movie.formats?.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-brand-600 text-[10px] font-black uppercase text-white shadow-sm shadow-brand-600/40">
                {movie.formats[0]}
              </span>
            )}
          </div>

          {movie.rating > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-amber-500/40 text-amber-400 text-xs font-black">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{movie.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Play Trailer Floating Button */}
        {movie.trailerUrl && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onWatchTrailer?.(movie.trailerUrl, movie.title);
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-brand-600/90 hover:bg-brand-500 text-white flex items-center justify-center shadow-xl shadow-brand-600/40 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 z-20 backdrop-blur-sm"
            title="Watch Official Trailer"
          >
            <Play className="w-6 h-6 fill-white ml-0.5" />
          </button>
        )}

        {/* Bottom Content Info */}
        <div className="absolute bottom-0 inset-x-0 p-4 z-10 space-y-2">
          {/* Title */}
          <h3 className="text-base font-black text-white line-clamp-1 group-hover:text-brand-400 transition-colors">
            {movie.title}
          </h3>

          {/* Genre & Duration */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
            <span>{movie.genre?.slice(0, 2).join(' • ') || 'Feature Film'}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
            </span>
          </div>

          {/* Action CTAs */}
          <div className="pt-1 flex items-center gap-2">
            <Link to={`/movies/${movie._id}`} className="w-full">
              <Button size="sm" className="w-full gap-1.5 font-bold shadow-lg shadow-brand-600/30">
                <Ticket className="w-3.5 h-3.5" />
                <span>Book Tickets</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
