import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Film, Sparkles, Play, Ticket, Award, ExternalLink } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export default function MovieCard3D({ movie, onWatchTrailer, badgeType }) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // 3D Tilt calculation (max 14 degrees)
    const rotateX = ((y - centerY) / centerY) * -14;
    const rotateY = ((x - centerX) / centerX) * 14;

    // Holographic glare coordinate tracking
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setRotate({ x: rotateX, y: rotateY });
    setGlare({ x: glareX, y: glareY, opacity: 0.65 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlare({ x: 50, y: 50, opacity: 0 });
    setIsHovered(false);
  };

  const effectiveImdbRating = movie.imdbRating || (movie.rating > 0 ? (movie.rating * 1.8).toFixed(1) : null);

  return (
    <div
      className="group relative perspective-1200 select-none transition-transform duration-300 hover:z-30"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(${isHovered ? 1.04 : 1}, ${
            isHovered ? 1.04 : 1
          }, 1)`,
          transformStyle: 'preserve-3d',
          transition: isHovered ? 'transform 0.12s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
        className="relative h-[445px] rounded-2xl overflow-hidden bg-[#0d1222] border border-slate-800/80 shadow-2xl transition-all duration-300 group-hover:border-rose-500/60 group-hover:shadow-[0_20px_45px_-12px_rgba(225,29,72,0.35),0_0_25px_-5px_rgba(245,197,24,0.2)]"
      >
        {/* Layer 0: Poster Image with 3D Depth */}
        <div
          style={{ transform: 'translateZ(0px)' }}
          className="absolute inset-0 w-full h-full overflow-hidden"
        >
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-110 group-hover:brightness-105"
            loading="lazy"
          />
        </div>

        {/* Dynamic Holographic Specular Glare Layer */}
        <div
          style={{
            transform: 'translateZ(15px)',
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.45) 0%, rgba(245, 197, 24, 0.18) 25%, transparent 65%)`,
            opacity: glare.opacity,
            transition: 'opacity 0.25s ease',
          }}
          className="absolute inset-0 pointer-events-none mix-blend-overlay z-20"
        />

        {/* Ambient Dark Gradient Underlay */}
        <div 
          style={{ transform: 'translateZ(10px)' }}
          className="absolute inset-0 bg-gradient-to-t from-[#070913] via-[#070913]/55 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-95" 
        />

        {/* Layer 2: Top Floating Badges (elevated in 3D space) */}
        <div
          style={{ transform: 'translateZ(38px)' }}
          className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-30 transition-transform duration-300"
        >
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* IMDb Iconic Yellow Badge */}
            {effectiveImdbRating && (
              <span 
                className="imdb-badge font-black shadow-md cursor-pointer hover:scale-105 transition-transform"
                title={`IMDb Score: ${effectiveImdbRating}/10 (${movie.imdbVotes || 'Verified Reviews'})`}
              >
                IMDb <span className="text-black font-black">{effectiveImdbRating}</span>
              </span>
            )}

            {/* Certification */}
            <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-slate-700/80 text-[10px] font-black uppercase text-slate-300">
              {movie.certification || 'UA'}
            </span>

            {/* 3D / IMAX Badge */}
            {movie.formats?.some(f => f.includes('3D') || f === 'IMAX') ? (
              <span className="px-2 py-0.5 rounded bg-gradient-to-r from-rose-600 to-amber-500 text-[10px] font-black uppercase text-white shadow-sm shadow-rose-600/40">
                3D Experience
              </span>
            ) : movie.formats?.length > 0 ? (
              <span className="px-2 py-0.5 rounded bg-rose-600 text-[10px] font-black uppercase text-white shadow-sm shadow-rose-600/40">
                {movie.formats[0]}
              </span>
            ) : null}

            {movie.isDubbed && (
              <span className="px-2 py-0.5 rounded bg-emerald-600/90 backdrop-blur-md border border-emerald-500/50 text-[10px] font-black uppercase text-white shadow-sm shadow-emerald-600/30">
                Multi-Audio
              </span>
            )}
          </div>

          {/* User / Critic Star Rating if present */}
          {movie.rating > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-amber-500/40 text-amber-400 text-xs font-black shadow-lg">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{movie.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Layer 3: Floating 3D Trailer Play Button (pops forward in 3D) */}
        {movie.trailerUrl && (
          <div
            style={{ transform: 'translateZ(55px)' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onWatchTrailer?.(movie.trailerUrl, movie.title);
              }}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white flex items-center justify-center shadow-[0_0_25px_rgba(225,29,72,0.6)] opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 backdrop-blur-md border border-white/30"
              title="Watch Trailer in 3D"
            >
              <Play className="w-6 h-6 fill-white ml-0.5 drop-shadow" />
            </button>
          </div>
        )}

        {/* Layer 4: Bottom Content & Booking Controls (elevated in 3D space) */}
        <div
          style={{ transform: 'translateZ(30px)' }}
          className="absolute bottom-0 inset-x-0 p-4 z-30 space-y-2.5 transition-transform duration-300"
        >
          {/* Title */}
          <h3 className="text-base font-black text-white line-clamp-1 group-hover:text-rose-400 transition-colors drop-shadow-md">
            {movie.title}
          </h3>

          {/* Language and Genre */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-300 font-medium">
            <span className="px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/50 text-slate-200 font-bold">
              {movie.language?.[0] || movie.originalLanguage || 'Multi-Lang'}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 truncate max-w-[170px]">
              {Array.isArray(movie.genre)
                ? movie.genre.slice(0, 2).join(', ')
                : typeof movie.genre === 'string'
                ? movie.genre.split(' ').slice(0, 2).join(', ')
                : 'Action/Drama'}
            </span>
          </div>

          {/* Runtime & Year */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              {movie.duration ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` : '2h 15m'}
            </span>
            <span>{new Date(movie.releaseDate || Date.now()).getFullYear()}</span>
          </div>

          {/* Action CTA with 3D Depth */}
          <div 
            style={{ transform: 'translateZ(18px)' }}
            className="pt-1 flex items-center gap-2"
          >
            <Link to={`/movies/${movie._id}`} className="w-full">
              <Button 
                size="sm" 
                className="w-full gap-1.5 font-black bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white shadow-lg shadow-rose-600/30 border-0 h-9"
              >
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
