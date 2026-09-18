import React, { useEffect, useState } from 'react';
import { MessageSquare, Star, Check, X, Trash2 } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await bookingService.getAllReviews();
      if (res.success) setReviews(res.data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleModerate = async (id, status) => {
    try {
      const res = await bookingService.moderateReview(id, status);
      if (res.success) {
        setReviews(reviews.map((r) => (r._id === id ? { ...r, status } : r)));
      }
    } catch (err) {
      alert(err.message || 'Failed to moderate review');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      const res = await bookingService.deleteReview(id);
      if (res.success) {
        setReviews(reviews.filter((r) => r._id !== id));
      }
    } catch (err) {
      alert(err.message || 'Failed to delete review');
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-800">
        <h2 className="text-xl font-black text-white">Review Moderation Queue</h2>
        <p className="text-xs text-slate-400">Moderate audience feedback, ratings, and approve comments</p>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading user movie reviews..." />
      ) : reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev._id}
              className="bg-cinema-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{rev.movieId?.title || 'Movie'}</span>
                  <span className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {rev.rating}.0
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-2 italic">"{rev.comment}"</p>

                <p className="text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-800">
                  By {rev.userId?.name || 'Customer'} ({rev.userId?.email})
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    rev.status === 'approved'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : rev.status === 'rejected'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/10 text-amber-400'
                  }`}
                >
                  {rev.status}
                </span>

                <div className="flex items-center gap-2">
                  {rev.status !== 'approved' && (
                    <button
                      onClick={() => handleModerate(rev._id, 'approved')}
                      className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                      title="Approve"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {rev.status !== 'rejected' && (
                    <button
                      onClick={() => handleModerate(rev._id, 'rejected')}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                      title="Reject"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(rev._id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-500 text-xs">No reviews submitted yet.</div>
      )}
    </div>
  );
};

export default AdminReviews;
