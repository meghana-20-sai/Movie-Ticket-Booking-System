import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import { connectDB } from '../config/database.js';
import { User } from '../models/User.js';
import { Movie } from '../models/Movie.js';
import { Theatre } from '../models/Theatre.js';
import { Screen } from '../models/Screen.js';
import { Seat } from '../models/Seat.js';
import { Show } from '../models/Show.js';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { Coupon } from '../models/Coupon.js';
import { Review } from '../models/Review.js';
import { generateBookingReference } from '../utils/generateBookingReference.js';
import { generateQRCode } from '../utils/generateQRCode.js';

dotenv.config();

const seedDatabase = async (isStandalone = true) => {
  try {
    await connectDB();
    console.log('[Seed] Clearing existing database collections...');

    await Promise.all([
      User.deleteMany({}),
      Movie.deleteMany({}),
      Theatre.deleteMany({}),
      Screen.deleteMany({}),
      Seat.deleteMany({}),
      Show.deleteMany({}),
      Booking.deleteMany({}),
      Payment.deleteMany({}),
      Coupon.deleteMany({}),
      Review.deleteMany({}),
    ]);

    console.log('[Seed] Seeding Users...');
    const admin = await User.create({
      name: 'SmartCine Admin',
      email: 'admin@smartcine.com',
      password: 'Admin@12345',
      phone: '+91 9988776655',
      role: 'admin',
      preferredCity: 'Hyderabad',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isActive: true,
    });

    const customer = await User.create({
      name: 'Aarav Sharma',
      email: 'customer@smartcine.com',
      password: 'Customer@12345',
      phone: '+91 9876543210',
      role: 'customer',
      preferredCity: 'Hyderabad',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      isActive: true,
    });

    const customer2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@smartcine.com',
      password: 'Customer@12345',
      phone: '+91 9823456789',
      role: 'customer',
      preferredCity: 'Bengaluru',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      isActive: true,
    });

    console.log('[Seed] Seeding Movies...');
    const moviesData = [
      {
        title: 'Kalki 2898 AD',
        description: 'Set in a post-apocalyptic world in the year 2898 AD, a modern avatar of Vishnu descends to Earth to protect the world from evil forces.',
        poster: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/9l1eZiJHmhr5jA67VP5q7W9SQRI.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=kQDd1AhGIHk',
        genre: ['Sci-Fi', 'Action', 'Fantasy'],
        language: ['Telugu', 'Hindi', 'Tamil', 'English'],
        duration: 180,
        certification: 'UA',
        releaseDate: new Date('2024-06-27'),
        cast: ['Prabhas', 'Amitabh Bachchan', 'Kamal Haasan', 'Deepika Padukone', 'Disha Patani'],
        director: 'Nag Ashwin',
        rating: 4.8,
        ratingCount: 1420,
        status: 'now-showing',
        formats: ['2D', '3D', 'IMAX'],
      },
      {
        title: 'Dune: Part Two',
        description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
        poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520QIq.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
        genre: ['Sci-Fi', 'Adventure', 'Action'],
        language: ['English', 'Hindi'],
        duration: 166,
        certification: 'UA',
        releaseDate: new Date('2024-03-01'),
        cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem', 'Austin Butler'],
        director: 'Denis Villeneuve',
        rating: 4.9,
        ratingCount: 2310,
        status: 'now-showing',
        formats: ['2D', 'IMAX', '4DX'],
      },
      {
        title: 'Deadpool & Wolverine',
        description: 'A listless Wade Wilson toils away in civilian life until a sudden threat forces him to suit up again alongside an ambivalent Wolverine.',
        poster: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/yDHYTfA3R0jFYba16jBB1jv82E9.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
        genre: ['Action', 'Comedy', 'Sci-Fi'],
        language: ['English', 'Hindi', 'Telugu'],
        duration: 128,
        certification: 'A',
        releaseDate: new Date('2024-07-26'),
        cast: ['Ryan Reynolds', 'Hugh Jackman', 'Emma Corrin', 'Matthew Macfadyen'],
        director: 'Shawn Levy',
        rating: 4.7,
        ratingCount: 1890,
        status: 'now-showing',
        formats: ['2D', '3D', 'IMAX'],
      },
      {
        title: 'Pushpa 2: The Rule',
        description: 'Pushpa Raj expands his red sandalwood empire while clashing with SP Bhanwar Singh Shekhawat in a battle for supremacy.',
        poster: 'https://image.tmdb.org/t/p/w500/b0OnvU5xV5xZ2K2QYgL9uU1dI9c.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/9wSbeLhhQvE8uG020R4R0pLzWw1.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=g3JUbgOIe1Q',
        genre: ['Action', 'Crime', 'Drama'],
        language: ['Telugu', 'Hindi', 'Tamil', 'Malayalam'],
        duration: 200,
        certification: 'UA',
        releaseDate: new Date('2024-12-05'),
        cast: ['Allu Arjun', 'Rashmika Mandanna', 'Fahadh Faasil', 'Jagapathi Babu'],
        director: 'Sukumar',
        rating: 4.9,
        ratingCount: 3450,
        status: 'now-showing',
        formats: ['2D', '3D', 'IMAX'],
      },
      {
        title: 'Oppenheimer',
        description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
        poster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
        genre: ['Biography', 'Drama', 'History'],
        language: ['English', 'Hindi'],
        duration: 180,
        certification: 'A',
        releaseDate: new Date('2023-07-21'),
        cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.', 'Florence Pugh'],
        director: 'Christopher Nolan',
        rating: 4.9,
        ratingCount: 4200,
        status: 'now-showing',
        formats: ['2D', 'IMAX'],
      },
      {
        title: 'Interstellar (10th Anniversary IMAX)',
        description: 'When Earth becomes uninhabitable, a team of explorers undertakes the most important mission in human history: traveling beyond this galaxy.',
        poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
        genre: ['Sci-Fi', 'Adventure', 'Drama'],
        language: ['English'],
        duration: 169,
        certification: 'UA',
        releaseDate: new Date('2024-10-15'),
        cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
        director: 'Christopher Nolan',
        rating: 5.0,
        ratingCount: 5120,
        status: 'now-showing',
        formats: ['IMAX', '2D'],
      },
      {
        title: 'Devara: Part 1',
        description: 'An epic action saga set against the coastal lands where fear and courage collide across generations.',
        poster: 'https://image.tmdb.org/t/p/w500/A7341k5wBwWc5yYk9z6qA5g5s0M.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/tElnmtp6DY1P0TXp84guEjVMBBp.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=Nn_r5bN9V4k',
        genre: ['Action', 'Drama', 'Thriller'],
        language: ['Telugu', 'Hindi', 'Tamil'],
        duration: 178,
        certification: 'UA',
        releaseDate: new Date('2024-09-27'),
        cast: ['N.T. Rama Rao Jr.', 'Janhvi Kapoor', 'Saif Ali Khan', 'Prakash Raj'],
        director: 'Koratala Siva',
        rating: 4.6,
        ratingCount: 1670,
        status: 'now-showing',
        formats: ['2D', '3D', 'IMAX'],
      },
      {
        title: 'Gladiator II',
        description: 'Years after witnessing the death of Maximus, Lucius must enter the Colosseum after his home is conquered by tyrannical emperors.',
        poster: 'https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/euYIwmwkmz95mnXvufEmbL69ovr.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=4rgYUipGJNo',
        genre: ['Action', 'Adventure', 'Drama'],
        language: ['English', 'Hindi'],
        duration: 148,
        certification: 'A',
        releaseDate: new Date('2024-11-15'),
        cast: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington', 'Connie Nielsen'],
        director: 'Ridley Scott',
        rating: 4.7,
        ratingCount: 1120,
        status: 'now-showing',
        formats: ['2D', 'IMAX', '4DX'],
      },
      {
        title: 'Avatar: Fire and Ash',
        description: 'Jake Sully and Neytiri encounter a new, aggressive clan of Na\'vi known as the Ash People who reside around volcanic regions.',
        poster: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/vL5LR6WdxWPjC3754h62c9Tqg.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
        genre: ['Sci-Fi', 'Action', 'Adventure'],
        language: ['English', 'Hindi', 'Telugu'],
        duration: 190,
        certification: 'UA',
        releaseDate: new Date('2025-12-19'),
        cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver', 'Oona Chaplin'],
        director: 'James Cameron',
        rating: 4.9,
        ratingCount: 0,
        status: 'coming-soon',
        formats: ['3D', 'IMAX', '4DX'],
      },
      {
        title: 'Spider-Man: Beyond the Spider-Verse',
        description: 'Miles Morales traverses alternate dimensions to save every universe\'s Spider-People from a catastrophic multiverse collapse.',
        poster: 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
        backdrop: 'https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
        trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
        genre: ['Animation', 'Action', 'Sci-Fi'],
        language: ['English', 'Hindi', 'Telugu', 'Tamil'],
        duration: 140,
        certification: 'U',
        releaseDate: new Date('2026-06-12'),
        cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Daniel Kaluuya'],
        director: 'Joaquim Dos Santos',
        rating: 5.0,
        ratingCount: 0,
        status: 'coming-soon',
        formats: ['2D', '3D', 'IMAX'],
      },
    ];

    const createdMovies = await Movie.insertMany(moviesData);

    console.log('[Seed] Seeding Theatres...');
    const theatresData = [
      {
        name: 'SmartCine PVR IMAX – Inorbit Mall',
        address: 'Level 4, Inorbit Mall, Mindspace, Madhapur',
        city: 'Hyderabad',
        location: { lat: 17.4356, lng: 78.3844 },
        amenities: ['IMAX with Laser', 'Dolby Atmos', 'Recliner Seats', 'Gourmet Food Court', 'Valet Parking'],
        contactInfo: { phone: '+91 40 6789 1100', email: 'inorbit.hyd@smartcine.com' },
        isActive: true,
      },
      {
        name: 'SmartCine AMB Cinemas – Gachibowli',
        address: 'Sarath City Capital Mall, Gachibowli - Miyapur Rd',
        city: 'Hyderabad',
        location: { lat: 17.4589, lng: 78.3582 },
        amenities: ['Dolby Atmos', 'Laser Projection', 'VIP Lounge', 'Gourmet Popcorn', 'Ample Parking'],
        contactInfo: { phone: '+91 40 4455 6677', email: 'amb.hyd@smartcine.com' },
        isActive: true,
      },
      {
        name: 'SmartCine Prasads Multiplex – NTR Gardens',
        address: 'Necklace Road, Khairatabad',
        city: 'Hyderabad',
        location: { lat: 17.4125, lng: 78.4682 },
        amenities: ['Giant Screen', 'Dolby 7.1', 'Gaming Arena', 'Food Court', 'Waterfront View'],
        contactInfo: { phone: '+91 40 2344 8888', email: 'prasads.hyd@smartcine.com' },
        isActive: true,
      },
      {
        name: 'SmartCine Director\'s Cut – Forum Rex Walk',
        address: 'Brigade Road, Shanthala Nagar, Ashok Nagar',
        city: 'Bengaluru',
        location: { lat: 12.9716, lng: 77.5946 },
        amenities: ['Luxury Recliners', 'In-Seat Chef Service', 'Dolby Atmos', 'Premium Wine Bar'],
        contactInfo: { phone: '+91 80 4123 5566', email: 'directorscut.blr@smartcine.com' },
        isActive: true,
      },
      {
        name: 'SmartCine Maison INOX – Jio World Plaza',
        address: 'G Block, Bandra Kurla Complex, Bandra East',
        city: 'Mumbai',
        location: { lat: 19.0668, lng: 72.8687 },
        amenities: ['IMAX Laser', 'Private Screening Rooms', 'Butler Service', 'Dolby Atmos 360'],
        contactInfo: { phone: '+91 22 6677 8899', email: 'maison.mum@smartcine.com' },
        isActive: true,
      },
      {
        name: 'SmartCine Cinepolis – PVP Square',
        address: 'MG Road, Sidhartha Nagar',
        city: 'Vijayawada',
        location: { lat: 16.5062, lng: 80.648 },
        amenities: ['RealD 3D', 'Dolby 7.1', 'Coffee House', 'Food Court'],
        contactInfo: { phone: '+91 866 244 5566', email: 'pvp.vja@smartcine.com' },
        isActive: true,
      },
      {
        name: 'SmartCine Jagadamba Prime',
        address: 'Jagadamba Junction, Suryabagh',
        city: 'Visakhapatnam',
        location: { lat: 17.7126, lng: 83.3005 },
        amenities: ['Dolby Atmos', '70mm Large Screen', 'Curved Display', 'Cafeteria'],
        contactInfo: { phone: '+91 891 256 7890', email: 'jagadamba.vizag@smartcine.com' },
        isActive: true,
      },
    ];

    const createdTheatres = await Theatre.insertMany(theatresData);

    console.log('[Seed] Seeding Screens and Seat Maps...');
    const defaultSeatLayout = {
      rows: [
        { rowLabel: 'A', category: 'Premium', seatsCount: 10, priceMultiplier: 1.5 },
        { rowLabel: 'B', category: 'Premium', seatsCount: 10, priceMultiplier: 1.5 },
        { rowLabel: 'C', category: 'Executive', seatsCount: 10, priceMultiplier: 1.25 },
        { rowLabel: 'D', category: 'Executive', seatsCount: 10, priceMultiplier: 1.25 },
        { rowLabel: 'E', category: 'Regular', seatsCount: 10, priceMultiplier: 1.0 },
        { rowLabel: 'F', category: 'Regular', seatsCount: 10, priceMultiplier: 1.0 },
        { rowLabel: 'G', category: 'Regular', seatsCount: 10, priceMultiplier: 1.0 },
        { rowLabel: 'H', category: 'Regular', seatsCount: 10, priceMultiplier: 1.0 },
      ],
    };

    const imaxSeatLayout = {
      rows: [
        { rowLabel: 'A', category: 'Premium', seatsCount: 12, priceMultiplier: 1.6 },
        { rowLabel: 'B', category: 'Premium', seatsCount: 12, priceMultiplier: 1.6 },
        { rowLabel: 'C', category: 'Executive', seatsCount: 12, priceMultiplier: 1.3 },
        { rowLabel: 'D', category: 'Executive', seatsCount: 12, priceMultiplier: 1.3 },
        { rowLabel: 'E', category: 'Regular', seatsCount: 12, priceMultiplier: 1.0 },
        { rowLabel: 'F', category: 'Regular', seatsCount: 12, priceMultiplier: 1.0 },
      ],
    };

    const createdScreens = [];
    const seatsToInsert = [];

    for (const theatre of createdTheatres) {
      // Screen 1: IMAX / Atmos
      const screen1 = await Screen.create({
        theatreId: theatre._id,
        name: 'Screen 1 (IMAX Laser)',
        format: 'IMAX',
        capacity: 72,
        soundSystem: 'IMAX 12-Channel Immersive Sound',
        seatLayout: imaxSeatLayout,
      });
      createdScreens.push(screen1);

      for (const rowConfig of imaxSeatLayout.rows) {
        for (let num = 1; num <= rowConfig.seatsCount; num++) {
          seatsToInsert.push({
            screenId: screen1._id,
            row: rowConfig.rowLabel,
            number: num,
            category: rowConfig.category,
            priceMultiplier: rowConfig.priceMultiplier,
            isActive: true,
          });
        }
      }

      // Screen 2: 3D Dolby Atmos
      const screen2 = await Screen.create({
        theatreId: theatre._id,
        name: 'Screen 2 (Dolby Atmos)',
        format: '3D',
        capacity: 80,
        soundSystem: 'Dolby Atmos 7.1 Surround',
        seatLayout: defaultSeatLayout,
      });
      createdScreens.push(screen2);

      for (const rowConfig of defaultSeatLayout.rows) {
        for (let num = 1; num <= rowConfig.seatsCount; num++) {
          seatsToInsert.push({
            screenId: screen2._id,
            row: rowConfig.rowLabel,
            number: num,
            category: rowConfig.category,
            priceMultiplier: rowConfig.priceMultiplier,
            isActive: true,
          });
        }
      }

      // Screen 3: Standard 2D
      const screen3 = await Screen.create({
        theatreId: theatre._id,
        name: 'Screen 3 (Standard 2D)',
        format: '2D',
        capacity: 80,
        soundSystem: 'Dolby Digital 5.1',
        seatLayout: defaultSeatLayout,
      });
      createdScreens.push(screen3);

      for (const rowConfig of defaultSeatLayout.rows) {
        for (let num = 1; num <= rowConfig.seatsCount; num++) {
          seatsToInsert.push({
            screenId: screen3._id,
            row: rowConfig.rowLabel,
            number: num,
            category: rowConfig.category,
            priceMultiplier: rowConfig.priceMultiplier,
            isActive: true,
          });
        }
      }
    }

    await Seat.insertMany(seatsToInsert);
    console.log(`[Seed] Seeded ${createdScreens.length} screens and ${seatsToInsert.length} configured seats.`);

    console.log('[Seed] Seeding Shows for the upcoming 7 days...');
    // Generate dates for next 7 days
    const upcomingDates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      upcomingDates.push(d.toISOString().split('T')[0]);
    }

    const showtimes = [
      { start: '10:30', end: '13:30' },
      { start: '14:15', end: '17:15' },
      { start: '18:00', end: '21:00' },
      { start: '21:45', end: '00:45' },
    ];

    const showsToInsert = [];
    const nowShowingMovies = createdMovies.filter((m) => m.status === 'now-showing');

    for (const theatre of createdTheatres) {
      const theatreScreens = createdScreens.filter((s) => s.theatreId.toString() === theatre._id.toString());

      for (const dateStr of upcomingDates) {
        for (let screenIdx = 0; screenIdx < theatreScreens.length; screenIdx++) {
          const screen = theatreScreens[screenIdx];
          const movie = nowShowingMovies[(theatreScreens.indexOf(screen) + upcomingDates.indexOf(dateStr)) % nowShowingMovies.length];

          for (let timeIdx = 0; timeIdx < showtimes.length; timeIdx++) {
            const timeSlot = showtimes[timeIdx];
            const basePrice = screen.format === 'IMAX' ? 350 : screen.format === '3D' ? 250 : 200;

            // Generate some realistic pre-booked seats for variety
            const prebooked = [];
            if (timeIdx === 2 || timeIdx === 3) {
              prebooked.push('A-3', 'A-4', 'B-5', 'B-6', 'C-7', 'C-8', 'D-4', 'D-5');
            }

            showsToInsert.push({
              movieId: movie._id,
              theatreId: theatre._id,
              screenId: screen._id,
              date: dateStr,
              startTime: timeSlot.start,
              endTime: timeSlot.end,
              language: movie.language[0] || 'English',
              format: screen.format,
              basePrice,
              status: 'scheduled',
              bookedSeats: prebooked,
            });
          }
        }
      }
    }

    const createdShows = await Show.insertMany(showsToInsert);
    console.log(`[Seed] Seeded ${createdShows.length} showtimes.`);

    console.log('[Seed] Seeding Coupons...');
    const couponsData = [
      {
        code: 'SMARTCINE10',
        description: 'Get 10% instant discount up to ₹100 on all bookings',
        discountType: 'percentage',
        discountValue: 10,
        minimumAmount: 300,
        maximumDiscount: 100,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        usageLimit: 5000,
        usedCount: 42,
        isActive: true,
      },
      {
        code: 'BLOCKBUSTER50',
        description: 'Flat ₹50 OFF on any movie booking of ₹400 or more',
        discountType: 'fixed',
        discountValue: 50,
        minimumAmount: 400,
        maximumDiscount: 50,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        usageLimit: 2000,
        usedCount: 88,
        isActive: true,
      },
      {
        code: 'IMAXPASS',
        description: 'Get 20% discount up to ₹150 on premium IMAX experiences',
        discountType: 'percentage',
        discountValue: 20,
        minimumAmount: 500,
        maximumDiscount: 150,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 1000,
        usedCount: 29,
        isActive: true,
      },
      {
        code: 'WELCOME100',
        description: 'Exclusive ₹100 instant discount on your first SmartCine ticket',
        discountType: 'fixed',
        discountValue: 100,
        minimumAmount: 500,
        maximumDiscount: 100,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        usageLimit: 10000,
        usedCount: 156,
        isActive: true,
      },
    ];

    await Coupon.insertMany(couponsData);

    console.log('[Seed] Seeding Sample Bookings & Payments for Analytics...');
    const firstShow = createdShows[0];
    const secondShow = createdShows[1];

    const ref1 = generateBookingReference();
    const qr1 = await generateQRCode({
      bookingReference: ref1,
      movie: 'Kalki 2898 AD',
      seats: ['A-1', 'A-2'],
      theatre: 'SmartCine PVR IMAX – Inorbit Mall',
    });

    const booking1 = await Booking.create({
      userId: customer._id,
      showId: firstShow._id,
      movieId: firstShow.movieId,
      theatreId: firstShow.theatreId,
      screenId: firstShow.screenId,
      seats: [
        { seatId: 'A-1', row: 'A', number: 1, category: 'Premium', price: 525 },
        { seatId: 'A-2', row: 'A', number: 2, category: 'Premium', price: 525 },
      ],
      subtotal: 1050,
      convenienceFee: 40,
      tax: 55,
      discount: 100,
      couponCode: 'SMARTCINE10',
      totalAmount: 1045,
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
      bookingReference: ref1,
      qrCode: qr1,
    });

    await Payment.create({
      bookingId: booking1._id,
      userId: customer._id,
      provider: 'SmartCinePay',
      providerOrderId: `order_${ref1}`,
      providerPaymentId: `pay_${ref1}`,
      amount: 1045,
      paymentMethod: 'UPI',
      status: 'captured',
    });

    const ref2 = generateBookingReference();
    const qr2 = await generateQRCode({
      bookingReference: ref2,
      movie: 'Dune: Part Two',
      seats: ['C-1', 'C-2', 'C-3'],
      theatre: 'SmartCine AMB Cinemas – Gachibowli',
    });

    const booking2 = await Booking.create({
      userId: customer2._id,
      showId: secondShow._id,
      movieId: secondShow.movieId,
      theatreId: secondShow.theatreId,
      screenId: secondShow.screenId,
      seats: [
        { seatId: 'C-1', row: 'C', number: 1, category: 'Executive', price: 312 },
        { seatId: 'C-2', row: 'C', number: 2, category: 'Executive', price: 312 },
        { seatId: 'C-3', row: 'C', number: 3, category: 'Executive', price: 312 },
      ],
      subtotal: 936,
      convenienceFee: 40,
      tax: 49,
      discount: 50,
      couponCode: 'BLOCKBUSTER50',
      totalAmount: 975,
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
      bookingReference: ref2,
      qrCode: qr2,
    });

    await Payment.create({
      bookingId: booking2._id,
      userId: customer2._id,
      provider: 'SmartCinePay',
      providerOrderId: `order_${ref2}`,
      providerPaymentId: `pay_${ref2}`,
      amount: 975,
      paymentMethod: 'CARD',
      status: 'captured',
    });

    console.log('[Seed] Seeding Reviews...');
    await Review.create([
      {
        userId: customer._id,
        movieId: createdMovies[0]._id,
        bookingId: booking1._id,
        rating: 5,
        comment: 'Mind-blowing visuals and cinematic world-building! Prabhas and Amitabh Bachchan gave legendary performances.',
        status: 'approved',
        likes: 24,
      },
      {
        userId: customer2._id,
        movieId: createdMovies[1]._id,
        bookingId: booking2._id,
        rating: 5,
        comment: 'An absolute masterpiece of modern science fiction cinema. The IMAX sound and sandstorm scenes gave me goosebumps!',
        status: 'approved',
        likes: 41,
      },
      {
        userId: customer._id,
        movieId: createdMovies[2]._id,
        rating: 5,
        comment: 'Hilarious, action-packed, and full of incredible surprises! Ryan and Hugh have unmatched chemistry.',
        status: 'approved',
        likes: 19,
      },
    ]);

    console.log('✅ [Seed] SmartCine Database successfully initialized and seeded with rich demo data!');
    console.log('------------------------------------------------------------');
    console.log('Admin Demo:    admin@smartcine.com    | Password: Admin@12345');
    console.log('Customer Demo: customer@smartcine.com | Password: Customer@12345');
    console.log('------------------------------------------------------------');
    if (isStandalone) {
      process.exit(0);
    }
    return true;
  } catch (error) {
    console.error('❌ [Seed] Error seeding database:', error);
    if (isStandalone) {
      process.exit(1);
    }
    throw error;
  }
};

export { seedDatabase };

if (process.argv[1]?.endsWith('seedData.js')) {
  seedDatabase(true);
}
