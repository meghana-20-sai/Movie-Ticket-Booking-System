import React from 'react';
import { Lock, Clock, AlertCircle } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

const SeatMap = ({
  rows = [],
  lockedSeatsMap = {}, // { 'A-1': { userId, expiresAt } }
  bookedSeatsSet = new Set(), // Set of seatIds permanently booked
  currentUserId,
  onSeatClick,
}) => {
  const { selectedSeats, remainingLockSeconds } = useBooking();

  const isSeatSelectedByMe = (seatId) => {
    return selectedSeats.some((s) => (s.id || s.seatId) === seatId);
  };

  const getSeatStatus = (seat) => {
    const seatId = seat.id || seat.seatId || `${seat.row}-${seat.number}`;

    if (bookedSeatsSet.has(seatId)) {
      return 'occupied';
    }

    const lock = lockedSeatsMap[seatId];
    if (lock) {
      if (currentUserId && lock.userId === currentUserId) {
        return 'selected';
      }
      return 'locked';
    }

    if (isSeatSelectedByMe(seatId)) {
      return 'selected';
    }

    return 'available';
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-cinema-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl flex flex-col items-center">
      {/* Timer Bar if user has selected seats */}
      {selectedSeats.length > 0 && remainingLockSeconds > 0 && (
        <div className="w-full mb-6 bg-brand-950/80 border border-brand-500/40 rounded-2xl px-4 py-2.5 flex items-center justify-between text-brand-300 animate-pulse">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Clock className="w-4 h-4 text-brand-400" />
            <span>Seats held for you:</span>
          </div>
          <span className="font-mono text-sm font-black text-white bg-brand-600/50 px-3 py-0.5 rounded-lg border border-brand-400">
            {formatTimer(remainingLockSeconds)}
          </span>
        </div>
      )}

      {/* Cinema Screen Header */}
      <div className="w-full max-w-xl flex flex-col items-center mb-10">
        <div className="w-full h-3 bg-gradient-to-r from-transparent via-brand-500/80 to-transparent rounded-t-full shadow-[0_-8px_25px_rgba(225,29,72,0.6)]"></div>
        <div className="w-4/5 h-12 bg-gradient-to-b from-brand-500/10 to-transparent border-t border-brand-500/30 -mt-0.5 flex items-center justify-center">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
            SCREEN THIS WAY
          </span>
        </div>
      </div>

      {/* Seat Rows Map */}
      <div className="w-full overflow-x-auto pb-6 scrollbar-thin">
        <div className="min-w-[500px] flex flex-col gap-3.5 items-center">
          {rows.map((row) => (
            <div key={row.rowLabel} className="flex items-center gap-3">
              {/* Row Label (Left) */}
              <span className="w-6 text-center text-xs font-black text-slate-400">
                {row.rowLabel}
              </span>

              {/* Seats in Row */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {row.seats.map((seat) => {
                  const status = getSeatStatus(seat);
                  const isAvailable = status === 'available';
                  const isSelected = status === 'selected';
                  const isOccupied = status === 'occupied';
                  const isLocked = status === 'locked';

                  let seatStyle = 'bg-cinema-850 border-slate-700/80 text-slate-300 hover:border-brand-500 hover:scale-110';

                  if (isSelected) {
                    seatStyle =
                      'bg-brand-600 border-brand-400 text-white font-bold shadow-lg shadow-brand-600/50 scale-105 ring-2 ring-brand-400/60';
                  } else if (isOccupied) {
                    seatStyle = 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed opacity-40';
                  } else if (isLocked) {
                    seatStyle =
                      'bg-amber-950/80 border-amber-600/60 text-amber-400 cursor-not-allowed animate-pulse shadow-sm';
                  }

                  return (
                    <button
                      key={seat.id || seat.seatId || `${seat.row}-${seat.number}`}
                      onClick={() => onSeatClick(seat)}
                      disabled={isOccupied || isLocked}
                      aria-label={`Row ${seat.row} Seat ${seat.number} ${seat.category} ₹${seat.price}`}
                      title={`${seat.category} - Row ${seat.row}, Seat ${seat.number} (₹${seat.price})${
                        isLocked ? ' [Temporarily Locked]' : isOccupied ? ' [Booked]' : ''
                      }`}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border text-[11px] font-semibold flex items-center justify-center transition-all ${seatStyle}`}
                    >
                      {isLocked ? (
                        <Lock className="w-3 h-3 text-amber-400" />
                      ) : (
                        seat.number
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Row Label (Right) */}
              <span className="w-6 text-center text-xs font-black text-slate-400">
                {row.rowLabel}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend & Categories */}
      <div className="w-full mt-6 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-cinema-850 border border-slate-700"></div>
          <span>Available</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-brand-600 border border-brand-400 shadow-sm"></div>
          <span className="text-white font-medium">Selected</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-amber-950 border border-amber-600 flex items-center justify-center">
            <Lock className="w-2.5 h-2.5 text-amber-400" />
          </div>
          <span>Locked</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-slate-900 border border-slate-800 opacity-40"></div>
          <span>Occupied</span>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
