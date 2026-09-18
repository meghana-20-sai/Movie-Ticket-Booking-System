import React, { useEffect, useState } from 'react';
import { Tag, Sparkles, Copy, Check, Percent, ShieldCheck } from 'lucide-react';
import { bookingService } from '../services/bookingService';
import LoadingSpinner from '../components/LoadingSpinner';

const OffersPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const res = await bookingService.getCoupons({ activeOnly: 'true' });
        if (res.success) {
          setCoupons(res.data);
        }
      } catch (error) {
        console.error('Failed to load coupons:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-brand-500" />
          <span className="text-xs font-black uppercase tracking-wider text-brand-400">
            Exclusive Deals
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">SmartCine Offers & Coupons</h1>
        <p className="text-xs text-slate-400 mt-1">
          Apply these promo codes during checkout to unlock instant discounts and cashback
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching active cinema discounts..." />
      ) : coupons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <div
              key={coupon._id}
              className="bg-cinema-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between hover:border-brand-500/40 transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-brand-600/20 border border-brand-500/40 text-brand-400 font-bold text-xs">
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountValue}% OFF`
                      : `₹${coupon.discountValue} FLAT OFF`}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">
                    Valid till {new Date(coupon.validUntil).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mt-3">
                  {coupon.description || `Special discount using promo code ${coupon.code}`}
                </h3>

                <p className="text-xs text-slate-400 mt-2">
                  Min. Booking Value: <span className="text-white font-semibold">₹{coupon.minimumAmount}</span>
                  {coupon.maximumDiscount && coupon.discountType === 'percentage' && (
                    <span> • Max Discount: <span className="text-white font-semibold">₹{coupon.maximumDiscount}</span></span>
                  )}
                </p>
              </div>

              {/* Promo Code Box */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div className="px-4 py-2 rounded-xl bg-cinema-850 border border-dashed border-brand-500/50 text-brand-300 font-mono text-sm font-black tracking-wider">
                  {coupon.code}
                </div>

                <button
                  onClick={() => handleCopy(coupon.code)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-brand-600 text-white text-xs font-bold transition-all"
                >
                  {copiedCode === coupon.code ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-slate-400 text-sm">No active promo codes at this moment.</p>
        </div>
      )}
    </div>
  );
};

export default OffersPage;
