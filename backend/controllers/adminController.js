import { Booking } from '../models/Booking.js';
import { User } from '../models/User.js';
import { Movie } from '../models/Movie.js';
import { Theatre } from '../models/Theatre.js';
import { Show } from '../models/Show.js';

// @desc    Get top level Admin Dashboard statistics
// @route   GET /api/admin/dashboard
export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeMovies,
      activeTheatres,
      totalBookings,
      revenueResult,
      todayBookingsResult,
      recentBookings,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Movie.countDocuments({ status: { $in: ['now-showing', 'coming-soon'] } }),
      Theatre.countDocuments({ isActive: true }),
      Booking.countDocuments({ bookingStatus: 'confirmed' }),
      Booking.aggregate([
        { $match: { bookingStatus: 'confirmed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
      ]),
      Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: today },
            bookingStatus: 'confirmed',
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            todayRevenue: { $sum: '$totalAmount' },
          },
        },
      ]),
      Booking.find()
        .populate('userId', 'name email')
        .populate('movieId', 'title poster')
        .populate('theatreId', 'name city')
        .sort({ createdAt: -1 })
        .limit(6),
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    const todayBookings = todayBookingsResult[0]?.count || 0;
    const todayRevenue = todayBookingsResult[0]?.todayRevenue || 0;

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalBookings,
        totalUsers,
        activeMovies,
        activeTheatres,
        todayBookings,
        todayRevenue,
        recentBookings,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get detailed analytics for charts (Recharts)
// @route   GET /api/admin/analytics
export const getAnalytics = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days, 10));
    startDate.setHours(0, 0, 0, 0);

    // 1. Revenue & Bookings Over Time
    const revenueOverTime = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          bookingStatus: 'confirmed',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 },
          ticketsSold: { $sum: { $size: '$seats' } },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          revenue: 1,
          bookings: 1,
          ticketsSold: 1,
          _id: 0,
        },
      },
    ]);

    // 2. Top Performing Movies
    const topMovies = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed' } },
      {
        $group: {
          _id: '$movieId',
          bookingCount: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
          tickets: { $sum: { $size: '$seats' } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: 'movies',
          localField: '_id',
          foreignField: '_id',
          as: 'movieDetails',
        },
      },
      { $unwind: '$movieDetails' },
      {
        $project: {
          movieId: '$_id',
          title: '$movieDetails.title',
          poster: '$movieDetails.poster',
          bookingCount: 1,
          revenue: 1,
          tickets: 1,
          _id: 0,
        },
      },
    ]);

    // 3. Theatre Performance
    const theatrePerformance = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed' } },
      {
        $group: {
          _id: '$theatreId',
          revenue: { $sum: '$totalAmount' },
          bookings: { $sum: 1 },
          tickets: { $sum: { $size: '$seats' } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: 'theatres',
          localField: '_id',
          foreignField: '_id',
          as: 'theatreDetails',
        },
      },
      { $unwind: '$theatreDetails' },
      {
        $project: {
          theatreId: '$_id',
          name: '$theatreDetails.name',
          city: '$theatreDetails.city',
          revenue: 1,
          bookings: 1,
          tickets: 1,
          _id: 0,
        },
      },
    ]);

    // 4. Overall Seat Occupancy Rate
    const allShows = await Show.find({ status: { $ne: 'cancelled' } }).populate('screenId', 'capacity');
    let totalCap = 0;
    let totalBooked = 0;
    for (const s of allShows) {
      const cap = s.screenId?.capacity || 80;
      totalCap += cap;
      totalBooked += (s.bookedSeats || []).length;
    }
    const overallOccupancy = totalCap > 0 ? Math.round((totalBooked / totalCap) * 100) : 0;

    res.json({
      success: true,
      data: {
        revenueOverTime,
        topMovies,
        theatrePerformance,
        occupancy: {
          overallOccupancy,
          totalCapacity: totalCap,
          totalBookedSeats: totalBooked,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get users list for admin
// @route   GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Attach total bookings count for each user
    const userIds = users.map((u) => u._id);
    const bookingCounts = await Booking.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 }, totalSpent: { $sum: '$totalAmount' } } },
    ]);

    const countMap = new Map();
    bookingCounts.forEach((b) => countMap.set(b._id.toString(), b));

    const enrichedUsers = users.map((u) => {
      const stats = countMap.get(u._id.toString()) || { count: 0, totalSpent: 0 };
      return {
        ...u.toObject(),
        totalBookings: stats.count,
        totalSpent: stats.totalSpent,
      };
    });

    res.json({
      success: true,
      data: enrichedUsers,
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

// @desc    Toggle user status (Active/Deactivated)
// @route   PUT /api/admin/users/:id/status
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User account ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { _id: user._id, isActive: user.isActive },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
