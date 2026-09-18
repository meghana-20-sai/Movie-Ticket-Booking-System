import { Theatre } from '../models/Theatre.js';
import { Screen } from '../models/Screen.js';

// @desc    Get all theatres (filtered by city/search/status)
// @route   GET /api/theatres
export const getTheatres = async (req, res) => {
  try {
    const { city, search, activeOnly } = req.query;
    const query = {};

    if (city && city !== 'all') {
      query.city = new RegExp(`^${city.trim()}$`, 'i');
    }

    if (activeOnly === 'true' || activeOnly === undefined) {
      query.isActive = true;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { address: searchRegex }, { city: searchRegex }];
    }

    const theatres = await Theatre.find(query).sort({ name: 1 });
    
    // Attach screens summary for each theatre
    const theatreIds = theatres.map((t) => t._id);
    const screens = await Screen.find({ theatreId: { $in: theatreIds }, isActive: true });

    const theatresWithScreens = theatres.map((theatre) => {
      const theatreScreens = screens.filter((s) => s.theatreId.toString() === theatre._id.toString());
      const formats = [...new Set(theatreScreens.map((s) => s.format))];
      return {
        ...theatre.toObject(),
        screenCount: theatreScreens.length,
        formats: formats.length > 0 ? formats : ['2D', '3D'],
      };
    });

    res.json({
      success: true,
      data: theatresWithScreens,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get distinct cities with active theatres count
// @route   GET /api/theatres/cities
export const getCities = async (req, res) => {
  try {
    const citiesAggregation = await Theatre.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$city',
          theatreCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const cities = citiesAggregation.map((c) => ({
      name: c._id,
      theatreCount: c.theatreCount,
    }));

    res.json({
      success: true,
      data: cities,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single theatre by ID with screens
// @route   GET /api/theatres/:id
export const getTheatreById = async (req, res) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) {
      return res.status(404).json({ success: false, message: 'Theatre not found' });
    }

    const screens = await Screen.find({ theatreId: theatre._id });

    res.json({
      success: true,
      data: {
        ...theatre.toObject(),
        screens,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new theatre (Admin)
// @route   POST /api/theatres
export const createTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Theatre created successfully',
      data: theatre,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update theatre (Admin)
// @route   PUT /api/theatres/:id
export const updateTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!theatre) {
      return res.status(404).json({ success: false, message: 'Theatre not found' });
    }
    res.json({
      success: true,
      message: 'Theatre updated successfully',
      data: theatre,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete theatre (Admin)
// @route   DELETE /api/theatres/:id
export const deleteTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.findByIdAndDelete(req.params.id);
    if (!theatre) {
      return res.status(404).json({ success: false, message: 'Theatre not found' });
    }
    // Also delete screens associated
    await Screen.deleteMany({ theatreId: req.params.id });
    res.json({ success: true, message: 'Theatre and its screens deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
