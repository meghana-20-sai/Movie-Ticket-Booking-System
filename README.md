# SmartCine – Movie Ticket Booking & Management System

> *"Your movie. Your seat. Your experience."*

SmartCine is an enterprise-grade, production-quality full-stack movie ticket booking platform and cinema management ecosystem. It provides customers with an interactive cinema booking journey—from discovering blockbuster releases and selecting cities to real-time seat locking and instant scannable QR/PDF admission tickets. For multiplex operators, SmartCine features a comprehensive administration console for movie schedules, conflict-free screen assignments, dynamic seat pricing multipliers, coupon campaigns, review moderation, and live MongoDB revenue analytics.

---

## 🌟 Key Highlights & Advanced Features

### 🎬 Customer Experience
1. **Cinematic Hero & Discovery**:
   - Dynamic hero showcase highlighting trending premieres, trailer video lightboxes, age certifications, and direct booking CTAs.
   - Now Showing and Coming Soon filtering tabs with debounced search across titles, cast, directors, and genres.
   - Multi-attribute filters: Language, Format (IMAX, 3D, 2D, 4DX), Genre, and Star Ratings.
2. **City & Multiplex Selection**:
   - Dynamic city selector (Hyderabad, Bengaluru, Mumbai, Vijayawada, Visakhapatnam, etc.) with real-time theatre counts.
   - Comprehensive cinema cards showcasing amenities (IMAX with Laser, Dolby Atmos 360°, Recliners, Food Court).
   - Horizontal date navigator and format-grouped showtime pills with availability tags (*Available*, *Filling Fast*, *Almost Full*, *Sold Out*).
3. **Real-Time Interactive Cinema Seat Map**:
   - Realistic curved screen projection view (`SCREEN THIS WAY`).
   - Categorized tiers (*Premium*, *Executive*, *Regular*) with customized pricing multipliers.
   - Keyboard accessible navigation and real-time color indicators (*Available*, *Selected*, *Temporarily Locked*, *Occupied*).
4. **Socket.IO Concurrency & Seat Locking (5-Minute TTL)**:
   - Selecting seats initiates temporary locks with an active 5-minute countdown timer.
   - Real-time broadcasts (`seat:locked`, `seat:released`, `seat:booked`) ensure other customers viewing the same auditorium immediately see locked seats without page reloads.
   - Automated server-side cleanup releases abandoned seats seamlessly.
5. **Secure Payment & Atomic Double-Booking Protection**:
   - Server-side MongoDB atomic conditional updates (`$nin` and `$addToSet`) ensure race-condition immunity.
   - Simulated checkout gateway supporting UPI (GPay, PhonePe, Paytm, BHIM), Credit/Debit Cards, and NetBanking.
   - Promo coupon validation (`SMARTCINE10`, `BLOCKBUSTER50`, `IMAXPASS`, `WELCOME100`).
6. **Digital Admission Pass with QR & PDF Export**:
   - Instant booking confirmation with festive celebration.
   - High-resolution encrypted QR Code containing verified booking references (`SC-XXXX-XXXX`).
   - 1-Click downloadable PDF ticket generated via client-side canvas rendering.
7. **Self-Service Booking Management & Cancellation**:
   - View active and past bookings under `/my-bookings`.
   - Cancellation workflow with configurable 2-hour pre-show rules and automated refund calculations.
8. **Verified Ratings & Audience Reviews**:
   - Star rating (1-5) and written feedback with admin moderation queues.

---

### ⚡ Administrator Suite (`/admin`)
1. **Live MongoDB Analytics Dashboard**:
   - Aggregated metrics: Gross Revenue, Today's Admissions, Registered Customers, Active Theatres, and Premiering Movies.
   - Recharts Visualizations:
     - 14-day Daily Gross Revenue & Booking Trends (Gradient Area Chart)
     - Top Box Office Performers by Ticket Volume (Bar Chart)
     - Multiplex Revenue Share Comparison
     - Live Auditorium Seat Occupancy Meter
