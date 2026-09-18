import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import TicketCard from '../components/TicketCard';
import LoadingSpinner from '../components/LoadingSpinner';

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getBookingById(bookingId);
      if (res.success) {
        setBooking(res.data);
      }
    } catch (error) {
      console.error('Failed to load booking details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const res = await bookingService.cancelBooking(bookingId);
      if (res.success) {
        alert(res.message);
        await fetchBooking();
      }
    } catch (error) {
      alert(error.message || 'Failed to cancel booking');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving booking admission pass..." />;
  }

  if (!booking) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 text-sm">Booking details not found.</p>
        <button
          onClick={() => navigate('/my-bookings')}
          className="mt-4 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
        >
          Go to My Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 p-2 rounded-xl bg-cinema-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="font-mono text-xs text-brand-400 font-bold uppercase tracking-wider">
          Ref: {booking.bookingReference}
        </span>
      </div>

      <TicketCard
        booking={booking}
        onCancelBooking={handleCancelBooking}
        showActions={true}
      />
    </div>
  );
};

export default BookingDetails;
