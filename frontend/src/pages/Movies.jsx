import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Film, SlidersHorizontal, ArrowUpDown, ChevronDown, Loader2, Search as SearchIcon } from 'lucide-react';
import { movieService } from '../services/movieService';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import MovieGrid from '../components/MovieGrid';
import TrailerModal from '../components/TrailerModal';
import LoadingSpinner from '../components/LoadingSpinner';

const TABS = [
  { key: '', label: 'All Movies' },
  { key: 'now-showing', label: '🔥 Now Showing' },
  { key: 'imdb', label: '⭐ IMDb Top-Rated' },
  { key: 'new-releases', label: '🆕 New Releases' },
  { key: 'coming-soon', label: '📅 Upcoming' },
  { key: 'popular', label: '⭐ Popular' },
  { key: 'trending', label: '📈 Trending' },
];

const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [trailerState, setTrailerState] = useState({ isOpen: false, url: '', title: '' });

  // Pagination
  const [page, setPage] = useState(1);
  const [totalMovies, setTotalMovies] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Debounced search
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const debounceTimer = useRef(null);

  // Read URL params or set defaults
  const activeTab = searchParams.get('status') || '';
  const searchQuery = searchParams.get('search') || '';
  const selectedGenre = searchParams.get('genre') || '';
  const selectedLanguage = searchParams.get('language') || '';
  const selectedIndustry = searchParams.get('industry') || '';
  const selectedFormat = searchParams.get('format') || '';
  const minRating = searchParams.get('minRating') || '';
  const sortBy = searchParams.get('sort') || 'popular';

  // Fetch movies with pagination
  const fetchMovies = useCallback(
    async (pageNum = 1, append = false) => {
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }

        const params = {
          search: searchQuery,
          genre: selectedGenre,
          language: selectedLanguage,
          industry: selectedIndustry,
          format: selectedFormat,
          minRating,
          sort: sortBy,
          page: pageNum,
          limit: 20,
        };

        let res;
        // Route to specific endpoint or use general with status
        if (activeTab === 'new-releases') {
          res = await movieService.getNewReleases(params);
        } else if (activeTab === 'imdb') {
          res = await movieService.getTopIMDb(params);
        } else if (activeTab === 'popular') {
          res = await movieService.getPopular(params);
        } else if (activeTab === 'trending') {
          res = await movieService.getTrending(params);
        } else {
          if (activeTab) params.status = activeTab;
          res = await movieService.getMovies(params);
        }

        if (res.success) {
          if (append) {
            setMovies((prev) => [...prev, ...res.data]);
          } else {
            setMovies(res.data);
          }
          setTotalMovies(res.meta?.total || res.data.length);
          setTotalPages(res.meta?.totalPages || 1);
          setPage(pageNum);
        }
      } catch (error) {
        console.error('Failed to fetch movies:', error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [activeTab, searchQuery, selectedGenre, selectedLanguage, selectedIndustry, selectedFormat, minRating, sortBy]
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    fetchMovies(1, false);
  }, [fetchMovies]);

  // Debounced search input
  const handleSearchInput = (value) => {
    setSearchInput(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      if (value) {
        newParams.set('search', value);
      } else {
        newParams.delete('search');
      }
      setSearchParams(newParams);
    }, 300);
  };

  const handleTabChange = (status) => {
    const newParams = new URLSearchParams(searchParams);
    if (status) {
      newParams.set('status', status);
    } else {
      newParams.delete('status');
    }
    newParams.delete('search');
    setSearchInput('');
    setSearchParams(newParams);
  };

  const handleSearchChange = (query) => {
    handleSearchInput(query);
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
    if (activeTab) newParams.set('status', activeTab);
    setSearchInput('');
    setSearchParams(newParams);
  };

  const handleSortChange = (e) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', e.target.value);
    setSearchParams(newParams);
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      fetchMovies(page + 1, true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Status Tabs */}
      <div className="flex flex-col gap-4 pb-6 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Explore Movies</h1>
            <p className="text-xs text-slate-400 mt-1">
              {totalMovies > 0 ? `${totalMovies} movies found` : 'Discover latest releases, filter by format & language, and lock your cinema seats'}
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 p-1 bg-cinema-900 border border-slate-800 rounded-2xl overflow-x-auto scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Controls Bar (Search, Mobile Filter Trigger, Sorting) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <SearchBar value={searchInput} onChange={handleSearchChange} />
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
              <option value="imdb" className="bg-cinema-900">⭐ IMDb Rating (Highest)</option>
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
                industry: selectedIndustry,
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
                  industry: selectedIndustry,
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
            <>
              <MovieGrid
                movies={movies}
                onWatchTrailer={(url, title) => setTrailerState({ isOpen: true, url, title })}
              />

              {/* Load More */}
              {page < totalPages && (
                <div className="flex justify-center pt-8">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-cinema-900 border border-slate-800 hover:border-brand-500/50 text-slate-300 hover:text-white text-sm font-bold transition-all disabled:opacity-50"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading more...</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        <span>
                          Load More ({movies.length} of {totalMovies})
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* No Results */}
              {!loading && movies.length === 0 && (
                <div className="text-center py-20 space-y-4">
                  <Film className="w-12 h-12 text-slate-700 mx-auto" />
                  <h3 className="text-lg font-bold text-slate-400">No movies found</h3>
                  <p className="text-xs text-slate-500">
                    Try adjusting your filters or search query
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 rounded-xl bg-brand-600/20 border border-brand-500/40 text-brand-400 text-xs font-bold hover:bg-brand-600 hover:text-white transition-all"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </>
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
