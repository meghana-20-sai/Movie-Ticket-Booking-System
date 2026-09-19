import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { connectDB } from './config/database.js';
import { seatLockService } from './services/seatLockService.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import theatreRoutes from './routes/theatreRoutes.js';
import screenRoutes from './routes/screenRoutes.js';
import showRoutes from './routes/showRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import commandRoutes from './routes/commandRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Attach io to seat lock service
seatLockService.setIO(io);

// Socket.IO Connection & Room Handlers
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Client joins a specific show room to receive real-time seat lock updates
  socket.on('join:show', ({ showId }) => {
    if (showId) {
      const room = `show:${showId}`;
      socket.join(room);
      console.log(`[Socket.IO] ${socket.id} joined room ${room}`);

      // Immediately send active locked seats in this room to the joining client
      const activeLocks = seatLockService.getLockedSeats(showId);
      socket.emit('seat:initial_locks', {
        showId,
        locks: activeLocks,
      });
    }
  });

  socket.on('leave:show', ({ showId }) => {
    if (showId) {
      const room = `show:${showId}`;
      socket.leave(room);
      console.log(`[Socket.IO] ${socket.id} left room ${room}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate limiter for API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 1000, // generous max requests per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'SmartCine API',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/theatres', theatreRoutes);
app.use('/api/screens', screenRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/commands', commandRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

import { Movie } from './models/Movie.js';
import { seedDatabase } from './seed/seedData.js';

// Start Server & Connect Database
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is empty on boot
    const movieCount = await Movie.countDocuments();
    if (movieCount === 0) {
      console.log('[Server] Database is empty. Running initial seeding...');
      await seedDatabase(false);
    }

    server.listen(PORT, () => {
      console.log(`🚀 SmartCine Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();
