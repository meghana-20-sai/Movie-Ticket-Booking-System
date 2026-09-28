import React, { useState } from 'react';
import { Ticket, Tag, Check, X, ShieldCheck, ArrowRight, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { bookingService } from '../services/bookingService';
import { DEFAULT_OFFERS } from '../data/defaultOffers';

const BookingSummary = ({ movie, theatre, show, onProceedToPayment, isProcessing }) => {
  const {
    selectedSeats,
    selectedSnacks = [],
    snackTotal = 0,
    coupon,
    setCoupon,
    subtotal,
    convenienceFee,
    tax,
    discount,
    totalAmount,
  } = useBooking();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponSuccess, setCouponSuccess] = useState('');
  const [showOffersList, setShowOffersList] = useState(false);

  const applyCode = async (codeToApply) => {
    if (!codeToApply) return;
    setCouponError('');
    setCouponSuccess('');
    setCouponLoading(true);

    try {
      const res = await bookingService.validateCoupon(codeToApply, subtotal);
      if (res.success) {
        setCoupon(res.data);
        setCouponSuccess(res.message);
        setCouponCodeInput('');
        setShowOffersList(false);
      }
    } catch (error) {
      setCouponError(error.message || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    await applyCode(couponCodeInput.trim());
  };

  const handleRemoveCoupon = () => {
    setCoupon(null);
    setCouponSuccess('');
    setCouponError('');
  };

  return (
    <div className="w-full bg-cinema-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
      {/* Header Info */}
      <div>
        <span className="text-[10px] font-bold tracking-widest text-brand-400 uppercase">
          Booking Summary
        </span>
        <h3 className="text-lg font-black text-white mt-0.5 truncate">{movie?.title}</h3>
        <p className="text-xs text-slate-400 truncate">
          {theatre?.name} • {show?.screenName || 'Screen 1'} ({show?.format || '2D'})
        </p>
        <p className="text-xs text-slate-400 mt-1">
          <span className="text-slate-200 font-semibold">{show?.date}</span> at{' '}
          <span className="text-slate-200 font-semibold">{show?.startTime}</span> ({show?.language})
        </p>
      </div>

      {/* Selected Seats Chips */}
      <div className="pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-400">Selected Seats:</span>
          <span className="font-bold text-white">
            {selectedSeats.length} {selectedSeats.length === 1 ? 'Ticket' : 'Tickets'}
          </span>
        </div>

        {selectedSeats.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {selectedSeats.map((s) => (
              <span
                key={s.id || s.seatId}
                className="px-2.5 py-1 rounded-lg bg-brand-600/20 border border-brand-500/40 text-brand-300 text-xs font-bold"
              >
                {s.row}{s.number} ({s.category})
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No seats selected yet.</p>
        )}
      </div>

      {/* Coupon Application */}
      <div className="pt-3 border-t border-slate-800/80">
        {coupon ? (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <div>
                <p className="text-xs font-bold uppercase">{coupon.code} Applied</p>
                <p className="text-[10px] text-emerald-500/90">Saved ₹{coupon.discount}</p>
              </div>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="p-1 rounded-lg hover:bg-emerald-500/20 text-emerald-300 transition-colors"
              title="Remove coupon"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Enter promo code (e.g. SMARTCINE10)"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                  disabled={selectedSeats.length === 0}
                  className="w-full bg-cinema-850 border border-slate-800 focus:border-brand-500 rounded-xl py-2 px-3 pl-8 text-xs text-white placeholder-slate-500 outline-none uppercase font-mono disabled:opacity-50"
                />
                <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              </div>
              <button
                type="submit"
                disabled={!couponCodeInput.trim() || couponLoading || selectedSeats.length === 0}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-bold transition-all shrink-0"
              >
                {couponLoading ? '...' : 'Apply'}
              </button>
            </div>

            {couponError && <p className="text-[11px] text-rose-400">{couponError}</p>}
            {couponSuccess && <p className="text-[11px] text-emerald-400">{couponSuccess}</p>}

            {/* Quick 1-Click Offers Drawer Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowOffersList(!showOffersList)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-cinema-850 hover:bg-slate-800 border border-slate-800 text-[11px] text-brand-300 font-semibold transition-all"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                  <span>View Available Cinema Offers ({DEFAULT_OFFERS.length})</span>
                </div>
                {showOffersList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {/* Available Offers Cards */}
              {showOffersList && (
                <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {DEFAULT_OFFERS.map((off) => (
                    <div
                      key={off.code}
                      className="p-2.5 rounded-xl bg-cinema-850 border border-slate-800/90 flex items-center justify-between gap-2 hover:border-brand-500/40 transition-all text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-white tracking-wider text-[11px] bg-slate-800 px-1.5 py-0.5 rounded">
                            {off.code}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-bold">
                            {off.discountType === 'percentage' ? `${off.discountValue}% OFF` : `₹${off.discountValue} OFF`}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{off.description}</p>
                      </div>
                      <button
                        type="button"
                        disabled={couponLoading || selectedSeats.length === 0}
                        onClick={() => applyCode(off.code)}
                        className="px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-[11px] shrink-0 transition-all shadow-sm"
                      >
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Selected Food & Popcorn Items */}
      {selectedSnacks.length > 0 && (
        <div className="pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span>🍿</span>
              <span>Cinema Snacks:</span>
            </span>
            <span className="font-bold text-amber-400">
              ₹{snackTotal}
            </span>
          </div>

          <div className="space-y-1.5 max-h-28 overflow-y-auto">
            {selectedSnacks.map((snack) => (
              <div
                key={snack.id}
                className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span>{snack.icon || '🍿'}</span>
                  <span className="truncate">{snack.name}</span>
                  <span className="text-amber-400 font-bold">x{snack.quantity}</span>
                </div>
                <span className="font-semibold text-white ml-2">₹{snack.price * snack.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Itemized Price Breakdown */}
      <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
        <div className="flex items-center justify-between text-slate-400">
          <span>Tickets Subtotal</span>
          <span className="text-white font-medium">₹{subtotal}</span>
        </div>

        {snackTotal > 0 && (
          <div className="flex items-center justify-between text-amber-400">
            <span>Food & Beverages</span>
            <span className="font-semibold">₹{snackTotal}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-slate-400">
          <span>Convenience Fee</span>
          <span className="text-white font-medium">₹{convenienceFee}</span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <span>Integrated GST (5%)</span>
          <span className="text-white font-medium">₹{tax}</span>
        </div>

        {discount > 0 && (
          <div className="flex items-center justify-between text-emerald-400 font-semibold">
            <span>Coupon Discount</span>
            <span>-₹{discount}</span>
          </div>
        )}

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-base font-black text-white">
          <span>Grand Total</span>
          <span className="text-brand-400 text-lg">₹{totalAmount}</span>
        </div>
      </div>

      {/* Popcorn & Food Lounge Quick Add Banner */}
      {selectedSeats.length > 0 && selectedSnacks.length === 0 && (
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById('snacks-section');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
              el.classList.add('ring-2', 'ring-amber-500');
              setTimeout(() => el.classList.remove('ring-2', 'ring-amber-500'), 1500);
            }
          }}
          className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border border-amber-500/30 hover:border-amber-400 text-left transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🍿</span>
              <div>
                <p className="text-xs font-bold text-amber-300 group-hover:text-amber-200">
                  Add Popcorn & Snacks
                </p>
                <p className="text-[10px] text-slate-400">Combos & beverages delivered to seat</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-[11px] font-black shrink-0 transition-colors">
              + Add
            </span>
          </div>
        </button>
      )}

      {/* Proceed Button */}
      <button
        onClick={onProceedToPayment}
        disabled={selectedSeats.length === 0 || isProcessing}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white font-bold text-sm shadow-xl shadow-brand-600/30 hover:shadow-brand-600/50 hover:scale-[1.02] active:scale-98 transition-all"
      >
        <span>{isProcessing ? 'Locking Seats...' : 'Proceed to Payment'}</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      <p className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        Safe & Encrypted 256-bit Checkout
      </p>
    </div>
  );
};

export default BookingSummary;
