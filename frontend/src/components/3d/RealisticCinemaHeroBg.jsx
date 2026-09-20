import React, { useState, useEffect, useRef } from 'react';
import { Film } from 'lucide-react';

/**
 * RealisticCinemaHeroBg.jsx
 * 
 * Ultra-realistic 3D Cinema Theater background component.
 * Uses the reference theater image provided by the user (from ChatGPT link),
 * layered with interactive 3D perspective mouse tilt, volumetric projector beam,
 * floating cinematic dust particles, and ambient auditorium lighting.
 */
export default function RealisticCinemaHeroBg({ movies = [] }) {
  const [bgChoice, setBgChoice] = useState('reference'); // 'reference' or 'render'
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [currentTrailerIdx, setCurrentTrailerIdx] = useState(0);
  const containerRef = useRef(null);
  const rafRef = useRef(null);
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });

  // Cycle current featured movie image for on-screen glow
  useEffect(() => {
    if (!movies || movies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentTrailerIdx((prev) => (prev + 1) % Math.min(movies.length, 6));
    }, 5000);
    return () => clearInterval(interval);
  }, [movies]);

  // Smooth mouse parallax animation with lerp
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      targetPos.current = { x: relX, y: relY };
    };

    const animate = () => {
      // Linear interpolation for silky smooth inertia
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * 0.08;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * 0.08;
      setMousePos({ x: currentPos.current.x, y: currentPos.current.y });
      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const imageSrc = bgChoice === 'reference' ? '/theater-bg.jpg' : '/theater-3d-bg.jpg';
  const activeMovie = movies[currentTrailerIdx] || null;

  // 3D parallax calculation: tilts camera slightly like sitting in the audience
  const rotateX = -mousePos.y * 7; // -3.5 to +3.5 deg
  const rotateY = mousePos.x * 10;  // -5 to +5 deg
  const translateX = mousePos.x * -24; // slight pan opposite
  const translateY = mousePos.y * -14;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none"
      style={{ perspective: '1200px' }}
    >
      {/* ── 3D Moving Layer: Realistic Cinema Background ── */}
      <div
        className="absolute inset-[-4%] w-[108%] h-[108%] transition-transform duration-100 ease-out will-change-transform"
        style={{
          transform: `scale(1.08) translate3d(${translateX}px, ${translateY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Main Cinema Theater Image */}
        <img
          src={imageSrc}
          alt="Premium 3D Cinema Theater Background"
          className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.1]"
          onError={() => {
            if (bgChoice === 'reference') setBgChoice('render');
          }}
        />

        {/* Dynamic Projector Screen Glow (simulates video playing on IMAX screen) */}
        <div
          className="absolute top-[26%] left-[24%] w-[52%] h-[30%] rounded-md pointer-events-none mix-blend-screen opacity-40 animate-pulse"
          style={{
            background: activeMovie?.poster
              ? `radial-gradient(ellipse at center, rgba(245, 197, 24, 0.45) 0%, rgba(225, 29, 72, 0.25) 50%, transparent 80%)`
              : `radial-gradient(ellipse at center, rgba(96, 165, 250, 0.5) 0%, rgba(225, 29, 72, 0.3) 60%, transparent 90%)`,
            filter: 'blur(32px)',
            transition: 'background 1.5s ease',
          }}
        />

        {/* Volumetric Projector Light Cone Beam from Top Center */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-[75%] pointer-events-none opacity-30 mix-blend-screen"
          style={{
            background: 'conic-gradient(from 165deg at 50% 0%, transparent 0deg, rgba(254, 243, 199, 0.22) 15deg, rgba(245, 197, 24, 0.28) 30deg, transparent 45deg)',
            filter: 'blur(16px)',
            transformOrigin: 'top center',
          }}
        />

        {/* Ambient Warm Golden Sconces & Red Velvet Seat Radiance */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[45%] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 100%, rgba(180, 20, 40, 0.25) 0%, transparent 70%)',
          }}
        />

        {/* Floating Atmospheric Dust Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60">
          <div className="cinema-dust-particle p1" />
          <div className="cinema-dust-particle p2" />
          <div className="cinema-dust-particle p3" />
          <div className="cinema-dust-particle p4" />
          <div className="cinema-dust-particle p5" />
          <div className="cinema-dust-particle p6" />
        </div>
      </div>

      {/* ── Overlays for Seamless Readability & Integration ── */}
      {/* 1. Subtle Center Darkening so hero text is super readable without hiding theater */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(7, 9, 19, 0.3) 0%, rgba(7, 9, 19, 0.6) 75%, rgba(4, 5, 12, 0.85) 100%)',
        }}
      />

      {/* 2. Top Bar Darkening to keep navigation crisp */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#070913]/90 via-[#070913]/50 to-transparent pointer-events-none" />

      {/* 3. Deep Bottom Fade to blend seamlessly with main content */}
      <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-[#070913] via-[#070913]/85 to-transparent pointer-events-none" />

      {/* 4. Left and Right Cinematic Curtains Shadowing */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#070913]/80 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#070913]/80 to-transparent pointer-events-none" />

      {/* ── Interactive View Switcher Badge ── */}
      <div className="absolute bottom-4 right-4 z-30 pointer-events-auto flex items-center gap-2 bg-[#070913]/85 backdrop-blur-md border border-slate-700/70 rounded-full px-3 py-1 shadow-xl">
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
          <Film className="w-3 h-3 text-rose-400" />
          <span>Theater View:</span>
        </span>
        <button
          onClick={() => setBgChoice('reference')}
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black transition-all ${
            bgChoice === 'reference'
              ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Use ChatGPT Reference Theater Image"
        >
          Reference
        </button>
        <button
          onClick={() => setBgChoice('render')}
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black transition-all ${
            bgChoice === 'render'
              ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          title="Use 3D Rendered Cinema Image"
        >
          3D Render
        </button>
      </div>
    </div>
  );
}
