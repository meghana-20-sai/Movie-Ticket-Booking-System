import mongoose from 'mongoose';

const seatSchema = new mongoose.Schema(
  {
    screenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: true,
      index: true,
    },
    row: {
      type: String,
      required: true,
      trim: true,
    },
    number: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ['Regular', 'Executive', 'Premium'],
      default: 'Regular',
    },
    priceMultiplier: {
      type: Number,
      default: 1.0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

seatSchema.index({ screenId: 1, row: 1, number: 1 }, { unique: true });

export const Seat = mongoose.model('Seat', seatSchema);
