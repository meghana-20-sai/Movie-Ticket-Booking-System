import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

const GENRES = ['Action', 'Sci-Fi', 'Adventure', 'Drama', 'Comedy', 'Thriller', 'Animation', 'Crime'];
const LANGUAGES = ['Telugu', 'Hindi', 'English', 'Tamil', 'Malayalam'];
const FORMATS = ['2D', '3D', 'IMAX', '4DX'];

const FilterPanel = ({ filters, onFilterChange, onReset }) => {
  const toggleArrayFilter = (field, value) => {
    const current = filters[field] ? filters[field].split(',') : [];
    let updated;
    if (current.includes(value)) {
      updated = current.filter((item) => item !== value);
    } else {
      updated = [...current, value];
    }
    onFilterChange({ ...filters, [field]: updated.join(',') });
  };

  const handleRatingChange = (rating) => {
    onFilterChange({
      ...filters,
      minRating: filters.minRating === rating ? '' : rating,
    });
  };

  const activeGenres = filters.genre ? filters.genre.split(',') : [];
  const activeLanguages = filters.language ? filters.language.split(',') : [];
  const activeFormats = filters.format ? filters.format.split(',') : [];

  const hasActiveFilters =
    filters.genre || filters.language || filters.format || filters.minRating;

  return (
    <div className="bg-cinema-900 border border-slate-800/80 rounded-2xl p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Filter className="w-4 h-4 text-brand-500" />
          <span>Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-[11px] text-brand-400 hover:text-brand-300 font-semibold"
          >
            <RotateCcw className="w-3 h-3" /> Reset All
          </button>
        )}
      </div>

      {/* Languages */}
      <div>
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
          Languages
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGES.map((lang) => {
            const isSelected = activeLanguages.includes(lang);
            return (
              <button
                key={lang}
                onClick={() => toggleArrayFilter('language', lang)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-brand-600 border-brand-500 text-white font-semibold shadow-md shadow-brand-600/30'
                    : 'bg-cinema-850 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                {lang}
              </button>
            );
          })}
        </div>
      </div>

      {/* Genres */}
      <div>
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
          Genres
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {GENRES.map((g) => {
            const isSelected = activeGenres.includes(g);
            return (
              <button
                key={g}
                onClick={() => toggleArrayFilter('genre', g)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-brand-600 border-brand-500 text-white font-semibold shadow-md shadow-brand-600/30'
                    : 'bg-cinema-850 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* Formats */}
      <div>
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
          Format Experience
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {FORMATS.map((fmt) => {
            const isSelected = activeFormats.includes(fmt);
            return (
              <button
                key={fmt}
                onClick={() => toggleArrayFilter('format', fmt)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-brand-600 border-brand-500 text-white font-semibold shadow-md shadow-brand-600/30'
                    : 'bg-cinema-850 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                {fmt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Minimum Rating */}
      <div>
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
          User Rating
        </h4>
        <div className="flex gap-2">
          {['4.5', '4.0', '3.0'].map((r) => {
            const isSelected = filters.minRating === r;
            return (
              <button
                key={r}
                onClick={() => handleRatingChange(r)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-medium border text-center transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold'
                    : 'bg-cinema-850 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                ★ {r}+
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