2. **Movie Premiere Management**:
   - Full CRUD: Titles, descriptions, high-res posters, backdrops, YouTube trailers, cast, directors, certifications, and formats.
3. **Multiplex & Screen Management**:
   - Theatre configuration across cities with custom amenities.
   - Auditorium screens configuration with audio architecture and capacities.
4. **Interactive Seat Layout & Multiplier Configurator**:
   - Visual row and seat designer (Rows A-Z, custom seat counts, and pricing multipliers).
5. **Showtime Scheduler with Conflict Prevention**:
   - Automated server-side algorithm preventing schedule collisions on the same screen.
6. **Live Booking Registry & User Administration**:
   - Real-time booking search, payment records, and user activation toggles.
7. **Promotions & Review Moderation**:
   - Promo code creator with percentage/fixed discounts and usage limits.
   - Customer review moderation queue (Approve, Reject, Delete).

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Tailwind CSS, Lucide React, Recharts, Axios, React Context API, html2canvas, jsPDF, canvas-confetti, socket.io-client |
| **Backend** | Node.js, Express.js, RESTful Architecture, Socket.IO, JWT Authentication, bcryptjs, Helmet, Morgan, Express Rate Limit |
| **Database** | MongoDB Atlas / Mongoose (with automated in-memory MongoDB fallback for zero-config local runs) |

---

## 📁 Project Architecture & Folder Structure

```
smartcine/
├── backend/
│   ├── config/
│   │   └── database.js               # MongoDB connection & in-memory fallback
│   ├── controllers/
│   │   ├── adminController.js        # Analytics aggregations & user management
│   │   ├── authController.js         # JWT auth, profile, and password reset
│   │   ├── bookingController.js      # Atomic booking transactions & cancellations
│   │   ├── couponController.js       # Promo code validations & CRUD
│   │   ├── movieController.js        # Movie catalog, filters, and search
│   │   ├── paymentController.js      # Payment order creation & verification
│   │   ├── reviewController.js       # Rating calculations & moderation
│   │   ├── screenController.js       # Screen & seat synchronizer
│   │   ├── seatController.js         # Seat maps & live locking endpoints
│   │   ├── showController.js         # Timetable scheduler & conflict engine
│   │   └── theatreController.js      # Multiplexes & city aggregation
│   ├── middleware/
│   │   ├── adminMiddleware.js        # Role-based admin access control
│   │   ├── authMiddleware.js         # JWT verification & user session protect
│   │   ├── errorMiddleware.js        # Centralized 404 & error handlers
│   │   └── validationMiddleware.js   # Input format and registration validators
│   ├── models/
│   │   ├── Booking.js, Coupon.js, Movie.js, Payment.js, Review.js,
│   │   └── Screen.js, Seat.js, Show.js, Theatre.js, User.js
│   ├── routes/                       # Modular Express routers
│   ├── services/
│   │   └── seatLockService.js        # Memory-backed seat lock manager (5 min TTL)
│   ├── utils/
│   │   ├── generateBookingReference.js
│   │   └── generateQRCode.js
│   ├── seed/
│   │   └── seedData.js               # Comprehensive database seeder
│   ├── server.js                     # Express app + Socket.IO server entry
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/               # Reusable UI components
    │   │   ├── Navbar.jsx, Footer.jsx, MovieCard.jsx, MovieGrid.jsx,
    │   │   ├── SearchBar.jsx, FilterPanel.jsx, DateSelector.jsx,
    │   │   ├── TheatreCard.jsx, ShowtimeCard.jsx, SeatMap.jsx,
    │   │   ├── BookingSummary.jsx, PaymentModal.jsx, TicketCard.jsx,
    │   │   ├── CitySelectorModal.jsx, TrailerModal.jsx, ReviewModal.jsx,
    │   │   ├── LoadingSpinner.jsx, EmptyState.jsx, ProtectedRoute.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx       # Auth state, token, user profile, city
    │   │   ├── BookingContext.jsx    # Booking draft state, pricing & timers
    │   │   └── SocketContext.jsx     # Socket.IO connection & room handlers
    │   ├── layouts/
    │   │   ├── UserLayout.jsx        # Customer layout with header & footer
    │   │   └── AdminLayout.jsx       # Dedicated admin sidebar portal
    │   ├── pages/
    │   │   ├── Home.jsx, Movies.jsx, MovieDetails.jsx,
    │   │   ├── SeatSelection.jsx, BookingSuccess.jsx, MyBookings.jsx,
    │   │   ├── BookingDetails.jsx, Profile.jsx, TheatresPage.jsx, OffersPage.jsx,
    │   │   ├── Login.jsx, Register.jsx, ForgotPassword.jsx,
    │   │   └── admin/
    │   │       ├── AdminDashboard.jsx, AdminMovies.jsx, AdminTheatres.jsx,
    │   │       ├── AdminScreens.jsx, AdminSeats.jsx, AdminShows.jsx,
    │   │       ├── AdminBookings.jsx, AdminUsers.jsx, AdminCoupons.jsx,
    │   │       ├── AdminReviews.jsx, AdminAnalytics.jsx
    │   ├── services/
    │   │   ├── api.js, authService.js, movieService.js,
    │   │   ├── bookingService.js, paymentService.js
    │   ├── App.jsx                   # Route tree
    │   ├── main.jsx                  # React DOM mount
    │   └── index.css                 # Tailwind design tokens & dark styling
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn
- MongoDB Atlas connection string (optional; an in-memory MongoDB instance will automatically initialize if no URI is supplied).

---

### 2. Environment Configuration

Copy `.env.example` to `.env` in `backend/`:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string_here
JWT_SECRET=smartcine_super_secret_jwt_key_2026_secure
CLIENT_URL=http://localhost:5173
PAYMENT_KEY_ID=rzp_test_smartcine_public_key
PAYMENT_KEY_SECRET=rzp_test_smartcine_secret_key
```

