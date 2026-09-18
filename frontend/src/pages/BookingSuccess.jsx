import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, Home, Ticket, Sparkles } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import TicketCard from '../components/TicketCard';
import LoadingSpinner from '../components/LoadingSpinner';

const BookingSuccess = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);

  useEffect(() => {
    // Fire festive cinema confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#fb7185', '#f59e0b', '#38bdf8'],
      });
    } catch (e) {
      // ignore
    }

    if (!booking) {
      const fetchBooking = async () => {
        try {
          const res = await bookingService.getBookingById(bookingId);
          if (res.success) {
            setBooking(res.data);
          }
        } catch (error) {
          console.error('Failed to fetch booking confirmation:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    }
  }, [bookingId, booking]);

  if (loading) {
    return <LoadingSpinner text="Generating digital admission ticket..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-center">
      {/* Celebration Header */}
      <div className="space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl animate-bounce">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Booking Confirmed 🎉
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
          Your movie tickets have been secured successfully. Please present the QR code at the cinema entry turnstiles.
        </p>
      </div>

      {/* Ticket Card Component */}
      <div className="pt-2 text-left">
        <TicketCard booking={booking} showActions={true} />
      </div>

      {/* Footer Navigation Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
        <Link
          to="/my-bookings"
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-cinema-850 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white text-xs font-bold transition-all shadow-md"
        >
          <Ticket className="w-4 h-4 text-brand-400" />
          <span>View All Bookings</span>
        </Link>

        <Link
          to="/"
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
};

export default BookingSuccess;
