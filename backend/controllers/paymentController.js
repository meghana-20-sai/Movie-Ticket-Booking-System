import crypto from 'crypto';
import { Payment } from '../models/Payment.js';
import { Show } from '../models/Show.js';

// @desc    Create payment order (Razorpay / SmartCinePay gateway)
// @route   POST /api/payments/create-order
export const createPaymentOrder = async (req, res) => {
  try {
    const { showId, seatIds, amount, couponCode } = req.body;
    const userId = req.user._id;

    if (!showId || !seatIds || !amount) {
      return res.status(400).json({ success: false, message: 'Missing order parameters' });
    }

    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    // Generate unique provider order ID
    const providerOrderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    res.json({
      success: true,
      data: {
        orderId: providerOrderId,
        amount: Math.round(amount * 100), // in paise
        currency: 'INR',
        keyId: process.env.PAYMENT_KEY_ID || 'rzp_test_smartcine_public_key',
        businessName: 'SmartCine Cinemas',
        description: `Booking for ${show.language} ${show.format}`,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify payment signature / mock confirmation
// @route   POST /api/payments/verify
export const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, paymentMethod = 'UPI' } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    // Simulation/Verification: If actual Razorpay secret is set, verify HMAC
    const secret = process.env.PAYMENT_KEY_SECRET;
    if (secret && signature && paymentId) {
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      if (generatedSignature !== signature) {
        return res.status(400).json({ success: false, message: 'Invalid payment signature' });
      }
    }

    const assignedPaymentId = paymentId || `pay_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        orderId,
        paymentId: assignedPaymentId,
        paymentMethod,
        status: 'captured',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
