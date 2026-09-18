import { Screen } from '../models/Screen.js';
import { Seat } from '../models/Seat.js';
import { Theatre } from '../models/Theatre.js';

// @desc    Get all screens (optionally by theatre)
// @route   GET /api/screens
export const getScreens = async (req, res) => {
  try {
    const { theatreId } = req.query;
    const query = {};
    if (theatreId) query.theatreId = theatreId;

    const screens = await Screen.find(query).populate('theatreId', 'name city');
    res.json({ success: true, data: screens });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get screen by ID with full layout
// @route   GET /api/screens/:id
export const getScreenById = async (req, res) => {
  try {
    const screen = await Screen.findById(req.params.id).populate('theatreId', 'name city address');
    if (!screen) {
      return res.status(404).json({ success: false, message: 'Screen not found' });
    }
    const seats = await Seat.find({ screenId: screen._id }).sort({ row: 1, number: 1 });
    res.json({
      success: true,
      data: {
        ...screen.toObject(),
        seats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper to generate seat documents based on seatLayout
const syncSeatsFromLayout = async (screenId, layoutRows) => {
  if (!layoutRows || !Array.isArray(layoutRows)) return;
  await Seat.deleteMany({ screenId });

  const seatsToInsert = [];
  for (const rowConfig of layoutRows) {
    const rowLabel = rowConfig.rowLabel || 'A';
    const count = rowConfig.seatsCount || 10;
    const category = rowConfig.category || 'Regular';
    const multiplier = rowConfig.priceMultiplier || 1.0;

    for (let i = 1; i <= count; i++) {
      seatsToInsert.push({
        screenId,
        row: rowLabel,
        number: i,
        category,
        priceMultiplier: multiplier,
        isActive: true,
      });
    }
  }

  if (seatsToInsert.length > 0) {
    await Seat.insertMany(seatsToInsert);
  }
};

// @desc    Create screen (Admin)
// @route   POST /api/screens
export const createScreen = async (req, res) => {
  try {
    const { theatreId, name, format, capacity, soundSystem, seatLayout } = req.body;

    const theatre = await Theatre.findById(theatreId);
    if (!theatre) {
      return res.status(400).json({ success: false, message: 'Invalid theatre ID' });
    }

    // Default seat layout if none provided
    const layout = seatLayout && seatLayout.rows && seatLayout.rows.length > 0 ? seatLayout : {
      rows: [
        { rowLabel: 'A', category: 'Premium', seatsCount: 10, priceMultiplier: 1.5 },
        { rowLabel: 'B', category: 'Premium', seatsCount: 10, priceMultiplier: 1.5 },
        { rowLabel: 'C', category: 'Executive', seatsCount: 10, priceMultiplier: 1.2 },
        { rowLabel: 'D', category: 'Executive', seatsCount: 10, priceMultiplier: 1.2 },
        { rowLabel: 'E', category: 'Regular', seatsCount: 10, priceMultiplier: 1.0 },
        { rowLabel: 'F', category: 'Regular', seatsCount: 10, priceMultiplier: 1.0 },
        { rowLabel: 'G', category: 'Regular', seatsCount: 10, priceMultiplier: 1.0 },
        { rowLabel: 'H', category: 'Regular', seatsCount: 10, priceMultiplier: 1.0 },
      ],
    };

    const calculatedCapacity = layout.rows.reduce((acc, r) => acc + (r.seatsCount || 10), 0);

    const screen = await Screen.create({
      theatreId,
      name,
      format: format || '2D',
      capacity: capacity || calculatedCapacity,
      soundSystem: soundSystem || 'Dolby Atmos 7.1',
      seatLayout: layout,
    });

    await syncSeatsFromLayout(screen._id, layout.rows);

    res.status(201).json({
      success: true,
      message: 'Screen and seat map created successfully',
      data: screen,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update screen and layout (Admin)
// @route   PUT /api/screens/:id
export const updateScreen = async (req, res) => {
  try {
    const { name, format, capacity, soundSystem, seatLayout, isActive } = req.body;

    const screen = await Screen.findById(req.params.id);
    if (!screen) {
      return res.status(404).json({ success: false, message: 'Screen not found' });
    }

    if (name) screen.name = name;
    if (format) screen.format = format;
    if (capacity) screen.capacity = capacity;
    if (soundSystem) screen.soundSystem = soundSystem;
    if (isActive !== undefined) screen.isActive = isActive;

    if (seatLayout && seatLayout.rows) {
      screen.seatLayout = seatLayout;
      screen.capacity = seatLayout.rows.reduce((acc, r) => acc + (r.seatsCount || 10), 0);
      await syncSeatsFromLayout(screen._id, seatLayout.rows);
    }

    const updated = await screen.save();

    res.json({
      success: true,
      message: 'Screen layout updated successfully',
      data: updated,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete screen (Admin)
// @route   DELETE /api/screens/:id
export const deleteScreen = async (req, res) => {
  try {
    const screen = await Screen.findByIdAndDelete(req.params.id);
    if (!screen) {
      return res.status(404).json({ success: false, message: 'Screen not found' });
    }
    await Seat.deleteMany({ screenId: req.params.id });
    res.json({ success: true, message: 'Screen and seat configuration deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
