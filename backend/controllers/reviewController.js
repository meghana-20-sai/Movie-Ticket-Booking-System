import { Review } from '../models/Review.js';
import { Movie } from '../models/Movie.js';
import { Booking } from '../models/Booking.js';

// Helper to update average rating on Movie model
const updateMovieRating = async (movieId) => {
  const stats = await Review.aggregate([
    { $match: { movieId, status: 'approved' } },
    {
      $group: {
        _id: '$movieId',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Movie.findByIdAndUpdate(movieId, {
      rating: parseFloat(stats[0].avgRating.toFixed(1)),
      ratingCount: stats[0].count,
    });
  } else {
    await Movie.findByIdAndUpdate(movieId, {
      rating: 0,
      ratingCount: 0,
    });
  }
};

// @desc    Get approved reviews for a movie
// @route   GET /api/movies/:movieId/reviews
export const getMovieReviews = async (req, res) => {
  try {
    const { movieId } = req.params;

    const reviews = await Review.find({ movieId, status: 'approved' })
      .populate('userId', 'name profileImage preferredCity')
      .sort({ createdAt: -1 });

    const stats = await Review.aggregate([
      { $match: { movieId: reviews[0]?.movieId || null, status: 'approved' } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
    ]);

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    stats.forEach((s) => {
      distribution[s._id] = s.count;
    });

    res.json({
      success: true,
      data: reviews,
      meta: {
        totalReviews: reviews.length,
        distribution,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add review for a movie
// @route   POST /api/movies/:movieId/reviews
export const addReview = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating and review comment are required' });
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    // Check if user already reviewed this movie
    const existingReview = await Review.findOne({ userId, movieId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this movie.',
      });
    }

    // Optional booking verification check
    const booking = await Booking.findOne({ userId, movieId, bookingStatus: 'confirmed' });

    const review = await Review.create({
      userId,
      movieId,
      bookingId: booking ? booking._id : null,
      rating: Number(rating),
      comment: comment.trim(),
      status: 'approved',
    });

    await updateMovieRating(movie._id);

    const populatedReview = await Review.findById(review._id).populate('userId', 'name profileImage preferredCity');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully! Thank you for your feedback.',
      data: populatedReview,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reviews for moderation (Admin)
// @route   GET /api/reviews
export const getAllReviews = async (req, res) => {
  try {
    const { status, movieId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (movieId) query.movieId = movieId;

    const reviews = await Review.find(query)
      .populate('userId', 'name email')
      .populate('movieId', 'title poster')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Moderate review status (Admin)
// @route   PUT /api/reviews/:id/status
export const moderateReview = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'pending', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    await updateMovieRating(review.movieId);

    res.json({ success: true, message: `Review status changed to ${status}`, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete review (Admin)
// @route   DELETE /api/reviews/:id
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    await updateMovieRating(review.movieId);
    res.json({ success: true, message: 'Review removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
