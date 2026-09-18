import React, { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [currentMovie, setCurrentMovie] = useState(null);
  const [currentTheatre, setCurrentTheatre] = useState(null);
  const [currentDate, setCurrentDate] = useState(null);
  const [currentShow, setCurrentShow] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [lockExpiresAt, setLockExpiresAt] = useState(null);
  const [remainingLockSeconds, setRemainingLockSeconds] = useState(0);

  // Subtotal calculation
  const subtotal = selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0);
  const convenienceFee = selectedSeats.length > 0 ? 40 : 0;
  const tax = selectedSeats.length > 0 ? Math.round((subtotal + convenienceFee) * 0.05) : 0;
  const discount = coupon?.discount || 0;
  const totalAmount = Math.max(0, subtotal + convenienceFee + tax - discount);

  // Countdown timer for seat locking
  useEffect(() => {
    if (!lockExpiresAt) {
      setRemainingLockSeconds(0);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((lockExpiresAt - now) / 1000));
      setRemainingLockSeconds(diff);

      if (diff <= 0) {
        setLockExpiresAt(null);
        setSelectedSeats([]);
        setCoupon(null);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lockExpiresAt]);

  const toggleSeat = (seat) => {
    setSelectedSeats((prev) => {
      const exists = prev.some((s) => s.id === seat.id || s.seatId === seat.seatId);
      if (exists) {
        return prev.filter((s) => s.id !== seat.id && s.seatId !== seat.seatId);
      } else {
        if (prev.length >= 10) {
          alert('You can select a maximum of 10 seats at once.');
          return prev;
        }
        return [...prev, seat];
      }
    });
  };

  const clearSeats = () => {
    setSelectedSeats([]);
    setLockExpiresAt(null);
    setCoupon(null);
  };

  const resetBooking = () => {
    setCurrentMovie(null);
    setCurrentTheatre(null);
    setCurrentDate(null);
    setCurrentShow(null);
    setSelectedSeats([]);
    setCoupon(null);
    setLockExpiresAt(null);
  };

  return (
    <BookingContext.Provider
      value={{
        currentMovie,
        setCurrentMovie,
        currentTheatre,
        setCurrentTheatre,
        currentDate,
        setCurrentDate,
        currentShow,
        setCurrentShow,
        selectedSeats,
        setSelectedSeats,
        toggleSeat,
        clearSeats,
        coupon,
        setCoupon,
        lockExpiresAt,
        setLockExpiresAt,
        remainingLockSeconds,
        subtotal,
        convenienceFee,
        tax,
        discount,
        totalAmount,
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
