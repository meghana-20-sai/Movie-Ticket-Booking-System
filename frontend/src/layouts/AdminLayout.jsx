import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  Building2,
  Tv,
  Armchair,
  Calendar,
  Ticket,
  Users,
  Tag,
  MessageSquare,
  BarChart3,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Movies', path: '/admin/movies', icon: Film },
  { name: 'Theatres', path: '/admin/theatres', icon: Building2 },
  { name: 'Screens', path: '/admin/screens', icon: Tv },
  { name: 'Seat Config', path: '/admin/seats', icon: Armchair },
  { name: 'Shows', path: '/admin/shows', icon: Calendar },
  { name: 'Bookings', path: '/admin/bookings', icon: Ticket },
  { name: 'Users', path: '/admin/users', icon: Users },
  { name: 'Coupons', path: '/admin/coupons', icon: Tag },
  { name: 'Reviews', path: '/admin/reviews', icon: MessageSquare },
  { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-cinema-950 flex text-slate-100 selection:bg-brand-600 selection:text-white">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-cinema-900 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-slate-800/80">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-rose-400 flex items-center justify-center shadow-lg shadow-brand-600/30">
                <Film className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white flex items-center gap-1">
                  Smart<span className="text-brand-500">Cine</span>
                </span>
                <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider block -mt-1">
                  Admin Portal
                </span>
              </div>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)] scrollbar-thin">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/80 space-y-2 bg-cinema-900/90">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Customer View</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Admin Top Header */}
        <header className="sticky top-0 z-30 h-20 bg-cinema-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-cinema-900 border border-slate-800 text-slate-300"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-black text-white">
                Management Console
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Real-time MongoDB Atlas cinema operations & analytics
              </p>
            </div>
          </div>

          {/* Admin Profile Pill */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 bg-cinema-900 border border-slate-800 rounded-full py-1 px-3">
              <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-xs">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-white leading-tight">{user?.name || 'Administrator'}</p>
                <p className="text-[9px] text-brand-400 uppercase font-semibold">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Admin Page View */}
        <main className="p-4 sm:p-8 flex-grow">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
