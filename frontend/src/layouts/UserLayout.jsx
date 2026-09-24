import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const UserLayout = () => {
  return (
    <div className="min-h-screen flex flex-col relative bg-[#070913] text-slate-100 selection:bg-rose-600 selection:text-white overflow-x-hidden">
      {/* ── Creative & Attractive Ambient Cinema Lighting Layers ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top-Left Ruby Velvet Cinema Flare */}
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full bg-rose-600/15 blur-[120px] animate-aurora mix-blend-screen" />
        
        {/* Top-Right Royal Sapphire/Violet Aurora */}
        <div className="absolute top-10 -right-32 w-[600px] h-[600px] rounded-full bg-indigo-600/15 blur-[140px] animate-aurora [animation-delay:4s] mix-blend-screen" />
        
        {/* Center-Left Deep Violet Nebular Mist */}
        <div className="absolute top-1/3 -left-40 w-[550px] h-[550px] rounded-full bg-purple-700/10 blur-[130px] animate-aurora [animation-delay:8s] mix-blend-screen" />
        
        {/* Bottom-Right Golden Cinema Glow */}
        <div className="absolute bottom-20 right-10 w-[480px] h-[480px] rounded-full bg-amber-500/10 blur-[130px] animate-aurora [animation-delay:6s] mix-blend-screen" />

        {/* Subtle dynamic grid / star-speckle overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
      </div>

      <Navbar />
      <main className="flex-grow relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default UserLayout;
