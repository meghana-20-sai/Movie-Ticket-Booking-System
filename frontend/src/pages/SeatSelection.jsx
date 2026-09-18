import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, ShieldCheck, Film, Info } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { useSocket } from '../context/SocketContext';
import SeatMap from '../components/SeatMap';
import BookingSummary from '../components/BookingSummary';
import PaymentModal from '../components/PaymentModal';
import LoadingSpinner from '../components/LoadingSpinner';

const SeatSelection = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { socket, joinShowRoom, leaveShowRoom } = useSocket();

  const {
    currentMovie,
    currentTheatre,
    currentShow,
    selectedSeats,
    toggleSeat,
    clearSeats,
    setLockExpiresAt,
    resetBooking,
    coupon,
    totalAmount,
  } = useBooking();

  const [showData, setShowData] = useState(null);
  const [rows, setRows] = useState([]);
  const [lockedSeatsMap, setLockedSeatsMap] = useState({});
  const [bookedSeatsSet, setBookedSeatsSet] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [isLocking, setIsLocking] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [lockError, setLockError] = useState('');

  // 1. Fetch initial show & seat layout
  useEffect(() => {
    const fetchLayout = async () => {
      try {
        setLoading(true);
        const res = await bookingService.getSeatsForShow(showId, user?._id);
        if (res.success) {
          setShowData(res.data.show);
          setRows(res.data.rows);

          // Extract booked seats
          const booked = new Set();
          res.data.rows.forEach((r) => {
            r.seats.forEach((s) => {
              if (s.status === 'occupied') booked.add(s.id || s.seatId);
            });
          });
          setBookedSeatsSet(booked);
        }
      } catch (error) {
        console.error('Failed to load show seats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLayout();
    clearSeats();
  }, [showId, user]);

  // 2. Real-Time Socket.IO event synchronization
  useEffect(() => {
    if (!socket || !showId) return;

    joinShowRoom(showId);

    const handleInitialLocks = ({ locks }) => {
      const lockMap = {};
      locks.forEach((l) => {
        lockMap[l.seatId] = l;
      });
      setLockedSeatsMap(lockMap);
    };

    const handleSeatLocked = ({ seats, lockedBy, expiresAt }) => {
      setLockedSeatsMap((prev) => {
        const updated = { ...prev };
        seats.forEach((seatId) => {
          updated[seatId] = { seatId, userId: lockedBy, expiresAt };
        });
        return updated;
      });
    };

    const handleSeatReleased = ({ seats }) => {
      setLockedSeatsMap((prev) => {
        const updated = { ...prev };
        seats.forEach((seatId) => {
          delete updated[seatId];
        });
        return updated;
      });
    };

    const handleSeatBooked = ({ seats }) => {
      setBookedSeatsSet((prev) => {
        const updated = new Set(prev);
        seats.forEach((seatId) => updated.add(seatId));
        return updated;
      });
      // Remove from locks
      setLockedSeatsMap((prev) => {
        const updated = { ...prev };
        seats.forEach((seatId) => delete updated[seatId]);
        return updated;
      });
    };

    socket.on('seat:initial_locks', handleInitialLocks);
    socket.on('seat:locked', handleSeatLocked);
    socket.on('seat:released', handleSeatReleased);
    socket.on('seat:booked', handleSeatBooked);

    return () => {
      leaveShowRoom(showId);
      socket.off('seat:initial_locks', handleInitialLocks);
      socket.off('seat:locked', handleSeatLocked);
      socket.off('seat:released', handleSeatReleased);
      socket.off('seat:booked', handleSeatBooked);
    };
  }, [socket, showId]);

  const handleSeatClick = (seat) => {
    setLockError('');
    toggleSeat(seat);
  };

  // Proceed to payment & lock seats on backend
  const handleProceedToPayment = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    if (selectedSeats.length === 0) {
      alert('Please select at least one seat to proceed.');
      return;
    }

    setIsLocking(true);
    setLockError('');

    try {
      const seatIds = selectedSeats.map((s) => s.id || s.seatId);
      const res = await bookingService.lockSeats(showId, seatIds, socket?.id);

      if (res.success) {
        setLockExpiresAt(res.data.expiresAt);
        setIsPaymentModalOpen(true);
      }
    } catch (error) {
      setLockError(error.message || 'Selected seats could not be locked. Please choose other seats.');
    } finally {
      setIsLocking(false);
    }
  };

  // Handle successful payment verification
  const handlePaymentSuccess = async (paymentDetails) => {
    try {
      const bookingPayload = {
        showId,
        selectedSeats: selectedSeats.map((s) => ({
          seatId: s.id || s.seatId,
          row: s.row,
          number: s.number,
          category: s.category,
          price: s.price,
        })),
        couponCode: coupon ? coupon.code : null,
        paymentDetails,
      };

      const res = await bookingService.createBooking(bookingPayload);

      if (res.success) {
        setIsPaymentModalOpen(false);
        navigate(`/booking-success/${res.data._id}`, { state: { booking: res.data } });
      }
    } catch (error) {
      alert(error.message || 'Booking confirmation failed. Please contact support.');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Rendering interactive cinema seat map..." />;
  }

  const movie = showData?.movie || currentMovie;
  const theatre = showData?.theatre || currentTheatre;
  const screen = showData?.screen;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Show Details Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-cinema-900 border border-slate-800 rounded-3xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-2xl bg-cinema-850 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-brand-600/30 border border-brand-500/40 text-brand-300 font-bold text-[10px]">
                {showData?.format || '2D'}
              </span>
              <h1 className="text-base sm:text-lg font-black text-white">{movie?.title}</h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {theatre?.name} • {screen?.name} • <span className="text-slate-200">{showData?.date}</span> at{' '}
              <span className="text-slate-200 font-bold">{showData?.startTime}</span>
            </p>
          </div>
        </div>

        {/* Categories Pricing Badge */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-cinema-850 border border-slate-800 text-slate-300">
            <span className="text-brand-400 font-bold">Premium:</span> ₹{Math.round((showData?.basePrice || 200) * 1.5)}
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-cinema-850 border border-slate-800 text-slate-300">
            <span className="text-amber-400 font-bold">Executive:</span> ₹{Math.round((showData?.basePrice || 200) * 1.25)}
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-cinema-850 border border-slate-800 text-slate-300">
            <span className="text-slate-200 font-bold">Regular:</span> ₹{showData?.basePrice || 200}
          </div>
        </div>
      </div>

      {lockError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0" />
          <span>{lockError}</span>
        </div>
      )}

      {/* Main Seat Map + Booking Summary Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Interactive Seat Map (Left 2 cols) */}
        <div className="lg:col-span-2">
          <SeatMap
            rows={rows}
            lockedSeatsMap={lockedSeatsMap}
            bookedSeatsSet={bookedSeatsSet}
            currentUserId={user?._id}
            onSeatClick={handleSeatClick}
          />
        </div>

        {/* Booking Summary Panel (Right 1 col) */}
        <div className="lg:col-span-1">
          <div className="sticky top-28">
            <BookingSummary
              movie={movie}
              theatre={theatre}
              show={showData}
              onProceedToPayment={handleProceedToPayment}
              isProcessing={isLocking}
            />
          </div>
        </div>
      </div>

      {/* Checkout / Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        show={showData}
        selectedSeats={selectedSeats}
        totalAmount={totalAmount}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default SeatSelection;
