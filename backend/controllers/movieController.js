import { Movie } from '../models/Movie.js';

// @desc    Get all movies with filters, search, sort
// @route   GET /api/movies
export const getMovies = async (req, res) => {
  try {
    const { status, genre, language, format, minRating, search, sort, limit = 20, page = 1 } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (genre) {
      const genres = genre.split(',').map((g) => g.trim());
      query.genre = { $in: genres.map((g) => new RegExp(g, 'i')) };
    }

    if (language) {
      const languages = language.split(',').map((l) => l.trim());
      query.language = { $in: languages.map((l) => new RegExp(l, 'i')) };
    }

    if (format) {
      const formats = format.split(',').map((f) => f.trim());
      query.formats = { $in: formats };
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { director: searchRegex },
        { cast: { $in: [searchRegex] } },
        { genre: { $in: [searchRegex] } },
        { description: searchRegex },
      ];
    }

    let sortOption = { releaseDate: -1 };
    if (sort === 'popular' || sort === 'popularity') {
      sortOption = { ratingCount: -1, rating: -1 };
    } else if (sort === 'rating') {
      sortOption = { rating: -1 };
    } else if (sort === 'releaseDate' || sort === 'latest') {
      sortOption = { releaseDate: -1 };
    } else if (sort === 'a-z') {
      sortOption = { title: 1 };
    } else if (sort === 'z-a') {
      sortOption = { title: -1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: movies,
      meta: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single movie by ID
// @route   GET /api/movies/:id
export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.json({ success: true, data: movie });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new movie (Admin)
// @route   POST /api/movies
export const createMovie = async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Movie added successfully',
      data: movie,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update movie (Admin)
// @route   PUT /api/movies/:id
export const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.json({
      success: true,
      message: 'Movie updated successfully',
      data: movie,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete movie (Admin)
// @route   DELETE /api/movies/:id
export const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.json({ success: true, message: 'Movie deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
