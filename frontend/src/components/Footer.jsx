import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Heart, ShieldCheck, Zap, Sparkles, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-cinema-950 border-t border-slate-900 pt-16 pb-12 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-900">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-rose-400 flex items-center justify-center shadow-lg shadow-brand-600/30">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Smart<span className="text-brand-500">Cine</span>
              </span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed">
              "Your movie. Your seat. Your experience."
              Commercial-grade movie ticketing with real-time seat locking and instant digital ticketing.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                <ShieldCheck className="w-3 h-3" /> 256-Bit SSL Secure
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 text-[10px] font-semibold">
                <Zap className="w-3 h-3" /> Real-Time Sync
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/movies?status=now-showing" className="hover:text-white transition-colors">
                  Now Showing Movies
                </Link>
              </li>
              <li>
                <Link to="/movies?status=coming-soon" className="hover:text-white transition-colors">
                  Upcoming Releases
                </Link>
              </li>
              <li>
                <Link to="/theatres" className="hover:text-white transition-colors">
                  Cinemas & Theatres
                </Link>
              </li>
              <li>
                <Link to="/offers" className="hover:text-white transition-colors">
                  Exclusive Offers & Promo Codes
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Cities */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Top Cities</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-brand-500" /> Hyderabad (Inorbit, AMB, Prasads)
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-brand-500" /> Bengaluru (Director's Cut, Forum)
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-brand-500" /> Mumbai (Maison INOX, PVR ICON)
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-brand-500" /> Vijayawada & Visakhapatnam
              </li>
            </ul>
          </div>

          {/* Technology & Security */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Smart Architecture</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Powered by Node.js, Express, MongoDB Atlas, Socket.IO WebSockets, and React 18 for zero-latency concurrent seat selection.
            </p>
            <div className="pt-1">
              <p className="text-[11px] text-slate-500">
                Demo Admin: <code className="text-slate-300">admin@smartcine.com</code>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>© {new Date().getFullYear()} SmartCine Cinemas Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-brand-500 fill-brand-500" /> for supreme cinema experiences.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
