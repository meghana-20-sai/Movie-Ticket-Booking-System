import mongoose from 'mongoose';

const screenSchema = new mongoose.Schema(
  {
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    format: {
      type: String,
      enum: ['2D', '3D', 'IMAX', '4DX', 'ScreenX'],
      default: '2D',
    },
    capacity: {
      type: Number,
      required: true,
      default: 80,
    },
    soundSystem: {
      type: String,
      default: 'Dolby Atmos 7.1',
    },
    seatLayout: {
      rows: {
        type: [
          {
            rowLabel: { type: String, required: true },
            category: { type: String, enum: ['Regular', 'Executive', 'Premium'], default: 'Regular' },
            seatsCount: { type: Number, required: true, default: 10 },
            priceMultiplier: { type: Number, default: 1.0 },
          },
        ],
        default: [],
      },
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

export const Screen = mongoose.model('Screen', screenSchema);
