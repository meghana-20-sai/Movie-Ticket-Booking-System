import React from 'react';
import { X } from 'lucide-react';

const TrailerModal = ({ isOpen, onClose, trailerUrl, title }) => {
  if (!isOpen || !trailerUrl) return null;

  // Extract YouTube ID
  let videoId = '';
  try {
    if (trailerUrl.includes('youtube.com/watch?v=')) {
      videoId = trailerUrl.split('watch?v=')[1]?.split('&')[0];
    } else if (trailerUrl.includes('youtu.be/')) {
      videoId = trailerUrl.split('youtu.be/')[1]?.split('?')[0];
    }
  } catch (e) {
    videoId = '';
  }

  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
    : trailerUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-cinema-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-sm sm:text-base font-bold text-white truncate">
            {title ? `${title} – Official Trailer` : 'Movie Trailer'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Embed */}
        <div className="relative pb-[56.25%] h-0 bg-black">
          {videoId ? (
            <iframe
              src={embedUrl}
              title={title || 'Movie Trailer'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full border-0"
            ></iframe>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
              Trailer video preview not available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrailerModal;
