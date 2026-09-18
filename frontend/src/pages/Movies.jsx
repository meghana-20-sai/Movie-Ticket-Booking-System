import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Film, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { movieService } from '../services/movieService';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import MovieGrid from '../components/MovieGrid';
import TrailerModal from '../components/TrailerModal';
import LoadingSpinner from '../components/LoadingSpinner';

const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [trailerState, setTrailerState] = useState({ isOpen: false, url: '', title: '' });

  // Read URL params or set defaults
  const activeTab = searchParams.get('status') || 'now-showing';
  const searchQuery = searchParams.get('search') || '';
  const selectedGenre = searchParams.get('genre') || '';
  const selectedLanguage = searchParams.get('language') || '';
  const selectedFormat = searchParams.get('format') || '';
  const minRating = searchParams.get('minRating') || '';
  const sortBy = searchParams.get('sort') || 'popular';

  useEffect(() => {
    const fetchFilteredMovies = async () => {
      try {
        setLoading(true);
        const params = {
          status: activeTab,
          search: searchQuery,
          genre: selectedGenre,
          language: selectedLanguage,
          format: selectedFormat,
          minRating,
          sort: sortBy,
        };

        const res = await movieService.getMovies(params);
        if (res.success) {
          setMovies(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredMovies();
  }, [activeTab, searchQuery, selectedGenre, selectedLanguage, selectedFormat, minRating, sortBy]);

  const handleTabChange = (status) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('status', status);
    setSearchParams(newParams);
  };

  const handleSearchChange = (query) => {
    const newParams = new URLSearchParams(searchParams);
    if (query) {
      newParams.set('search', query);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleFilterChange = (filters) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(filters).forEach(([key, val]) => {
      if (val) {
        newParams.set(key, val);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    const newParams = new URLSearchParams();
    newParams.set('status', activeTab);
    setSearchParams(newParams);
  };

  const handleSortChange = (e) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', e.target.value);
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Status Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Explore Movies</h1>
          <p className="text-xs text-slate-400 mt-1">
            Discover latest releases, filter by format & language, and lock your cinema seats
          </p>
        </div>

        {/* Now Showing vs Coming Soon Tabs */}
        <div className="flex items-center p-1 bg-cinema-900 border border-slate-800 rounded-2xl self-start md:self-auto">
          <button
            onClick={() => handleTabChange('now-showing')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'now-showing'
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Now Showing
          </button>
          <button
            onClick={() => handleTabChange('coming-soon')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'coming-soon'
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Coming Soon
          </button>
        </div>
      </div>

      {/* Controls Bar (Search, Mobile Filter Trigger, Sorting) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <SearchBar value={searchQuery} onChange={handleSearchChange} />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cinema-900 border border-slate-800 text-xs font-bold text-slate-200"
          >
            <SlidersHorizontal className="w-4 h-4 text-brand-500" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 bg-cinema-900 border border-slate-800 rounded-xl px-3 py-2 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-400 hidden md:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="bg-transparent text-white font-semibold outline-none cursor-pointer"
            >
              <option value="popular" className="bg-cinema-900">Popularity</option>
              <option value="rating" className="bg-cinema-900">Highest Rated</option>
              <option value="latest" className="bg-cinema-900">Release Date</option>
              <option value="a-z" className="bg-cinema-900">A to Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid with Sidebar Filter Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Panel */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-28">
            <FilterPanel
              filters={{
                genre: selectedGenre,
                language: selectedLanguage,
                format: selectedFormat,
                minRating,
              }}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        {isMobileFilterOpen && (
          <div className="lg:hidden fixed inset-0 z-50 p-4 bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="max-w-md w-full max-h-[85vh] overflow-y-auto">
              <FilterPanel
                filters={{
                  genre: selectedGenre,
                  language: selectedLanguage,
                  format: selectedFormat,
                  minRating,
                }}
                onFilterChange={(f) => {
                  handleFilterChange(f);
                  setIsMobileFilterOpen(false);
                }}
                onReset={() => {
                  handleResetFilters();
                  setIsMobileFilterOpen(false);
                }}
              />
            </div>
          </div>
        )}

        {/* Movies Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <LoadingSpinner text="Searching movies..." />
          ) : (
            <MovieGrid
              movies={movies}
              onWatchTrailer={(url, title) => setTrailerState({ isOpen: true, url, title })}
            />
          )}
        </div>
      </div>

      {/* Trailer Lightbox */}
      <TrailerModal
        isOpen={trailerState.isOpen}
        onClose={() => setTrailerState({ isOpen: false, url: '', title: '' })}
        trailerUrl={trailerState.url}
        title={trailerState.title}
      />
    </div>
  );
};

export default Movies;
