import { Booking } from '../../models/Booking.js';
import { Show } from '../../models/Show.js';
import { Movie } from '../../models/Movie.js';
import { Theatre } from '../../models/Theatre.js';

export const adminCommandService = {
  async handleAdminQuery(entities = {}, user = null) {
    if (!user || user.role !== 'admin') {
      return {
        type: 'FORBIDDEN',
        message: '🔒 Access Denied: Admin authorization is required to run management analytics commands.',
      };
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Aggregate key metrics
    const [todayBookings, totalBookings, totalRevenueAgg, activeShows, topMovies] = await Promise.all([
      Booking.find({ createdAt: { $gte: todayStart } }),
      Booking.find(),
      Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      ]),
      Show.countDocuments({ status: 'active', startTime: { $gte: new Date() } }),
      Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'completed'] } } },
        { $lookup: { from: 'shows', localField: 'show', foreignField: '_id', as: 'showDetails' } },
        { $unwind: '$showDetails' },
        { $lookup: { from: 'movies', localField: 'showDetails.movie', foreignField: '_id', as: 'movieDetails' } },
        { $unwind: '$movieDetails' },
        {
          $group: {
            _id: '$movieDetails.title',
            revenue: { $sum: '$totalAmount' },
            ticketsSold: { $sum: { $size: '$seats' } },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 3 },
      ]),
    ]);

    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const totalTickets = totalBookings.reduce((sum, b) => sum + (b.seats?.length || 0), 0);
    const todayTickets = todayBookings.reduce((sum, b) => sum + (b.seats?.length || 0), 0);
    const todayRevenue = todayBookings
      .filter((b) => b.status === 'confirmed')
      .reduce((sum, b) => sum + b.totalAmount, 0);
    const cancelledCount = totalBookings.filter((b) => b.status === 'cancelled').length;
    const cancellationRate = totalBookings.length > 0 ? ((cancelledCount / totalBookings.length) * 100).toFixed(1) : 0;

    return {
      type: 'ADMIN_ANALYTICS_REPORT',
      message: `📊 SmartCine Admin Business Intelligence Report:`,
      metrics: {
        todayRevenue: `₹${todayRevenue.toLocaleString('en-IN')}`,
        todayTickets,
        totalRevenue: `₹${totalRevenue.toLocaleString('en-IN')}`,
        totalTickets,
        activeShows,
        cancellationRate: `${cancellationRate}%`,
      },
      topGrossing: topMovies.map((m) => ({
        title: m._id,
        revenue: `₹${m.revenue.toLocaleString('en-IN')}`,
        tickets: m.ticketsSold,
      })),
      timestamp: new Date().toISOString(),
    };
  },
};
