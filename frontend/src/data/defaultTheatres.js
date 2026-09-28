/**
 * defaultTheatres.js
 * 
 * Default premier cinema complexes across India.
 * Provides resilient fallback data so theatres and shows always display smoothly
 * even if the backend is waking up, sleeping, or offline.
 */

export const DEFAULT_THEATRES = [
  {
    _id: 'theatre_amb_hyderabad',
    id: 'theatre_amb_hyderabad',
    name: 'SmartCine AMB Cinemas – Gachibowli',
    city: 'Hyderabad',
    address: 'Sarath City Capital Mall, Gachibowli - Miyapur Rd, Whitefields, Hyderabad, Telangana 500084',
    phone: '+91 40 4567 8900',
    email: 'amb.hyderabad@smartcine.com',
    amenities: ['Laser Projection', 'Dolby Atmos', 'M-Lounge', 'Gourmet Food Court', 'Valet Parking', 'Recliner VIP Seats'],
    formats: ['2D', '3D', 'IMAX', '4DX', 'ScreenX'],
    screenCount: 7,
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    _id: 'theatre_pvr_inorbit',
    id: 'theatre_pvr_inorbit',
    name: 'SmartCine PVR IMAX – Inorbit Mall',
    city: 'Hyderabad',
    address: 'Inorbit Mall, Mindspace, Madhapur, Hyderabad, Telangana 500081',
    phone: '+91 40 6789 1234',
    email: 'pvr.inorbit@smartcine.com',
    amenities: ['IMAX Laser', 'Dolby 7.1', 'Gold Class Lounge', 'Popcorn Bar', 'Wheelchair Access'],
    formats: ['2D', '3D', 'IMAX 3D', 'Gold Class'],
    screenCount: 6,
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    _id: 'theatre_prasads_hyderabad',
    id: 'theatre_prasads_hyderabad',
    name: 'SmartCine Prasads Multiplex – NTR Gardens',
    city: 'Hyderabad',
    address: 'NTR Gardens, Necklace Road, Khairatabad, Hyderabad, Telangana 500063',
    phone: '+91 40 2344 8888',
    email: 'prasads@smartcine.com',
    amenities: ['Giant Screen', 'Dolby Atmos', 'Fun Zone Gaming', 'Riverside Food Court', 'Spacious Parking'],
    formats: ['2D', '3D', 'Large Format PCX'],
    screenCount: 5,
    image: 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    _id: 'theatre_directors_cut_bangalore',
    id: 'theatre_directors_cut_bangalore',
    name: "SmartCine Director's Cut – Forum Rex Walk",
    city: 'Bengaluru',
    address: 'Brigade Road, Ashok Nagar, Bengaluru, Karnataka 560001',
    phone: '+91 80 4123 5678',
    email: 'directorscut.blr@smartcine.com',
    amenities: ['Luxury Recliners', 'Chef Crafted Dining', 'At-Seat Butler Service', 'Dolby Vision', 'Private Lounge'],
    formats: ['2D', 'Luxury VIP'],
    screenCount: 4,
    image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    _id: 'theatre_maison_inox_mumbai',
    id: 'theatre_maison_inox_mumbai',
    name: 'SmartCine Maison INOX – Jio World Plaza',
    city: 'Mumbai',
    address: 'Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra 400051',
    phone: '+91 22 6900 1122',
    email: 'maison.mumbai@smartcine.com',
    amenities: ['IMAX with Laser', 'Insignia Suites', 'Artisan Popcorn Concessionaire', 'Valet', 'French Gourmet Bistro'],
    formats: ['2D', '3D', 'IMAX', 'Insignia VIP'],
    screenCount: 6,
    image: 'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    _id: 'theatre_cinepolis_vijayawada',
    id: 'theatre_cinepolis_vijayawada',
    name: 'SmartCine Cinepolis – PVP Square',
    city: 'Vijayawada',
    address: 'MG Road, Sidhartha Nagar, Vijayawada, Andhra Pradesh 520010',
    phone: '+91 866 245 9900',
    email: 'cinepolis.vja@smartcine.com',
    amenities: ['VIP Seating', 'Dolby 7.1', 'Coffee House', 'Easy Ticketing Kiosks'],
    formats: ['2D', '3D'],
    screenCount: 5,
    image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    _id: 'theatre_jagadamba_vizag',
    id: 'theatre_jagadamba_vizag',
    name: 'SmartCine Jagadamba Prime',
    city: 'Visakhapatnam',
    address: 'Jagadamba Junction, Maharani Peta, Visakhapatnam, Andhra Pradesh 530002',
    phone: '+91 891 256 3456',
    email: 'jagadamba.vizag@smartcine.com',
    amenities: ['Iconic 70mm Screen', 'Dolby Atmos Sound', 'Grand Balcony', 'Express Snack Bar'],
    formats: ['2D', '3D', '70mm Large Format'],
    screenCount: 4,
    image: 'https://images.unsplash.com/photo-1460881680858-30d872d5b530?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
];

export const DEFAULT_CITIES = [
  { _id: 'Hyderabad', name: 'Hyderabad', theatreCount: 3 },
  { _id: 'Bengaluru', name: 'Bengaluru', theatreCount: 1 },
  { _id: 'Mumbai', name: 'Mumbai', theatreCount: 1 },
  { _id: 'Vijayawada', name: 'Vijayawada', theatreCount: 1 },
  { _id: 'Visakhapatnam', name: 'Visakhapatnam', theatreCount: 1 },
];

/**
 * Generate fallback show timings for a movie and theatre
 */
export const getFallbackShowsForMovie = (movieId, city = 'Hyderabad') => {
  const filteredTheatres = DEFAULT_THEATRES.filter(
    (t) => !city || city === 'all' || t.city.toLowerCase() === city.toLowerCase()
  );

  const theatresList = filteredTheatres.length > 0 ? filteredTheatres : DEFAULT_THEATRES.slice(0, 3);

  const showTimes = [
    { time: '10:30 AM', time24: '10:30', format: '2D', price: 200, category: 'Morning Prime' },
    { time: '01:45 PM', time24: '13:45', format: '3D', price: 250, category: 'Matinee' },
    { time: '06:15 PM', time24: '18:15', format: 'IMAX 3D', price: 350, category: 'Evening Blockbuster' },
    { time: '09:45 PM', time24: '21:45', format: '2D', price: 220, category: 'Night Gala' },
  ];

  return theatresList.map((theatre, tIdx) => {
    const shows = showTimes.map((st, sIdx) => ({
      _id: `show_${movieId}_${theatre._id}_${sIdx}`,
      id: `show_${movieId}_${theatre._id}_${sIdx}`,
      movieId: movieId,
      theatreId: theatre._id,
      showTime: st.time,
      startTime: st.time24,
      format: st.format,
      basePrice: st.price,
      screenName: `Screen ${sIdx + 1}`,
      availableSeats: 78 - sIdx * 8,
      totalSeats: 120,
    }));

    const showsByFormat = {};
    shows.forEach((s) => {
      if (!showsByFormat[s.format]) showsByFormat[s.format] = [];
      showsByFormat[s.format].push(s);
    });

    return {
      theatre: {
        _id: theatre._id,
        id: theatre._id,
        name: theatre.name,
        city: theatre.city,
        address: theatre.address,
        amenities: theatre.amenities,
      },
      shows,
      showsByFormat,
    };
  });
};

/**
 * Generate a full layout of cinema seats for any show
 */
export const generateFallbackSeatLayout = (showId) => {
  const rowsConfig = [
    { row: 'A', category: 'Regular', price: 180, count: 12 },
    { row: 'B', category: 'Regular', price: 180, count: 12 },
    { row: 'C', category: 'Regular', price: 180, count: 12 },
    { row: 'D', category: 'Executive', price: 240, count: 14 },
    { row: 'E', category: 'Executive', price: 240, count: 14 },
    { row: 'F', category: 'Executive', price: 240, count: 14 },
    { row: 'G', category: 'Premium', price: 320, count: 10 },
    { row: 'H', category: 'Premium', price: 320, count: 10 },
  ];

  const rows = rowsConfig.map((rc) => {
    const seats = [];
    for (let i = 1; i <= rc.count; i++) {
      // Deterministically mark a few seats as occupied for realism
      const isOccupied = (i === 3 || i === 4) && (rc.row === 'D' || rc.row === 'E');
      seats.push({
        id: `${rc.row}-${i}`,
        seatId: `${rc.row}-${i}`,
        row: rc.row,
        number: i,
        category: rc.category,
        price: rc.price,
        status: isOccupied ? 'occupied' : 'available',
      });
    }
    return {
      row: rc.row,
      category: rc.category,
      price: rc.price,
      seats,
    };
  });

  return {
    show: {
      _id: showId,
      id: showId,
      format: 'IMAX 3D',
      basePrice: 250,
      theatre: {
        _id: 'theatre_amb_hyderabad',
        name: 'SmartCine AMB Cinemas – Gachibowli',
        city: 'Hyderabad',
      },
      screen: {
        name: 'Audi 1 (Laser IMAX)',
        format: 'IMAX 3D',
      },
    },
    rows,
  };
};
