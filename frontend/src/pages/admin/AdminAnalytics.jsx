import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Calendar, DollarSign, Ticket, Film, Building2 } from 'lucide-react';
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
  Legend,
} from 'recharts';
import { bookingService } from '../../services/bookingService';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [days, setDays] = useState('14');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await bookingService.getAnalytics({ days });
        if (res.success) setAnalytics(res.data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [days]);

  if (loading) {
    return <LoadingSpinner text="Computing MongoDB aggregation analytics..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white">Advanced Business Analytics & Reports</h2>
          <p className="text-xs text-slate-400">Aggregated revenue, admissions velocity, and theatre occupancy</p>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <select
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="bg-cinema-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none font-semibold"
          >
            <option value="7">Last 7 Days</option>
            <option value="14">Last 14 Days</option>
            <option value="30">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Revenue Over Time Area Chart */}
      <div className="bg-cinema-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Daily Gross Revenue (₹)</h3>
            <p className="text-xs text-slate-400">Gross ticket admissions across all multiplexes</p>
          </div>
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Direct Database Pipeline
          </span>
        </div>

        <div className="h-80 w-full">
          {analytics?.revenueOverTime?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.revenueOverTime}>
                <defs>
                  <linearGradient id="analyticsRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
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
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#analyticsRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-slate-500">
              No revenue transactions during this interval.
            </div>
          )}
        </div>
      </div>

      {/* Grid: Tickets Sold & Multiplex Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tickets Sold Over Time */}
        <div className="bg-cinema-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Tickets Volume Over Time</h3>
            <p className="text-xs text-slate-400">Total individual seat reservations confirmed</p>
          </div>

          <div className="h-64 w-full">
            {analytics?.revenueOverTime?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.revenueOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0d1117',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="ticketsSold" name="Tickets Sold" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-500">
                No tickets data available.
              </div>
            )}
          </div>
        </div>

        {/* Multiplex Theatre Performance */}
        <div className="bg-cinema-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Multiplex Revenue Share</h3>
            <p className="text-xs text-slate-400">Comparative revenue generated by theatre location</p>
          </div>

          <div className="h-64 w-full">
            {analytics?.theatrePerformance?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.theatrePerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" stroke="#64748b" width={110} tick={{ fontSize: 9 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0d1117',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="revenue" name="Revenue (₹)" fill="#10b981" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-slate-500">
                No theatre performance records found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
