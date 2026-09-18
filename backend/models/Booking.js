import mongoose from 'mongoose';

const bookedSeatSchema = new mongoose.Schema({
  seatId: { type: String, required: true }, // e.g. "A-1"
  row: { type: String, required: true },
  number: { type: Number, required: true },
  category: { type: String, enum: ['Regular', 'Executive', 'Premium'], default: 'Regular' },
  price: { type: Number, required: true },
});

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true,
      index: true,
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
    },
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true,
    },
    screenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: true,
    },
    seats: [bookedSeatSchema],
    subtotal: {
      type: Number,
      required: true,
    },
    convenienceFee: {
      type: Number,
      required: true,
      default: 40,
    },
    tax: {
      type: Number,
      required: true,
      default: 25,
    },
    discount: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: null,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    bookingStatus: {
      type: String,
      enum: ['confirmed', 'cancelled', 'expired'],
      default: 'confirmed',
    },
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    qrCode: {
      type: String,
      default: '',
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ createdAt: -1 });

export const Booking = mongoose.model('Booking', bookingSchema);
