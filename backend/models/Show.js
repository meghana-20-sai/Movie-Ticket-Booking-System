import mongoose from 'mongoose';

const showSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
      index: true,
    },
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true,
      index: true,
    },
    screenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: true,
      index: true,
    },
    date: {
      type: String, // YYYY-MM-DD for easy lookup & comparison
      required: true,
      index: true,
    },
    startTime: {
      type: String, // HH:MM (24h)
      required: true,
    },
    endTime: {
      type: String, // HH:MM (24h)
      required: true,
    },
    language: {
      type: String,
      required: true,
      default: 'English',
    },
    format: {
      type: String,
      enum: ['2D', '3D', 'IMAX', '4DX'],
      default: '2D',
    },
    basePrice: {
      type: Number,
      required: true,
      default: 200,
    },
    status: {
      type: String,
      enum: ['scheduled', 'running', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    bookedSeats: {
      type: [String], // Array of seat IDs/Keys like "A-1", "B-5"
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for finding shows by date, movie, and theatre
showSchema.index({ date: 1, movieId: 1, theatreId: 1 });
showSchema.index({ screenId: 1, date: 1 });

export const Show = mongoose.model('Show', showSchema);
