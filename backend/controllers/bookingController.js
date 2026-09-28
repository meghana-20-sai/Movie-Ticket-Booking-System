import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';
import { Show } from '../models/Show.js';
import { Movie } from '../models/Movie.js';
import { Theatre } from '../models/Theatre.js';
import { Screen } from '../models/Screen.js';
import { Payment } from '../models/Payment.js';
import { Coupon } from '../models/Coupon.js';
import { seatLockService } from '../services/seatLockService.js';
import { generateBookingReference } from '../utils/generateBookingReference.js';
import { generateQRCode } from '../utils/generateQRCode.js';

// @desc    Create and confirm booking with atomic double-booking protection
// @route   POST /api/bookings
export const createBooking = async (req, res) => {
  try {
    const { showId, selectedSeats, snacks = [], couponCode, paymentDetails } = req.body;
    const userId = req.user._id;

    if (!showId || !selectedSeats || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select valid seats for the booking.' });
    }

    let show = null;
    if (mongoose.Types.ObjectId.isValid(showId)) {
      show = await Show.findById(showId)
        .populate('movieId')
        .populate('theatreId')
        .populate('screenId');
    }

    const seatIds = selectedSeats.map((s) => s.seatId || `${s.row}-${s.number}`);

    // Atomic Double Booking Check & Update on MongoDB Show model (if in DB)
    if (show) {
      const updateResult = await Show.updateOne(
        {
          _id: showId,
          bookedSeats: { $nin: seatIds },
        },
        {
          $addToSet: { bookedSeats: { $each: seatIds } },
        }
      );

      if (updateResult.modifiedCount === 0) {
        return res.status(409).json({
          success: false,
          message: 'One or more of the selected seats have just been booked by another user. Please choose alternative seats.',
        });
      }
    }

    // Calculate Pricing
    let subtotal = 0;
    const basePrice = show?.basePrice || selectedSeats[0]?.price || 200;
    const formattedSeats = selectedSeats.map((seat) => {
      const seatPrice = seat.price || Math.round(basePrice * (seat.priceMultiplier || 1.0));
      subtotal += seatPrice;
      return {
        seatId: seat.seatId || `${seat.row}-${seat.number}`,
        row: seat.row,
        number: seat.number,
        category: seat.category || 'Regular',
        price: seatPrice,
      };
    });

    const convenienceFee = 40;
    const tax = Math.round((subtotal + convenienceFee) * 0.05); // 5% GST on movie tickets
    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      appliedCoupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim(), isActive: true });
      if (appliedCoupon && subtotal >= appliedCoupon.minimumAmount) {
        if (appliedCoupon.discountType === 'percentage') {
          discount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
          if (appliedCoupon.maximumDiscount) {
            discount = Math.min(discount, appliedCoupon.maximumDiscount);
          }
        } else {
          discount = appliedCoupon.discountValue;
        }
        discount = Math.min(discount, subtotal);
        // Increment coupon count
        appliedCoupon.usedCount += 1;
        await appliedCoupon.save();
      }
    }

    // Calculate Snacks Total
    const snackTotal = (snacks || []).reduce(
      (sum, snk) => sum + (Number(snk.price) || 0) * (Number(snk.quantity) || 1),
      0
    );

    const totalAmount = Math.max(0, subtotal + snackTotal + convenienceFee + tax - discount);
    const bookingReference = generateBookingReference();

    const movieData = req.body.movie || show?.movieId || {};
    const theatreData = req.body.theatre || show?.theatreId || {};
    const showData = req.body.show || show || {};

    // Generate dynamic QR Code containing secure booking reference payload
    const qrPayload = {
      bookingReference,
      showId: show?._id || showId,
      movie: movieData.title || 'Cinema Movie',
      theatre: theatreData.name || 'SmartCine Multiplex',
      screen: showData.screenName || show?.screenId?.name || 'Screen 1',
      date: showData.date || show?.date || new Date().toISOString().split('T')[0],
      time: showData.startTime || showData.showTime || show?.startTime || '18:00',
      seats: seatIds,
      snacks: snacks || [],
      snackTotal,
      totalAmount,
      customer: req.user.name,
    };
    const qrCode = await generateQRCode(qrPayload);

    // Create Booking record
    const validShowId = show?._id || (mongoose.Types.ObjectId.isValid(showId) ? showId : new mongoose.Types.ObjectId());
    const validMovieId = show?.movieId?._id || (movieData._id && mongoose.Types.ObjectId.isValid(movieData._id) ? movieData._id : new mongoose.Types.ObjectId());
    const validTheatreId = show?.theatreId?._id || (theatreData._id && mongoose.Types.ObjectId.isValid(theatreData._id) ? theatreData._id : new mongoose.Types.ObjectId());
    const validScreenId = show?.screenId?._id || new mongoose.Types.ObjectId();

    const booking = await Booking.create({
      userId,
      showId: validShowId,
      movieId: validMovieId,
      theatreId: validTheatreId,
      screenId: validScreenId,
      seats: formattedSeats,
      snacks: snacks || [],
      snackTotal,
      subtotal,
      convenienceFee,
      tax,
      discount,
      couponCode: appliedCoupon ? appliedCoupon.code : couponCode,
      totalAmount,
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
      bookingReference,
      qrCode: qrCode || '',
    });

    // Create Payment record
    const payment = await Payment.create({
      bookingId: booking._id,
      userId,
      provider: paymentDetails?.provider || 'SmartCinePay',
      providerOrderId: paymentDetails?.orderId || `order_${bookingReference}`,
      providerPaymentId: paymentDetails?.paymentId || `pay_${bookingReference}`,
      amount: totalAmount,
      paymentMethod: paymentDetails?.paymentMethod || 'UPI',
      status: 'captured',
    });

    // Release temporary memory lock for this user
    seatLockService.releaseSeats(showId, seatIds, userId);

    // Broadcast seat booked event via Socket.IO
    if (seatLockService.io) {
      seatLockService.io.to(`show:${showId}`).emit('seat:booked', {
        showId: showId.toString(),
        seats: seatIds,
        bookingReference,
      });
    }

    // Populate for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('movieId')
      .populate('theatreId')
      .populate('screenId')
      .populate('userId', 'name email phone');

    const resultBooking = populatedBooking ? populatedBooking.toObject() : booking.toObject();
    if (!resultBooking.movieId?.title && movieData.title) resultBooking.movieId = movieData;
    if (!resultBooking.theatreId?.name && theatreData.name) resultBooking.theatreId = theatreData;
    if (!resultBooking.showId?.showTime && showData) resultBooking.showId = showData;
    resultBooking.movie = movieData;
    resultBooking.theatre = theatreData;
    resultBooking.show = showData;

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully 🎉',
      data: resultBooking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's booking history (Upcoming & Past)
