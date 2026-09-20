import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, Ticket, ChevronLeft, ChevronRight, Star, Sparkles, Award } from 'lucide-react';
import { Button } from '../ui/button';

export default function Hero3DCoverflow({ movies = [], onWatchTrailer }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const displayMovies = movies.length > 0 ? movies.slice(0, 7) : [];
  const total = displayMovies.length;

  useEffect(() => {
    if (total <= 1 || isPaused) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 4500);

    return () => clearInterval(timerRef.current);
  }, [total, isPaused]);

  if (total === 0) return null;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const activeMovie = displayMovies[activeIndex] || {};

  return (
    <div 
      className="relative w-full max-w-6xl mx-auto py-12 sm:py-16 px-4 sm:px-8 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 3D Coverflow Track with Generous Whitespace */}
      <div className="relative h-[460px] sm:h-[520px] flex items-center justify-center perspective-1200 overflow-visible my-4">
        {displayMovies.map((movie, index) => {
          // Calculate offset relative to active card (-3 to +3)
          let offset = index - activeIndex;
          if (offset < -Math.floor(total / 2)) offset += total;
          if (offset > Math.floor(total / 2)) offset -= total;

          const isActive = offset === 0;
          const isVisible = Math.abs(offset) <= 2;

          if (!isVisible) return null;

          // 3D Matrix transform parameters with extra breathing room
          const translateX = offset * 245; // generous spread along X axis
          const translateZ = -Math.abs(offset) * 170; // push side cards back
          const rotateY = offset * -30; // rotate side cards inward
          const scale = isActive ? 1.06 : 0.82;
          const opacity = isActive ? 1 : Math.max(0.35, 1 - Math.abs(offset) * 0.35);
          const zIndex = 30 - Math.abs(offset) * 5;

          const imdbRating = movie.imdbRating || (movie.rating ? (movie.rating * 1.8).toFixed(1) : '8.5');

          return (
            <div
              key={movie._id || index}
              onClick={() => setActiveIndex(index)}
              style={{
                transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                zIndex,
                opacity,
                transformStyle: 'preserve-3d',
                transition: 'all 0.65s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
              className={`absolute top-4 w-[230px] sm:w-[270px] h-[350px] sm:h-[400px] rounded-2xl cursor-pointer transition-shadow duration-300 ${
                isActive 
                  ? 'ring-2 ring-rose-500/70 shadow-[0_20px_50px_-10px_rgba(225,29,72,0.45),0_0_30px_-5px_rgba(245,197,24,0.3)]' 
                  : 'hover:opacity-90'
              }`}
            >
              {/* Card Surface */}
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-[#0d1222] border border-slate-700/60 shadow-2xl">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover object-center"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#070913] via-[#070913]/30 to-transparent" />

                {/* Top IMDb Badge */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                  <span className="imdb-badge font-black shadow-md">
                    IMDb {imdbRating}
                  </span>
                  {movie.formats?.includes('3D') && (
                    <span className="px-2 py-0.5 rounded bg-gradient-to-r from-rose-600 to-amber-500 text-[10px] font-black uppercase text-white shadow-sm">
                      3D
                    </span>
                  )}
                </div>

                {/* Active Card Quick Controls */}
                {isActive && (
                  <div className="absolute inset-0 flex flex-col justify-end p-4 z-10 space-y-2 bg-gradient-to-t from-[#070913] via-[#070913]/70 to-transparent animate-in fade-in duration-300">
                    <span className="inline-block px-2 py-0.5 rounded bg-rose-600/30 border border-rose-500/40 text-rose-300 text-[10px] font-bold w-fit">
                      {movie.originalLanguage || movie.language?.[0] || 'Blockbuster'}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white line-clamp-1 drop-shadow-md">
                      {movie.title}
                    </h3>
                    
                    {movie.awards && (
                      <p className="text-[10px] text-amber-300 font-medium flex items-center gap-1 line-clamp-1">
                        <Award className="w-3 h-3 text-amber-400 flex-shrink-0" />
                        <span>{movie.awards}</span>
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <Link to={`/movies/${movie._id}`} className="flex-1">
                        <Button size="sm" className="w-full font-black bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-md text-xs h-8">
                          <Ticket className="w-3.5 h-3.5 mr-1" />
                          Book Now
                        </Button>
                      </Link>
                      {movie.trailerUrl && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onWatchTrailer?.(movie.trailerUrl, movie.title);
                          }}
                          className="w-8 h-8 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-white flex items-center justify-center border border-slate-600 shadow-md transition-colors"
                          title="Watch Trailer"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 3D Floor Reflection Simulation */}
              <div 
                style={{
                  backgroundImage: `url(${movie.poster})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center bottom',
                }}
                className="absolute -bottom-[85px] inset-x-0 h-[80px] rounded-b-2xl opacity-25 scale-y-[-1] blur-[2px] pointer-events-none [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.8)_0%,transparent_80%)]"
              />
            </div>
          );
        })}
      </div>

      {/* Navigation Controls with Generous Whitespace */}
      <div className="flex items-center justify-center gap-6 mt-8 sm:mt-10 z-40 relative">
        <button
          onClick={handlePrev}
          className="w-10 h-10 rounded-full bg-slate-900/90 hover:bg-rose-600/80 border border-slate-700 hover:border-rose-500 text-white flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
          aria-label="Previous movie"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Carousel Indicators */}
        <div className="flex items-center gap-2">
          {displayMovies.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? 'w-7 bg-gradient-to-r from-rose-500 to-amber-400'
                  : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-10 h-10 rounded-full bg-slate-900/90 hover:bg-rose-600/80 border border-slate-700 hover:border-rose-500 text-white flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
          aria-label="Next movie"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
