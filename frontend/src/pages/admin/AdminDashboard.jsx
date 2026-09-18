import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Ticket,
  Users,
  Film,
  Building2,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { bookingService } from '../../services/bookingService';
import LoadingSpinner from '../../components/LoadingSpinner';

const COLORS = ['#e11d48', '#f59e0b', '#10b981', '#6366f1', '#8b5cf6'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [dashRes, analyticsRes] = await Promise.all([
          bookingService.getDashboardStats(),
          bookingService.getAnalytics({ days: 14 }),
        ]);

        if (dashRes.success) setStats(dashRes.data);
        if (analyticsRes.success) setAnalytics(analyticsRes.data);
      } catch (error) {
        console.error('Failed to load admin dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Aggregating MongoDB live analytics..." />;
  }

  const statCards = [
    {
      title: 'Total Gross Revenue',
      value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`,
      subtitle: `Today: ₹${stats?.todayRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'from-rose-500 to-brand-600',
    },
    {
      title: 'Confirmed Bookings',
      value: stats?.totalBookings || 0,
      subtitle: `Today: ${stats?.todayBookings || 0} bookings`,
      icon: Ticket,
      color: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Registered Users',
      value: stats?.totalUsers || 0,
      subtitle: 'Active Customers',
      icon: Users,
      color: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Active Multiplexes',
      value: stats?.activeTheatres || 0,
      subtitle: `${stats?.activeMovies || 0} Premiering Movies`,
      icon: Building2,
      color: 'from-sky-500 to-blue-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-cinema-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">{card.title}</span>
                  <div
                    className={`w-9 h-9 rounded-2xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-md`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-3 tracking-tight">
                  {card.value}
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 font-medium">{card.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue & Booking Trends Over Time */}
        <div className="lg:col-span-2 bg-cinema-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Revenue & Booking Trends</h3>
              <p className="text-xs text-slate-400">Daily sales performance over the past 14 days</p>
            </div>
            <span className="text-xs font-bold text-brand-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Real-time Sync
            </span>
          </div>

          <div className="h-72 w-full">
            {analytics?.revenueOverTime?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.revenueOverTime}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e11d48" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" textAnchor="end" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0d1117',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue (₹)"
                    stroke="#e11d48"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-500">
                No recent booking transactions to display.
              </div>
            )}
          </div>
        </div>

        {/* Seat Occupancy Meter */}
        <div className="lg:col-span-1 bg-cinema-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Auditorium Occupancy</h3>
            <p className="text-xs text-slate-400">Total capacity utilization across all scheduled shows</p>
          </div>

          <div className="flex flex-col items-center justify-center my-4">
            <div className="relative w-40 h-40 rounded-full border-8 border-slate-800 flex flex-col items-center justify-center shadow-2xl">
              <span className="text-3xl font-black text-brand-400">
                {analytics?.occupancy?.overallOccupancy || 0}%
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                Seat Utilization
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-cinema-850 border border-slate-800 text-xs space-y-2">
            <div className="flex justify-between text-slate-400">
              <span>Total Seats Capacity:</span>
              <span className="text-white font-bold">{analytics?.occupancy?.totalCapacity || 0}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Booked Seats:</span>
              <span className="text-brand-400 font-bold">{analytics?.occupancy?.totalBookedSeats || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Movies & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Movies Bar Chart */}
        <div className="bg-cinema-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Top Box Office Titles</h3>
              <p className="text-xs text-slate-400">Ranked by ticket sales and gross revenue</p>
            </div>
            <Link to="/admin/movies" className="text-xs font-bold text-brand-400 hover:underline">
              Manage Movies
            </Link>
          </div>

          <div className="h-64 w-full">
            {analytics?.topMovies?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topMovies} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis
                    dataKey="title"
                    type="category"
                    stroke="#64748b"
                    width={110}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0d1117',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="revenue" name="Revenue (₹)" fill="#e11d48" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-500">
                No movie revenue data yet.
              </div>
            )}
          </div>
        </div>

        {/* Recent Confirmed Bookings Table */}
        <div className="bg-cinema-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">Recent Admission Orders</h3>
              <p className="text-xs text-slate-400">Latest transactions processed</p>
            </div>
            <Link to="/admin/bookings" className="text-xs font-bold text-brand-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-72 pr-1">
            {stats?.recentBookings?.map((b) => (
              <div
                key={b._id}
                className="p-3.5 rounded-2xl bg-cinema-850 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-white truncate max-w-[180px]">
                    {b.movieId?.title || 'Movie'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {b.userId?.name || 'Customer'} • <span className="font-mono text-brand-400">{b.bookingReference}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">₹{b.totalAmount}</p>
                  <span className="text-[10px] text-emerald-400 uppercase font-semibold">
                    {b.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