// @route   GET /api/bookings/my
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('movieId')
      .populate('theatreId')
      .populate('screenId')
      .populate('showId')
      .sort({ createdAt: -1 });

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentHourMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const upcoming = [];
    const past = [];

    for (const b of bookings) {
      const showDate = b.showId?.date || b.createdAt.toISOString().split('T')[0];
      const showTime = b.showId?.startTime || '00:00';

      const isFutureDate = showDate > todayStr;
      const isTodayFutureTime = showDate === todayStr && showTime > currentHourMin;
      const isConfirmed = b.bookingStatus === 'confirmed';

      // Check cancellation eligibility (> 2 hours prior to showtime)
      let canCancel = false;
      if (isConfirmed && (isFutureDate || isTodayFutureTime)) {
        const [showHours, showMins] = showTime.split(':').map(Number);
        const showDateTime = new Date(`${showDate}T${String(showHours).padStart(2, '0')}:${String(showMins).padStart(2, '0')}:00`);
        const diffMs = showDateTime.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        if (diffHours >= 2) {
          canCancel = true;
        }
      }

      const bookingObj = {
        ...b.toObject(),
        canCancel,
      };

      if (isConfirmed && (isFutureDate || isTodayFutureTime)) {
        upcoming.push(bookingObj);
      } else {
        past.push(bookingObj);
      }
    }

    res.json({
      success: true,
      data: {
        upcoming,
        past,
        total: bookings.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('movieId')
      .populate('theatreId')
      .populate('screenId')
      .populate('showId')
      .populate('userId', 'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Ensure only the booking owner or admin can view
    if (booking.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    // Cancellation eligibility check
    const now = new Date();
    const showDate = booking.showId?.date || '';
    const showTime = booking.showId?.startTime || '00:00';
    let canCancel = false;

    if (booking.bookingStatus === 'confirmed' && showDate) {
      const [showHours, showMins] = showTime.split(':').map(Number);
      const showDateTime = new Date(`${showDate}T${String(showHours).padStart(2, '0')}:${String(showMins).padStart(2, '0')}:00`);
      const diffHours = (showDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (diffHours >= 2) canCancel = true;
    }

    res.json({
      success: true,
      data: {
        ...booking.toObject(),
        canCancel,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel eligible booking & release seats
// @route   POST /api/bookings/:id/cancel
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('showId');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    const now = new Date();
    const showDate = booking.showId?.date;
    const showTime = booking.showId?.startTime || '00:00';

    if (showDate) {
      const [showHours, showMins] = showTime.split(':').map(Number);
      const showDateTime = new Date(`${showDate}T${String(showHours).padStart(2, '0')}:${String(showMins).padStart(2, '0')}:00`);
      const diffHours = (showDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (diffHours < 2 && req.user.role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Bookings can only be cancelled at least 2 hours before showtime.',
        });
      }
    }

    // Mark booking as cancelled
    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.cancelledAt = new Date();
    // Refund amount = subtotal + tax (excluding convenience fee)
    booking.refundAmount = Math.max(0, booking.totalAmount - (booking.convenienceFee || 40));
    await booking.save();

    // Release seats on the Show document
    const seatIds = booking.seats.map((s) => s.seatId);
    if (booking.showId) {
      await Show.updateOne(
        { _id: booking.showId._id },
        { $pull: { bookedSeats: { $in: seatIds } } }
      );

      // Broadcast released seats via Socket.IO
      if (seatLockService.io) {
        seatLockService.io.to(`show:${booking.showId._id}`).emit('seat:released', {
          showId: booking.showId._id.toString(),
          seats: seatIds,
          reason: 'booking_cancelled',
        });
      }
    }

    res.json({
      success: true,
      message: `Booking cancelled successfully. A refund of ₹${booking.refundAmount} has been initiated to your original payment method.`,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings (Admin with search and filters)
// @route   GET /api/bookings
export const getAllBookings = async (req, res) => {
  try {
    const { search, status, paymentStatus, theatreId, movieId, date, page = 1, limit = 25 } = req.query;
    const query = {};

    if (status) query.bookingStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (theatreId) query.theatreId = theatreId;
    if (movieId) query.movieId = movieId;

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ bookingReference: searchRegex }, { couponCode: searchRegex }];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 25;
    const skip = (pageNum - 1) * limitNum;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('movieId', 'title poster')
      .populate('theatreId', 'name city')
      .populate('screenId', 'name format')
      .populate('userId', 'name email phone')
      .populate('showId', 'date startTime endTime')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: bookings,
      meta: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
