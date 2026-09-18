import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Sparkles, Volume2 } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

const formatTime12h = (time24) => {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'Sold Out':
      return {
        bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        dot: 'bg-rose-500',
      };
    case 'Almost Full':
      return {
        bg: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
        dot: 'bg-orange-500',
      };
    case 'Filling Fast':
      return {
        bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        dot: 'bg-amber-500',
      };
    default:
      return {
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        dot: 'bg-emerald-500',
      };
  }
};

const TheatreCard = ({ theatreData, movie, selectedDate }) => {
  const navigate = useNavigate();
  const { setCurrentMovie, setCurrentTheatre, setCurrentDate, setCurrentShow } = useBooking();

  const { theatre, showsByFormat } = theatreData;

  const handleSelectShow = (show) => {
    if (show.availabilityStatus === 'Sold Out') return;

    setCurrentMovie(movie);
    setCurrentTheatre(theatre);
    setCurrentDate(selectedDate);
    setCurrentShow(show);

    navigate(`/seat-selection/${show._id}`);
  };

  return (
    <div className="bg-cinema-900 border border-slate-800 rounded-2xl p-5 md:p-6 transition-all shadow-lg hover:border-slate-700">
      {/* Theatre Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-500" />
            <h3 className="font-bold text-white text-base sm:text-lg">{theatre.name}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{theatre.address}, {theatre.city}</span>
          </p>
        </div>

        {/* Amenities badges */}
        {theatre.amenities && (
          <div className="flex flex-wrap gap-1.5">
            {theatre.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="text-[10px] text-slate-300 bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded-md font-medium"
              >
                {amenity}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Shows Grouped by Format */}
      <div className="mt-4 space-y-4">
        {Object.entries(showsByFormat).map(([format, shows]) => (
          <div key={format} className="flex flex-col md:flex-row md:items-start gap-3">
            {/* Format Label */}
            <div className="min-w-[90px] pt-1">
              <span className="inline-block px-2.5 py-1 rounded-lg bg-brand-950/70 border border-brand-500/30 text-brand-400 text-xs font-black tracking-wider">
                {format}
              </span>
            </div>

            {/* Show Time Pills */}
            <div className="flex flex-wrap gap-3 flex-grow">
              {shows.map((show) => {
                const badge = getStatusBadge(show.availabilityStatus);
                const isSoldOut = show.availabilityStatus === 'Sold Out';

                return (
                  <button
                    key={show._id}
                    onClick={() => handleSelectShow(show)}
                    disabled={isSoldOut}
                    className={`group relative flex flex-col items-center justify-center min-w-[100px] p-2.5 rounded-xl border text-center transition-all ${
                      isSoldOut
                        ? 'bg-slate-900/50 border-slate-800/50 opacity-40 cursor-not-allowed'
                        : 'bg-cinema-850 hover:bg-slate-800 border-slate-800 hover:border-brand-500/50 hover:shadow-lg hover:scale-105 active:scale-95'
                    }`}
                  >
                    <span className="text-xs font-bold text-white group-hover:text-brand-400">
                      {formatTime12h(show.startTime)}
                    </span>

                    <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                      ₹{show.basePrice}
                    </span>

                    {/* Availability Tag */}
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                      <span className="text-[9px] font-semibold text-slate-400">
                        {show.availabilityStatus}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TheatreCard;
