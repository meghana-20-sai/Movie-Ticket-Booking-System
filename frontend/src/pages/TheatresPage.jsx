import React, { useEffect, useState } from 'react';
import { Building2, MapPin, Phone, Mail, Tv, Sparkles, Filter } from 'lucide-react';
import { movieService } from '../services/movieService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const TheatresPage = () => {
  const { city } = useAuth();
  const [theatres, setTheatres] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(city || 'all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [theatresRes, citiesRes] = await Promise.all([
          movieService.getTheatres({ city: selectedCity === 'all' ? undefined : selectedCity }),
          movieService.getCities(),
        ]);

        if (theatresRes.success) {
          setTheatres(theatresRes.data);
        }
        if (citiesRes.success) {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Cinemas & Theatres</h1>
          <p className="text-xs text-slate-400 mt-1">
            Discover premier cinema complexes, IMAX laser auditoriums, and luxury lounges
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
          {theatres.map((theatre) => (
            <div
              key={theatre._id}
              className="bg-cinema-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{theatre.name}</h3>
                      <p className="text-xs text-brand-400 font-semibold">{theatre.city}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-3 flex items-start gap-1.5 leading-relaxed">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span>{theatre.address}</span>
                </p>

                {/* Formats */}
                <div className="mt-4 flex flex-wrap gap-1.5">
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
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2">
                      Multiplex Features
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {theatre.amenities.map((a) => (
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

              {theatre.contactInfo?.phone && (
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-brand-500" />
                    {theatre.contactInfo.phone}
                  </span>
                </div>
              )}
            </div>
          ))}
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
