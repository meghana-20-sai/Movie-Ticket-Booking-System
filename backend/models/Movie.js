import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema(
  {
    // ── Core Fields (original) ─────────────────────────────────
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
    languages: {
      type: [String],
      default: [],
    },
    originalLanguage: {
      type: String,
      default: 'Unknown',
    },
    languageCode: {
      type: String,
      default: '',
    },
    isDubbed: {
      type: Boolean,
      default: false,
    },
    dubbedLanguages: {
      type: [String],
      default: [],
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    runtime: {
      type: Number, // Alias for duration
      default: function() { return this.duration; }
    },
    certification: {
      type: String,
      enum: ['U', 'UA', 'A', 'R', 'PG-13', 'Not Rated'],
      default: 'UA',
    },
    certificate: {
      type: String, // Alias for certification
      default: function() { return this.certification; }
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
      max: 10,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    voteCount: {
      type: Number, // Alias for ratingCount
      default: function() { return this.ratingCount; }
    },
    status: {
      type: String,
      enum: ['now-showing', 'coming-soon', 'ended', 'archived'],
      default: 'now-showing',
      index: true,
    },
    formats: {
      type: [String],
      default: ['2D', '3D'],
    },

    // ── Extended Fields (dynamic catalog) ─────────────────────
    originalTitle: {
      type: String,
      default: '',
    },
    country: {
      type: String,
      default: 'IN',
    },
    region: {
      type: String,
      default: 'India',
    },
    industry: {
      type: String,
      enum: ['Tollywood', 'Kollywood', 'Bollywood', 'Mollywood', 'Sandalwood', 'Hollywood', 'Other'],
      default: 'Other',
    },
    // TMDB / IMDb / external source deduplication
    externalMovieId: {
      type: String,
      default: null,
      sparse: true,
    },
    // IMDb Integration Fields
    imdbId: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    imdbRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
      index: true,
    },
    imdbVotes: {
      type: String,
      default: '',
    },
    imdbTopRank: {
      type: Number,
      default: null,
    },
    awards: {
      type: String,
      default: '',
    },
    source: {
      type: String,
      enum: ['manual', 'tmdb', 'imdb', 'seed'],
      default: 'manual',
    },
    // Admin-controlled promotional flag
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Computed trending flag (updated by trendingMovieService)
    isTrending: {
      type: Boolean,
      default: false,
      index: true,
    },
    // Track page views for trending calculation
    viewCount: {
      type: Number,
      default: 0,
    },
    // Track last sync from external source
    lastSyncedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Indexes ────────────────────────────────────────────────────
movieSchema.index(
  { title: 'text', description: 'text', director: 'text' },
  { language_override: 'none' }
);
movieSchema.index({ status: 1, releaseDate: -1 });
movieSchema.index({ isFeatured: 1, releaseDate: -1 });
movieSchema.index({ isTrending: 1, viewCount: -1 });
movieSchema.index({ releaseDate: -1 });

// ── Virtuals ──────────────────────────────────────────────────
// Automatically compute whether movie is a "new release" (within 30 days)
movieSchema.virtual('isNewRelease').get(function () {
  const now = new Date();
  const diff = (now - this.releaseDate) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 30;
});

// Compute dynamic display status from releaseDate
movieSchema.virtual('dynamicStatus').get(function () {
  const now = new Date();
  const diffDays = (now - this.releaseDate) / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return 'upcoming';
  if (diffDays <= 7) return 'new-release';
  if (diffDays <= 30) return 'recently-released';
  return this.status;
});

export const Movie = mongoose.model('Movie', movieSchema);