*(If `MONGODB_URI` is left blank, SmartCine automatically runs in high-performance in-memory database mode for testing!)*

---

### 3. Installation & Database Seeding

#### Step A: Backend
```bash
cd backend
npm install
npm run seed     # Populates movies, theatres, screens, 500+ showtimes, coupons, and demo accounts
npm start        # Starts Express + Socket.IO API on http://localhost:5000
```

#### Step B: Frontend
```bash
cd frontend
npm install
npm run dev      # Starts Vite React development server on http://localhost:5173
```

---

## 🔑 Demo Login Credentials

Quick one-click autofill buttons are built directly into the login screen (`/login`):

| Role | Email | Password | Access |
|---|---|---|---|
| **Administrator** | `admin@smartcine.com` | `Admin@12345` | Complete Admin Suite (`/admin`) + Customer Booking |
| **Customer** | `customer@smartcine.com` | `Customer@12345` | Movie Booking, Seat Locking, Ticket Downloads, Reviews |

---

## 🎟️ Active Demo Promo Codes

Test these promo codes in the booking summary during checkout:
- **`SMARTCINE10`**: 10% instant discount up to ₹100 (Min. booking ₹300)
- **`BLOCKBUSTER50`**: Flat ₹50 discount on bookings of ₹400+
- **`IMAXPASS`**: 20% discount up to ₹150 on premium IMAX experiences
- **`WELCOME100`**: Flat ₹100 discount on first ticket booking

---

## 🛡️ Concurrency & Concurrency Protection Workflow

```
[User A selects Seat C5] ──► [Server locks C5 for 5 mins] ──► [Broadcasts 'seat:locked' via Socket.IO]
                                                                        │
                                                   [User B sees C5 disabled in Real Time]
                                                                        │
                                                  [User A completes simulated payment]
                                                                        │
                                                  [Atomic MongoDB update: $nin & $addToSet]
                                                                        │
                                                  [Broadcasts 'seat:booked' & generates QR]
```

---

## 📄 License
SmartCine is developed as a production-grade full-stack cinema ticketing system. Built for academic demonstration and commercial architecture portfolios.
