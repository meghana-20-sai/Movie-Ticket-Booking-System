import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { BookingProvider } from './context/BookingContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

// Public & Customer Pages
import Home from './pages/Home';
import Movies from './pages/Movies';
import MovieDetails from './pages/MovieDetails';
import SeatSelection from './pages/SeatSelection';
import BookingSuccess from './pages/BookingSuccess';
import MyBookings from './pages/MyBookings';
import BookingDetails from './pages/BookingDetails';
import TheatresPage from './pages/TheatresPage';
import OffersPage from './pages/OffersPage';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMovies from './pages/admin/AdminMovies';
import AdminTheatres from './pages/admin/AdminTheatres';
import AdminScreens from './pages/admin/AdminScreens';
import AdminSeats from './pages/admin/AdminSeats';
import AdminShows from './pages/admin/AdminShows';
import AdminBookings from './pages/admin/AdminBookings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminReviews from './pages/admin/AdminReviews';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminCommandCenter from './pages/admin/AdminCommandCenter';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <BookingProvider>
              <Routes>
                {/* Authentication Routes (Public) */}
                <Route element={<UserLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                </Route>

                {/* Customer Facing Application - Fully Protected: Must login to access anything */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <UserLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Home />} />
                  <Route path="movies" element={<Movies />} />
                  <Route path="movies/:movieId" element={<MovieDetails />} />
                  <Route path="theatres" element={<TheatresPage />} />
                  <Route path="offers" element={<OffersPage />} />
                  <Route path="seat-selection/:showId" element={<SeatSelection />} />
                  <Route path="booking-success/:bookingId" element={<BookingSuccess />} />
                  <Route path="my-bookings" element={<MyBookings />} />
                  <Route path="bookings/:bookingId" element={<BookingDetails />} />
                  <Route path="profile" element={<Profile />} />
                </Route>

                {/* Admin Portal Suite */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="command-center" element={<AdminCommandCenter />} />
                  <Route path="movies" element={<AdminMovies />} />
                  <Route path="theatres" element={<AdminTheatres />} />
                  <Route path="screens" element={<AdminScreens />} />
                  <Route path="seats" element={<AdminSeats />} />
                  <Route path="shows" element={<AdminShows />} />
                  <Route path="bookings" element={<AdminBookings />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="coupons" element={<AdminCoupons />} />
                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                </Route>

                {/* Catch-all redirect to Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BookingProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
