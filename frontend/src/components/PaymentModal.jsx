import React, { useState } from 'react';
import { CreditCard, Smartphone, Building2, ShieldCheck, X, CheckCircle2, Lock } from 'lucide-react';
import { paymentService } from '../services/paymentService';

const PaymentModal = ({
  isOpen,
  onClose,
  show,
  selectedSeats,
  totalAmount,
  onPaymentSuccess,
}) => {
  const [method, setMethod] = useState('UPI'); // UPI, CARD, NETBANKING
  const [upiId, setUpiId] = useState('user@okhdfcbank');
  const [cardDetails, setCardDetails] = useState({
    number: '4532 •••• •••• 8892',
    name: 'AARAV SHARMA',
    expiry: '09/28',
    cvv: '•••',
  });
  const [bank, setBank] = useState('HDFC');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handlePayNow = async () => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // 1. Create payment order on backend
      const orderRes = await paymentService.createPaymentOrder({
        showId: show._id,
        seatIds: selectedSeats.map((s) => s.id || s.seatId),
        amount: totalAmount,
      });

      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Failed to initialize payment gateway');
      }

      const { orderId } = orderRes.data;

      // 2. Simulate gateway authorization delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 3. Verify payment on backend
      const verifyRes = await paymentService.verifyPayment({
        orderId,
        paymentMethod: method,
      });

      if (!verifyRes.success) {
        throw new Error(verifyRes.message || 'Payment verification failed');
      }

      // 4. Trigger confirmed booking creation
      await onPaymentSuccess({
        orderId,
        paymentId: verifyRes.data.paymentId,
        paymentMethod: method,
        provider: 'SmartCinePay',
      });
    } catch (error) {
      setErrorMessage(error.message || 'Payment could not be processed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-cinema-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-600/20 text-brand-500 border border-brand-500/30 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">SmartCine Secure Checkout</h3>
              <p className="text-xs text-slate-400">Total Payable: <span className="text-brand-400 font-black">₹{totalAmount}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Method Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 my-5">
          <button
            onClick={() => setMethod('UPI')}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
              method === 'UPI'
                ? 'bg-brand-600/20 border-brand-500 text-white font-bold shadow-md shadow-brand-500/20'
                : 'bg-cinema-850 hover:bg-slate-800 border-slate-800 text-slate-400'
            }`}
          >
            <Smartphone className="w-5 h-5 mb-1 text-brand-400" />
            <span className="text-xs">UPI / QR</span>
          </button>

          <button
            onClick={() => setMethod('CARD')}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
              method === 'CARD'
                ? 'bg-brand-600/20 border-brand-500 text-white font-bold shadow-md shadow-brand-500/20'
                : 'bg-cinema-850 hover:bg-slate-800 border-slate-800 text-slate-400'
            }`}
          >
            <CreditCard className="w-5 h-5 mb-1 text-brand-400" />
            <span className="text-xs">Cards</span>
          </button>

          <button
            onClick={() => setMethod('NETBANKING')}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
              method === 'NETBANKING'
                ? 'bg-brand-600/20 border-brand-500 text-white font-bold shadow-md shadow-brand-500/20'
                : 'bg-cinema-850 hover:bg-slate-800 border-slate-800 text-slate-400'
            }`}
          >
            <Building2 className="w-5 h-5 mb-1 text-brand-400" />
            <span className="text-xs">NetBanking</span>
          </button>
        </div>

        {/* Method Details Form */}
        <div className="bg-cinema-850 border border-slate-800/90 rounded-2xl p-4 my-4 space-y-3">
          {method === 'UPI' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                Virtual Payment Address (UPI ID)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="username@bank"
                className="w-full bg-cinema-900 border border-slate-800 focus:border-brand-500 rounded-xl p-2.5 text-xs text-white outline-none font-mono"
              />
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Supports GPay, PhonePe, Paytm, BHIM UPI</span>
              </div>
            </div>
          )}

          {method === 'CARD' && (
            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardDetails.number}
                  onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                  className="w-full bg-cinema-900 border border-slate-800 rounded-xl p-2 text-xs text-white outline-none font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Expiry</label>
                  <input
                    type="text"
                    value={cardDetails.expiry}
                    onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                    className="w-full bg-cinema-900 border border-slate-800 rounded-xl p-2 text-xs text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">CVV</label>
                  <input
                    type="password"
                    value={cardDetails.cvv}
                    onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                    className="w-full bg-cinema-900 border border-slate-800 rounded-xl p-2 text-xs text-white outline-none font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {method === 'NETBANKING' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Select Bank</label>
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="w-full bg-cinema-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none"
              >
                <option value="HDFC">HDFC Bank</option>
                <option value="ICICI">ICICI Bank</option>
                <option value="SBI">State Bank of India</option>
                <option value="AXIS">Axis Bank</option>
                <option value="KOTAK">Kotak Mahindra Bank</option>
              </select>
            </div>
          )}
        </div>

        {errorMessage && (
          <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl mb-4">
            {errorMessage}
          </p>
        )}

        {/* Action Button */}
        <button
          onClick={handlePayNow}
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-brand-600/30 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Securing Booking...
            </span>
          ) : (
            `Pay ₹${totalAmount} & Confirm`
          )}
        </button>

        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>PCI-DSS Compliant • Simulated Test Environment</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
