import React, { useEffect, useState } from 'react';
import { MapPin, Check, X, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { movieService } from '../services/movieService';

const defaultCities = [
  { name: 'Hyderabad', icon: '🏰', popular: true },
  { name: 'Bengaluru', icon: '💻', popular: true },
  { name: 'Mumbai', icon: '🌊', popular: true },
  { name: 'Vijayawada', icon: '⛩️', popular: true },
  { name: 'Visakhapatnam', icon: '🚢', popular: true },
  { name: 'Delhi NCR', icon: '🏛️', popular: false },
  { name: 'Chennai', icon: '🌴', popular: false },
  { name: 'Kolkata', icon: '🚊', popular: false },
];

const CitySelectorModal = ({ isOpen, onClose }) => {
  const { city, updateCity } = useAuth();
  const [citiesData, setCitiesData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchCities = async () => {
        try {
          const res = await movieService.getCities();
          if (res.success && res.data.length > 0) {
            setCitiesData(res.data);
          }
        } catch (error) {
          console.error('Failed to load cities:', error);
        }
      };
      fetchCities();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectCity = (cityName) => {
    updateCity(cityName);
    onClose();
  };

  const filteredCities = defaultCities.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-cinema-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-500 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Select Your City</h3>
              <p className="text-xs text-slate-400">Discover cinemas and showtimes near you</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="my-4">
          <input
            type="text"
            placeholder="Search for your city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-cinema-850 border border-slate-800 focus:border-brand-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
          />
        </div>

        {/* Popular Cities Grid */}
        <div className="mt-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            Top Cinema Hubs
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
            {filteredCities.map((item) => {
              const isSelected = city.toLowerCase() === item.name.toLowerCase();
              const serverMatch = citiesData.find((cd) => cd.name.toLowerCase() === item.name.toLowerCase());
              return (
                <button
                  key={item.name}
                  onClick={() => handleSelectCity(item.name)}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all group ${
                    isSelected
                      ? 'bg-brand-600/20 border-brand-500 text-white font-semibold shadow-lg shadow-brand-500/10'
                      : 'bg-cinema-850 hover:bg-slate-800 border-slate-800/80 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-lg group-hover:scale-110 transition-transform">{item.icon}</span>
                    <div className="truncate">
                      <p className="text-xs font-medium truncate">{item.name}</p>
                      {serverMatch && (
                        <p className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Building2 className="w-2.5 h-2.5 text-brand-400" /> {serverMatch.theatreCount} cinemas
                        </p>
                      )}
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-brand-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitySelectorModal;
