import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Download,
  XCircle,
  Film,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { bookingService } from '../services/bookingService';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const MyBookings = () => {
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past'
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getMyBookings();
      if (res.success) {
        setUpcomingBookings(res.data.upcoming || []);
        setPastBookings(res.data.past || []);
      }
    } catch (error) {
      console.error('Failed to load my bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleConfirmCancel = async () => {
    if (!selectedBookingForCancel) return;
    setCancelling(true);
    setCancelMessage('');
    try {
      const res = await bookingService.cancelBooking(selectedBookingForCancel._id);
      if (res.success) {
        setCancelMessage(res.message);
        setSelectedBookingForCancel(null);
        await fetchBookings();
      }
    } catch (error) {
      alert(error.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving your cinema bookings..." />;
  }

  const currentList = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">My Bookings</h1>
          <p className="text-xs text-slate-400 mt-1">
            Access your admission passes, digital tickets, and past movie history
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center p-1 bg-cinema-900 border border-slate-800 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'upcoming'
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Upcoming ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'past'
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Past History ({pastBookings.length})
          </button>
        </div>
      </div>

      {cancelMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{cancelMessage}</span>
          </div>
          <button
            onClick={() => setCancelMessage('')}
            className="text-xs text-slate-400 hover:text-white underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Bookings List */}
      {currentList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentList.map((booking) => {
            const movie = booking.movieId || {};
            const theatre = booking.theatreId || {};
            const screen = booking.screenId || {};
            const show = booking.showId || {};
            const isCancelled = booking.bookingStatus === 'cancelled';

            return (
              <div
                key={booking._id}
                className="bg-cinema-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
              >
                {/* Header Info */}
                <div className="flex gap-4">
                  <div className="w-20 sm:w-24 aspect-[2/3] rounded-2xl overflow-hidden bg-slate-800 shrink-0 shadow-md">
                    <img
                      src={movie.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200'}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-grow space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-brand-400 uppercase tracking-wider">
                        {booking.bookingReference}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isCancelled
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {booking.bookingStatus}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-white leading-tight">{movie.title}</h3>

                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-brand-500 shrink-0" />
                      <span className="truncate">{theatre.name}, {theatre.city}</span>
                    </p>

                    <p className="text-[11px] text-slate-500">{screen.name} ({show.format || '2D'})</p>

                    <div className="pt-2 flex flex-wrap gap-2 text-xs text-slate-300">
                      <span className="flex items-center gap-1 font-semibold">
                        <Calendar className="w-3 h-3 text-brand-500" />
                        {show.date || 'Scheduled Date'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold">
                        <Clock className="w-3 h-3 text-brand-500" />
                        {show.startTime || '18:00'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Seats & Price Pill */}
                <div className="p-3 rounded-2xl bg-cinema-850/80 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Seats</span>
                    <span className="text-white font-bold">
                      {booking.seats?.map((s) => `${s.row}${s.number}`).join(', ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Paid</span>
                    <span className="text-brand-400 font-black text-sm">₹{booking.totalAmount}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80">
                  <Link
                    to={`/bookings/${booking._id}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/30 transition-all"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>View Ticket & QR</span>
                  </Link>

                  {booking.canCancel && !isCancelled && (
                    <button
                      onClick={() => setSelectedBookingForCancel(booking)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  )}

                  {activeTab === 'past' && (
                    <Link
                      to={`/movies/${movie._id}`}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-white font-semibold transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" /> Rebook
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Ticket}
          title={activeTab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings yet'}
          description="Explore our blockbuster lineup and book your movie experience in seconds."
          actionText="Discover Movies"
          actionLink="/movies"
        />
      )}

      {/* Cancellation Confirmation Modal */}
      {selectedBookingForCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-cinema-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-white">Cancel Booking?</h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to cancel your booking for{' '}
              <span className="text-white font-bold">
                {selectedBookingForCancel.movieId?.title}
              </span>{' '}
              ({selectedBookingForCancel.bookingReference})?
            </p>

            <div className="p-3 rounded-2xl bg-cinema-850 border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Original Amount:</span>
                <span className="text-white">₹{selectedBookingForCancel.totalAmount}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Convenience Fee (Non-refundable):</span>
                <span className="text-rose-400">-₹{selectedBookingForCancel.convenienceFee || 40}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-400 pt-1 border-t border-slate-800">
                <span>Refund Amount:</span>
                <span>₹{Math.max(0, selectedBookingForCancel.totalAmount - (selectedBookingForCancel.convenienceFee || 40))}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setSelectedBookingForCancel(null)}
                disabled={cancelling}
                className="w-1/2 py-2.5 px-4 rounded-xl bg-cinema-850 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold transition-all"
              >
                Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="w-1/2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all"
              >
                {cancelling ? 'Processing...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
