import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Film,
  Calendar,
  Clock,
  Star,
  Armchair,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Tag,
  DollarSign,
  Ticket,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  ShoppingBag,
  Building2,
  Users,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useSocket } from '../../context/SocketContext';

export default function CommandResultCard({ data, rawInput, onExecuteCommand }) {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [liveLockedSeats, setLiveLockedSeats] = useState({});

  // Real-time Socket.IO synchronization for seat locks
  useEffect(() => {
    if (!socket || !data?.show?._id) return;

    const showId = data.show._id;
    socket.emit('join:show', { showId });

    const handleSeatLocked = (payload) => {
      if (payload.showId === showId) {
        setLiveLockedSeats((prev) => ({
          ...prev,
          ...payload.seats.reduce((acc, s) => ({ ...acc, [s]: true }), {}),
        }));
      }
    };

    const handleSeatUnlocked = (payload) => {
      if (payload.showId === showId) {
        setLiveLockedSeats((prev) => {
          const next = { ...prev };
          payload.seats.forEach((s) => delete next[s]);
          return next;
        });
      }
    };

    socket.on('seat:locked', handleSeatLocked);
    socket.on('seat:unlocked', handleSeatUnlocked);

    return () => {
      socket.off('seat:locked', handleSeatLocked);
      socket.off('seat:unlocked', handleSeatUnlocked);
      socket.emit('leave:show', { showId });
    };
  }, [socket, data?.show?._id]);

  if (!data) return null;

  // 1. SMARTCINE PLAN (Chained Booking Workflow)
  if (data.type === 'SMARTCINE_PLAN') {
    const { plan, action, disclaimer } = data;
    return (
      <Card className="border-brand-500/50 bg-gradient-to-b from-cinema-900 to-cinema-950 overflow-hidden shadow-2xl">
        <div className="bg-brand-600/20 px-6 py-3 border-b border-brand-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span className="text-xs font-black uppercase tracking-wider text-brand-300">
              SmartCine Intelligent Plan
            </span>
          </div>
          <Badge variant="success">Optimized</Badge>
        </div>

        <CardContent className="p-6 space-y-4">
          {/* Movie & Showtime */}
          <div className="flex items-start gap-4">
            <img
              src={plan.movie.poster}
              alt={plan.movie.title}
              className="w-16 h-24 object-cover rounded-xl border border-slate-700 shadow-md"
            />
            <div className="space-y-1">
              <h4 className="text-base font-black text-white">{plan.movie.title}</h4>
              <p className="text-xs text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-brand-400" />
                {plan.show.theatreName} • {plan.show.screenName} ({plan.show.format})
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {new Date(plan.show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                {new Date(plan.show.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Seats Recommended */}
          <div className="p-3 rounded-xl bg-cinema-850 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5 font-bold">
                <Armchair className="w-3.5 h-3.5 text-brand-400" />
                Reserved Seats ({plan.seats.length})
              </span>
              <span className="font-extrabold text-white">
                {plan.seats.map((s) => s.seatNumber).join(', ')}
              </span>
            </div>
          </div>

          {/* Concessions / Food */}
          {plan.food?.length > 0 && (
            <div className="p-3 rounded-xl bg-cinema-850 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-bold">
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                  Food & Concessions
                </span>
                <span className="font-semibold text-slate-200">
                  {plan.food.map((f) => `${f.quantity}x ${f.name}`).join(' + ')}
                </span>
              </div>
            </div>
          )}

          {/* Pricing Table */}
          <div className="p-4 rounded-xl bg-cinema-950/80 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Tickets Subtotal</span>
              <span className="text-slate-200 font-semibold">₹{plan.pricing.ticketTotal}</span>
            </div>
            {plan.pricing.foodTotal > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Food & Beverages</span>
                <span className="text-slate-200 font-semibold">₹{plan.pricing.foodTotal}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>Convenience Fees</span>
              <span className="text-slate-200 font-semibold">₹{plan.pricing.convenienceFee}</span>
            </div>
            {plan.pricing.discount > 0 && (
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>SmartCine Promo Discount</span>
                <span>-₹{plan.pricing.discount}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-black">
              <span className="text-white">Total Amount</span>
              <span className="text-brand-400 text-base">₹{plan.pricing.finalTotal}</span>
            </div>
          </div>

          {/* Security Disclaimer */}
          <p className="text-[11px] text-slate-400 italic text-center">{disclaimer}</p>
        </CardContent>

        <CardFooter className="p-6 pt-0">
          <Button
            size="lg"
            variant="gradient"
            className="w-full gap-2 font-black"
            onClick={() => navigate(`/seat-selection/${plan.show.id}`)}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Confirm & Continue to Seats</span>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // 2. MOVIES LIST & RECOMMENDATIONS
  if (data.type === 'MOVIES_LIST' || data.type === 'RECOMMENDATIONS') {
    return (
      <div className="space-y-3">
        <p className="text-xs font-bold text-slate-300">{data.message}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.movies?.map((movie) => (
            <Link
              key={movie._id}
              to={`/movies/${movie._id}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-cinema-850 hover:bg-cinema-800 border border-slate-800 hover:border-brand-500/40 transition-all group shadow-md"
            >
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-12 h-16 object-cover rounded-lg shrink-0 border border-slate-700"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-black text-white group-hover:text-brand-400 truncate">
                  {movie.title}
                </h4>
                <p className="text-[11px] text-slate-400 truncate">
                  {(Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre || '')} • {(Array.isArray(movie.language) ? movie.language.join(', ') : movie.language || '')}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {movie.rating > 0 && (
                    <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {movie.rating.toFixed(1)}
                    </span>
                  )}
                  <span className="text-[10px] text-brand-400 font-semibold group-hover:underline">
                    View Shows →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // 3. SHOWTIMES LIST
  if (data.type === 'SHOWTIMES_LIST') {
    return (
      <div className="space-y-3">
        <p className="text-xs font-bold text-slate-300">{data.message}</p>
        <div className="space-y-2.5">
          {data.shows?.map((show) => (
            <div
              key={show._id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-cinema-850 border border-slate-800 hover:border-slate-700 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-white">{show.movie?.title}</h4>
                  <Badge variant="secondary" className="text-[10px]">
                    {show.format}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400">
                  {show.theatre?.name} • {show.screen?.name}
                </p>
                <p className="text-[10px] text-brand-400 font-bold">
                  {new Date(show.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Starts at ₹{show.basePrice}
                </p>
              </div>

              <Button
                size="sm"
                onClick={() => navigate(`/seat-selection/${show._id}`)}
                className="gap-1 shadow-md shadow-brand-600/30"
              >
                <span>Select Seats</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 4. SEAT RECOMMENDATIONS & GROUP BOOKING
  if (data.type === 'SEAT_RECOMMENDATION' || data.type === 'GROUP_BOOKING_RESULT') {
    const seats = data.recommendedSeats || data.seats || [];
    return (
      <Card className="bg-cinema-900 border-slate-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Armchair className="w-4 h-4 text-brand-500" />
              {data.type === 'GROUP_BOOKING_RESULT' ? 'Group Seating Plan' : 'Recommended Optimal Seats'}
            </CardTitle>
            {data.matchScore && (
              <Badge variant="warning">Match: {data.matchScore}%</Badge>
            )}
          </div>
          <p className="text-xs text-slate-400">{data.message}</p>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Seats Display Chips */}
          <div className="flex flex-wrap gap-2">
            {seats.map((s) => {
              const isLockedNow = liveLockedSeats[s._id || s.seatNumber];
              return (
                <div
                  key={s._id || s.seatNumber}
                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-bold ${
                    isLockedNow
                      ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                      : 'bg-brand-950/70 border-brand-500/40 text-brand-200'
                  }`}
                >
                  <Armchair className="w-3.5 h-3.5" />
                  <span>{s.seatNumber}</span>
                  <span className="text-[10px] opacity-75 font-normal">({s.tier || 'Seat'})</span>
                  {isLockedNow && (
                    <span className="text-[9px] bg-amber-500 text-black px-1 rounded font-extrabold">
                      Locked
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Highlights */}
          {data.highlights?.length > 0 && (
            <div className="p-3 rounded-xl bg-cinema-850 border border-slate-800/80 space-y-1">
              {data.highlights.map((h, i) => (
                <p key={i} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{h}</span>
                </p>
              ))}
            </div>
          )}

          {data.totalPrice && (
            <div className="flex justify-between items-center text-xs font-bold pt-1">
              <span className="text-slate-400">Total Ticket Price:</span>
              <span className="text-brand-400 text-sm font-black">₹{data.totalPrice}</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-0">
          <Button
            size="sm"
            className="w-full gap-1.5"
            onClick={() => data.show?._id && navigate(`/seat-selection/${data.show._id}`)}
          >
            <Ticket className="w-4 h-4" />
            <span>Open Seat Map & Book</span>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // 5. BUDGET BREAKDOWN
  if (data.type === 'BUDGET_BREAKDOWN') {
    const { breakdown, budget, cheaperOptions, show } = data;
    return (
      <Card className="bg-cinema-900 border-slate-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Smart Budget Calculator
          </CardTitle>
          <p className="text-xs text-slate-300 font-semibold">{data.message}</p>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="p-3.5 rounded-xl bg-cinema-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>{breakdown.ticketsCount}x Tickets (@ ₹{breakdown.ticketPricePerSeat})</span>
              <span className="text-slate-200 font-bold">₹{breakdown.ticketsSubtotal}</span>
            </div>
            {breakdown.foodSubtotal > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Food & Concessions</span>
                <span className="text-slate-200 font-bold">₹{breakdown.foodSubtotal}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>Convenience Fee (8%)</span>
              <span className="text-slate-200 font-bold">₹{breakdown.convenienceFee}</span>
            </div>
            {breakdown.discount > 0 && (
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Promo Discount ({breakdown.couponCode})</span>
                <span>-₹{breakdown.discount}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-black">
              <span className="text-white">Estimated Cost</span>
              <span className="text-brand-400">₹{breakdown.finalTotal}</span>
            </div>
          </div>

          {cheaperOptions?.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 space-y-1">
              <p className="text-[11px] font-bold text-amber-300">💡 Smart Alternatives to Save:</p>
              {cheaperOptions.map((opt, i) => (
                <p key={i} className="text-[10px] text-amber-200/90">
                  • {opt}
                </p>
              ))}
            </div>
          )}
        </CardContent>

        {show && (
          <CardFooter className="pt-0">
            <Button
              size="sm"
              className="w-full"
              onClick={() => navigate(`/seat-selection/${show._id}`)}
            >
              Book for {show.movie?.title} (₹{breakdown.finalTotal})
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  }

  // 6. ADMIN ANALYTICS REPORT
  if (data.type === 'ADMIN_ANALYTICS_REPORT') {
    const { metrics, topGrossing } = data;
    return (
      <Card className="bg-cinema-900 border-brand-500/40 shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-400" />
            Admin Intelligence Executive Summary
          </CardTitle>
          <p className="text-xs text-slate-400">{data.message}</p>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-cinema-850 border border-slate-800">
              <p className="text-[10px] text-slate-400 font-semibold">Today's Revenue</p>
              <p className="text-sm font-black text-emerald-400">{metrics.todayRevenue}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-cinema-850 border border-slate-800">
              <p className="text-[10px] text-slate-400 font-semibold">Today's Tickets</p>
              <p className="text-sm font-black text-white">{metrics.todayTickets}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-cinema-850 border border-slate-800">
              <p className="text-[10px] text-slate-400 font-semibold">Total Revenue</p>
              <p className="text-sm font-black text-brand-400">{metrics.totalRevenue}</p>
            </div>
          </div>

          {topGrossing?.length > 0 && (
            <div className="p-3 rounded-xl bg-cinema-850 border border-slate-800 space-y-1.5">
              <p className="text-[11px] font-bold text-slate-300">Top Box-Office Earners:</p>
              {topGrossing.map((m, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium truncate">{m.title}</span>
                  <span className="text-emerald-400 font-bold">{m.revenue}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-0">
          <Button size="sm" variant="secondary" className="w-full" onClick={() => navigate('/admin')}>
            Open Full Admin Portal →
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // 7. USER BOOKINGS
  if (data.type === 'USER_BOOKINGS') {
    return (
      <div className="space-y-3">
        <p className="text-xs font-bold text-slate-300">{data.message}</p>
        <div className="space-y-2">
          {data.bookings?.map((b) => (
            <div
              key={b._id}
              className="p-3 rounded-xl bg-cinema-850 border border-slate-800 flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-black text-white">{b.show?.movie?.title}</p>
                <p className="text-[10px] text-slate-400">
                  Ref: <span className="font-mono text-brand-400">{b.bookingReference}</span> • {b.seats?.length} Seat(s)
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate(`/bookings/${b._id}`)}>
                View Pass
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 8. HELP & GENERIC FALLBACK
  return (
    <Card className="bg-cinema-900 border-slate-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-bold text-slate-200">{data.message}</CardTitle>
      </CardHeader>
      {data.suggestions?.length > 0 && (
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-1.5">
            {data.suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => onExecuteCommand?.(s)}
                className="px-2.5 py-1 rounded-lg bg-cinema-850 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white border border-slate-800 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
