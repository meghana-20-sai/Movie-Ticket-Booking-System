import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Movie description is required'],
      trim: true,
    },
    poster: {
      type: String,
      required: [true, 'Poster image URL is required'],
    },
    backdrop: {
      type: String,
      default: '',
    },
    trailerUrl: {
      type: String,
      default: '',
    },
    genre: {
      type: [String],
      required: true,
      index: true,
    },
    language: {
      type: [String],
      required: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    certification: {
      type: String,
      enum: ['U', 'UA', 'A', 'R', 'PG-13'],
      default: 'UA',
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    cast: {
      type: [String],
      default: [],
    },
    director: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['now-showing', 'coming-soon', 'ended'],
      default: 'now-showing',
      index: true,
    },
    formats: {
      type: [String],
      default: ['2D', '3D'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for search and status with language_override: 'none'
movieSchema.index(
  { title: 'text', description: 'text', director: 'text' },
  { language_override: 'none' }
);
movieSchema.index({ status: 1, releaseDate: -1 });

export const Movie = mongoose.model('Movie', movieSchema);
