import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Film,
  MapPin,
  Search,
  User as UserIcon,
  LogOut,
  Ticket,
  LayoutDashboard,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CitySelectorModal from './CitySelectorModal';
import CommandCenterModal from './command/CommandCenterModal';
import { Button } from './ui/button';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, city, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Global Ctrl + K / Cmd + K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Movies', path: '/movies' },
    { name: 'Theatres', path: '/theatres' },
    { name: 'Offers', path: '/offers' },
    ...(isAuthenticated ? [{ name: 'My Bookings', path: '/my-bookings' }] : []),
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-cinema-950/80 backdrop-blur-md border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left: Brand Logo & City Selector */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-rose-400 flex items-center justify-center shadow-lg shadow-brand-600/30 group-hover:scale-105 transition-transform">
                  <Film className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1">
                    Smart<span className="text-brand-500">Cine</span>
                  </span>
                  <span className="hidden sm:block text-[10px] text-slate-400 font-medium tracking-wider uppercase -mt-1">
                    Cinema Ticket Booking
                  </span>
                </div>
              </Link>

              {/* City Selector Button */}
              <button
                id="city-selector-btn"
                onClick={() => setIsCityModalOpen(true)}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cinema-850 hover:bg-cinema-700 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all shadow-sm"
              >
                <MapPin className="w-3.5 h-3.5 text-brand-500" />
                <span>{city}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
            </div>

            {/* Middle: Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-white bg-slate-800/60 font-semibold'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/30'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Ask SmartCine & Auth Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Ask SmartCine Command Button */}
              <button
                onClick={() => setIsCommandModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-600/15 hover:bg-brand-600/25 border border-brand-500/30 text-brand-300 hover:text-white text-xs font-bold transition-all shadow-sm group"
                title="Open SmartCine Command Center (Ctrl + K)"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-400 group-hover:animate-pulse" />
                <span className="hidden sm:inline">Ask SmartCine</span>
                <kbd className="hidden md:inline px-1 py-0.5 rounded bg-brand-950/80 border border-brand-500/40 text-[9px] font-mono text-brand-300">
                  ⌘K
                </kbd>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-cinema-850 hover:bg-cinema-700 border border-slate-800 text-slate-300 hover:text-white transition-all shadow-sm"
                title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-brand-400" />}
              </button>

              {/* Mobile City Button */}
              <button
                onClick={() => setIsCityModalOpen(true)}
                className="md:hidden p-2 rounded-lg bg-cinema-850 border border-slate-800 text-brand-500"
                title="Select City"
              >
                <MapPin className="w-4 h-4" />
              </button>

              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full bg-cinema-850 hover:bg-cinema-800 border border-slate-700/80 transition-all"
                  >
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-brand-500"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-brand-600/20 border border-brand-500/50 flex items-center justify-center text-brand-400 font-bold text-xs">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span className="hidden md:block text-xs font-medium text-slate-200 pr-1 max-w-[100px] truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-cinema-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2.5 border-b border-slate-800/80">
                        <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                        {isAdmin && (
                          <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30">
                            <Sparkles className="w-2.5 h-2.5" /> Administrator
                          </span>
                        )}
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-brand-400 hover:bg-brand-500/10 font-semibold"
                        >
                          <LayoutDashboard className="w-4 h-4" /> Admin Console
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" /> My Profile
                      </Link>

                      <Link
                        to="/my-bookings"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
                      >
                        <Ticket className="w-4 h-4 text-slate-400" /> My Tickets & History
                      </Link>

                      <div className="border-t border-slate-800 my-1"></div>

                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 font-medium"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-1.5 rounded-full text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-600/30 transition-all hover:scale-105"
                  >
                    Join Free
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg bg-cinema-850 border border-slate-800 text-slate-300 hover:text-white"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800/80 bg-cinema-950 px-4 pt-3 pb-6 space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-cinema-900 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            </form>

            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Global Modals */}
      <CitySelectorModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
      />

      <CommandCenterModal
        isOpen={isCommandModalOpen}
        onClose={() => setIsCommandModalOpen(false)}
      />
    </>
  );
};

export default Navbar;
