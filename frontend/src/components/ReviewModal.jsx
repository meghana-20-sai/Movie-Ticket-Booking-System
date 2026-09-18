import React, { useState } from 'react';
import { Star, X, Send } from 'lucide-react';
import { movieService } from '../services/movieService';

const ReviewModal = ({ isOpen, onClose, movieId, movieTitle, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please write a review comment.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await movieService.addReview(movieId, { rating, comment });
      if (res.success) {
        if (onReviewSubmitted) onReviewSubmitted(res.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-cinema-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Rate & Review</h3>
            <p className="text-xs text-slate-400 truncate max-w-[260px]">{movieTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Star Rating Selector */}
          <div className="flex flex-col items-center gap-1.5 py-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Your Rating
            </span>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-amber-400">
              {rating === 5 ? 'Masterpiece (5/5)' : rating === 4 ? 'Very Good (4/5)' : rating === 3 ? 'Decent (3/5)' : 'Needs Improvement'}
            </span>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Review & Experience
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you love about the movie, music, direction, or performances?"
              className="w-full bg-cinema-850 border border-slate-800 focus:border-brand-500 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 outline-none resize-none transition-all"
            ></textarea>
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={loading || !comment.trim()}
            className="w-full py-3 px-4 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition-all"
          >
            {loading ? 'Submitting...' : <><Send className="w-3.5 h-3.5" /> Submit Review</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
