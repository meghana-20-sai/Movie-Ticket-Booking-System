import React from 'react';
import MovieCard from './MovieCard';
import EmptyState from './EmptyState';

const MovieGrid = ({ movies = [], onWatchTrailer }) => {
  if (!movies || movies.length === 0) {
    return (
      <EmptyState
        title="No movies found"
        description="Try adjusting your filters, location, or search query."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
      {movies.map((movie) => (
        <MovieCard key={movie._id} movie={movie} onWatchTrailer={onWatchTrailer} />
      ))}
    </div>
  );
};

export default MovieGrid;
