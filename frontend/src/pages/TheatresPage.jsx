import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Tv,
  Sparkles,
  Filter,
  Ticket,
  Clock,
  ChevronDown,
  ChevronUp,
  Film,
  Calendar,
} from 'lucide-react';
import { movieService } from '../services/movieService';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { getFallbackMoviesForTheatre } from '../data/defaultTheatres';
import {
  getDummyCinemaImage,
  getDummyMoviePoster,
  createSvgFallbackCinema,
  createSvgFallbackPoster,
} from '../utils/dummyImages';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const TheatresPage = () => {
  const { city } = useAuth();
  const navigate = useNavigate();
  const { setCurrentMovie, setCurrentTheatre, setCurrentDate, setCurrentShow } = useBooking();

  const [theatres, setTheatres] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(city || 'all');
  const [loading, setLoading] = useState(true);
  const [expandedTheatreId, setExpandedTheatreId] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [theatresRes, citiesRes] = await Promise.all([
          movieService.getTheatres({ city: selectedCity === 'all' ? undefined : selectedCity }),
          movieService.getCities(),
        ]);

        if (theatresRes.success && Array.isArray(theatresRes.data) && theatresRes.data.length > 0) {
          setTheatres(theatresRes.data);
        }
        if (citiesRes.success && Array.isArray(citiesRes.data) && citiesRes.data.length > 0) {
          setCities(citiesRes.data);
        }
      } catch (error) {
        console.error('Failed to load theatres:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCity]);

  const handleToggleTheatre = (theatreId) => {
    setExpandedTheatreId((prev) => (prev === theatreId ? null : theatreId));
  };

  const handleSelectShow = (theatre, movie, show) => {
    setCurrentMovie(movie);
    setCurrentTheatre(theatre);
    setCurrentDate(todayStr);
    setCurrentShow({
      ...show,
      movieId: movie._id,
      theatreId: theatre._id,
      date: todayStr,
      startTime: show.time24 || show.time,
      showTime: show.time,
      format: show.format,
      basePrice: show.price,
    });
    navigate(`/seat-selection/${show._id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Cinemas & Theatres</h1>
          <p className="text-xs text-slate-400 mt-1">
            Discover premier cinema complexes, IMAX laser auditoriums, and luxury lounges with instant seat booking
          </p>
        </div>

        {/* City Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCity('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCity === 'all'
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                : 'bg-cinema-900 hover:bg-slate-800 text-slate-400'
            }`}
          >
            All Cities
          </button>
          {cities.map((c) => (
            <button
              key={c.name}
              onClick={() => setSelectedCity(c.name)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCity.toLowerCase() === c.name.toLowerCase()
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'bg-cinema-900 hover:bg-slate-800 text-slate-400'
              }`}
            >
              {c.name} ({c.theatreCount})
            </button>
          ))}
        </div>
      </div>

      {/* Theatres List */}
      {loading ? (
        <LoadingSpinner text="Locating cinema multiplexes..." />
      ) : theatres.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {theatres.map((theatre) => {
            const isExpanded = expandedTheatreId === theatre._id;
            const theatreShowsData = getFallbackMoviesForTheatre(theatre._id);

            return (
              <div
                key={theatre._id}
                className={`bg-cinema-900 border rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 flex flex-col justify-between transition-all duration-300 ${
                  isExpanded ? 'border-brand-500 shadow-brand-500/10' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-4">
                  {/* Cinema Photo Banner with Fallback */}
                  <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-800 border border-slate-700/60 shadow-md group">
                    <img
                      src={theatre.image || getDummyCinemaImage(theatre._id)}
                      alt={theatre.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = createSvgFallbackCinema(theatre.name);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-cinema-900 via-cinema-900/30 to-transparent" />
                    
                    {/* City Badge Overlay */}
                    <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-brand-500/40 text-brand-300 font-bold text-[11px] shadow-lg">
                      📍 {theatre.city}
                    </span>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white leading-tight">{theatre.name}</h3>
                        <p className="text-xs text-brand-400 font-semibold">{theatre.city}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 flex items-start gap-1.5 leading-relaxed">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span>{theatre.address}</span>
                  </p>

                  {/* Formats */}
                  <div className="flex flex-wrap gap-1.5">
                    {theatre.formats?.map((fmt) => (
                      <span
                        key={fmt}
                        className="px-2.5 py-0.5 rounded-lg bg-brand-950 border border-brand-500/40 text-brand-300 font-bold text-[10px]"
                      >
                        {fmt}
                      </span>
                    ))}
                    <span className="px-2.5 py-0.5 rounded-lg bg-cinema-850 border border-slate-800 text-slate-400 text-[10px] font-medium">
                      {theatre.screenCount || 3} Screens
                    </span>
                  </div>

                  {/* Amenities */}
                  {theatre.amenities && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2">
                        Multiplex Features
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {theatre.amenities.slice(0, 4).map((a) => (
                          <span
                            key={a}
                            className="px-2 py-0.5 rounded-md bg-cinema-850 text-slate-300 text-[10px]"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Shows & Movies Section */}
                <div className="pt-3 border-t border-slate-800/80 space-y-3">
                  <button
                    onClick={() => handleToggleTheatre(theatre._id)}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/30 transition-all"
                  >
                    <div className="flex items-center gap-1.5">
                      <Ticket className="w-4 h-4" />
                      <span>{isExpanded ? 'Hide Showtimes' : 'View Shows & Book Tickets'}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {/* Expanded Movie Showtimes */}
                  {isExpanded && (
                    <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <p className="text-[10px] uppercase font-bold text-brand-400 tracking-wider">
                        Now Showing Today ({theatreShowsData.movies.length} Blockbusters)
                      </p>

                      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                        {theatreShowsData.movies.map((mov) => (
                          <div
                            key={mov._id}
                            className="p-3 rounded-2xl bg-cinema-850 border border-slate-800 space-y-2.5"
                          >
                            <div className="flex items-center gap-2.5">
                              {/* Movie Poster Thumbnail with Fallback */}
                              <div className="w-10 h-14 rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-slate-700/60 shadow-sm">
                                <img
                                  src={mov.poster || getDummyMoviePoster(mov._id)}
                                  alt={mov.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = createSvgFallbackPoster(mov.title);
                                  }}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-white truncate max-w-[150px]">
                                    {mov.title}
                                  </span>
                                  <span className="text-[10px] text-amber-400 font-bold">
                                    ⭐ {mov.rating}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                                  {mov.language} • {mov.genre?.join(', ')}
                                </p>
                              </div>
                            </div>

                            {/* Showtimes Buttons */}
                            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-800/60">
                              {mov.shows.map((shw) => (
                                <button
                                  key={shw._id}
                                  onClick={() => handleSelectShow(theatre, mov, shw)}
                                  className="px-2.5 py-1.5 rounded-xl bg-cinema-900 hover:bg-brand-600 border border-slate-700/80 hover:border-brand-500 text-white text-[11px] font-bold transition-all shadow-sm flex items-center gap-1"
                                  title={`Book ${mov.title} at ${shw.time} (${shw.format})`}
                                >
                                  <Clock className="w-3 h-3 text-brand-400 group-hover:text-white" />
                                  <span>{shw.time}</span>
                                  <span className="text-[9px] text-slate-400 font-normal">
                                    {shw.format}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {theatre.contactInfo?.phone && (
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Phone className="w-3 h-3 text-brand-500" />
                        {theatre.contactInfo.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title="No theatres found"
          description="Try selecting another city or reset your filters."
        />
      )}
    </div>
  );
};

export default TheatresPage;
