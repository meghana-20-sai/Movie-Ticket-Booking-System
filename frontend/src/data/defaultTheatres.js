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
    _id: 'theatre_capital_vja',
    id: 'theatre_capital_vja',
    name: 'SmartCine Capital Cinemas – Trendset Mall',
    city: 'Vijayawada',
    address: 'Kalanagar, Benz Circle, Vijayawada, Andhra Pradesh 520010',
    phone: '+91 866 669 8899',
    email: 'capital.vja@smartcine.com',
    amenities: ['4K RGB Laser', 'Dolby Atmos', 'Recliner Lounges', 'Food Street'],
    formats: ['2D', '3D', '4K Laser'],
    screenCount: 6,
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80',
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
  {
    _id: 'theatre_cmr_vizag',
    id: 'theatre_cmr_vizag',
    name: 'SmartCine INOX Laser – CMR Central',
    city: 'Visakhapatnam',
    address: 'Maddilapalem, NH16, Visakhapatnam, Andhra Pradesh 530013',
    phone: '+91 891 304 5500',
    email: 'cmr.vizag@smartcine.com',
    amenities: ['Laser Projection', 'Club Class', 'Café Unwind', 'Wheelchair Access'],
    formats: ['2D', '3D', 'Laser 4K'],
    screenCount: 5,
    image: 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    _id: 'theatre_pvr_delhi_vk',
    id: 'theatre_pvr_delhi_vk',
    name: "SmartCine PVR Director's Cut – Ambience Mall",
    city: 'Delhi-NCR',
    address: 'Nelson Mandela Marg, Vasant Kunj II, New Delhi, Delhi 110070',
    phone: '+91 11 4087 0000',
    email: 'directorscut.delhi@smartcine.com',
    amenities: ['7-Star Luxury', 'Chef Gourmet Dining', 'Plush Leather Recliners', 'Private Lounge', 'Dolby Atmos'],
    formats: ['2D', '3D', "Director's Cut VIP"],
    screenCount: 4,
    image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    _id: 'theatre_inox_noida',
    id: 'theatre_inox_noida',
    name: 'SmartCine INOX Megaplex – DLF Mall of India',
    city: 'Delhi-NCR',
    address: 'Sector 18, Noida, Uttar Pradesh 201301',
    phone: '+91 120 620 9900',
    email: 'inox.noida@smartcine.com',
    amenities: ['IMAX Laser', '4DX Motion', 'ScreenX 270°', 'Kiddles Fun Zone', 'Insignia Lounge'],
    formats: ['2D', '3D', 'IMAX', '4DX', 'ScreenX'],
    screenCount: 7,
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    _id: 'theatre_cinepolis_saket',
    id: 'theatre_cinepolis_saket',
    name: 'SmartCine Cinepolis VIP – DLF Avenue',
    city: 'Delhi-NCR',
    address: 'Press Enclave Marg, Saket District Centre, New Delhi, Delhi 110017',
    phone: '+91 11 4606 2200',
    email: 'cinepolis.saket@smartcine.com',
    amenities: ['VIP Butler Service', 'Full Recline Loungers', 'Gourmet Bar', 'Dolby 7.1'],
    formats: ['2D', '3D', 'VIP Recliner'],
    screenCount: 6,
    image: 'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    _id: 'theatre_pvr_palladium_mumbai',
    id: 'theatre_pvr_palladium_mumbai',
    name: 'SmartCine PVR ICON – Phoenix Palladium',
    city: 'Mumbai',
    address: '462, Senapati Bapat Marg, Lower Parel, Mumbai, Maharashtra 400013',
    phone: '+91 22 4333 9999',
    email: 'icon.mumbai@smartcine.com',
    amenities: ['4K RGB Laser', 'Dolby Atmos', 'Gold Class Bar', 'Valet Parking'],
    formats: ['2D', '3D', 'Laser 4K', 'Gold Class'],
    screenCount: 7,
    image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    _id: 'theatre_carnival_wadala',
    id: 'theatre_carnival_wadala',
    name: 'SmartCine Dome IMAX – Wadala',
    city: 'Mumbai',
    address: 'Bhakti Park, Anik Wadala Link Rd, Wadala East, Mumbai, Maharashtra 400037',
    phone: '+91 22 2404 1122',
    email: 'wadala.mumbai@smartcine.com',
    amenities: ['Giant Dome Screen', 'Dolby Atmos', 'Game Zone', 'Extensive Food Court'],
    formats: ['2D', '3D', 'IMAX Dome'],
    screenCount: 5,
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    _id: 'theatre_pvr_whitefield_blr',
    id: 'theatre_pvr_whitefield_blr',
    name: 'SmartCine PVR Superplex – Phoenix Marketcity',
    city: 'Bengaluru',
    address: 'Whitefield Main Rd, Devasandra Industrial Estate, Mahadevapura, Bengaluru 560048',
    phone: '+91 80 6726 6666',
    email: 'whitefield.blr@smartcine.com',
    amenities: ['IMAX with Laser', '4DX Motion', 'Gold Class Lounge', 'Star Lounge Buffet'],
    formats: ['2D', '3D', 'IMAX 3D', '4DX'],
    screenCount: 9,
    image: 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    _id: 'theatre_inox_mantri_blr',
    id: 'theatre_inox_mantri_blr',
    name: 'SmartCine INOX Laserplex – Mantri Square',
    city: 'Bengaluru',
    address: 'Sampige Rd, Malleshwaram, Bengaluru, Karnataka 560003',
    phone: '+91 80 3016 0000',
    email: 'mantri.blr@smartcine.com',
    amenities: ['Laser Projection', 'Insignia Luxury', 'Metro Direct Walkway', 'Dolby Atmos'],
    formats: ['2D', '3D', 'Insignia Laser'],
    screenCount: 6,
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    _id: 'theatre_spi_sathyam_chennai',
    id: 'theatre_spi_sathyam_chennai',
    name: 'SmartCine SPI Cinemas (Sathyam) – Royapettah',
    city: 'Chennai',
    address: '8, Thiru Vi Ka Rd, Royapettah, Chennai, Tamil Nadu 600014',
    phone: '+91 44 4392 0300',
    email: 'sathyam.chennai@smartcine.com',
    amenities: ['Iconic Popcorn Station', 'Dolby Atmos', 'RGB Laser', 'Wheelchair Access'],
    formats: ['2D', '3D', 'Dolby Atmos'],
    screenCount: 6,
    image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    _id: 'theatre_inox_luxe_chennai',
    id: 'theatre_inox_luxe_chennai',
    name: 'SmartCine INOX Luxe – Phoenix Marketcity',
    city: 'Chennai',
    address: 'Velachery Rd, Indira Gandhi Nagar, Velachery, Chennai, Tamil Nadu 600042',
    phone: '+91 44 6665 0000',
    email: 'luxe.chennai@smartcine.com',
    amenities: ['IMAX Laser', 'Luxe Luxury Suites', 'Café Unwind', 'Valet Parking'],
    formats: ['2D', '3D', 'IMAX 3D', 'Luxe VIP'],
    screenCount: 8,
    image: 'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    _id: 'theatre_inox_southcity_kolkata',
    id: 'theatre_inox_southcity_kolkata',
    name: 'SmartCine INOX Laser – South City Mall',
    city: 'Kolkata',
    address: '375, Prince Anwar Shah Rd, Jadavpur, Kolkata, West Bengal 700068',
    phone: '+91 33 4007 2200',
    email: 'southcity.kolkata@smartcine.com',
    amenities: ['IMAX Laser', 'Insignia Suites', 'Food Court Connected', 'Dolby Atmos'],
    formats: ['2D', '3D', 'IMAX Laser', 'Insignia'],
    screenCount: 6,
    image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    _id: 'theatre_pvr_pavilion_pune',
    id: 'theatre_pvr_pavilion_pune',
    name: 'SmartCine PVR ICON – The Pavillion Mall',
    city: 'Pune',
    address: 'Senapati Bapat Rd, Laxmi Society, Model Colony, Shivajinagar, Pune, Maharashtra 411016',
    phone: '+91 20 6642 1100',
    email: 'pavilion.pune@smartcine.com',
    amenities: ['4K RGB Laser', 'Dolby Atmos', 'Gold Class Lounge', 'Curated Concessions'],
    formats: ['2D', '3D', 'Gold Class Laser'],
    screenCount: 6,
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    _id: 'theatre_pvr_lulu_kochi',
    id: 'theatre_pvr_lulu_kochi',
    name: 'SmartCine PVR Superplex – LuLu Mall',
    city: 'Kochi',
    address: '34/1000, Old NH 47, Edappally, Kochi, Kerala 682024',
    phone: '+91 484 272 8000',
    email: 'lulu.kochi@smartcine.com',
    amenities: ['4DX Motion', 'Dolby Atmos 7.1', 'Gold Class', 'Huge Mall Dining'],
    formats: ['2D', '3D', '4DX', 'Gold Class'],
    screenCount: 9,
    image: 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    _id: 'theatre_cinepolis_ahmedabad',
    id: 'theatre_cinepolis_ahmedabad',
    name: 'SmartCine Cinepolis – Ahmedabad One Mall',
    city: 'Ahmedabad',
    address: 'Vastrapur Lake, Vastrapur, Ahmedabad, Gujarat 380015',
    phone: '+91 79 4019 3300',
    email: 'ahmedabad@smartcine.com',
    amenities: ['VIP Recliner Auditoriums', 'Dolby 7.1', 'Coffee Tree Deli'],
    formats: ['2D', '3D', 'VIP'],
    screenCount: 6,
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
  {
    _id: 'theatre_pvr_elante_chd',
    id: 'theatre_pvr_elante_chd',
    name: 'SmartCine PVR Elante – Industrial Area',
    city: 'Chandigarh',
    address: 'Elante Mall, 178-178A, Industrial Area Phase I, Chandigarh 160002',
    phone: '+91 172 500 5000',
    email: 'elante.chd@smartcine.com',
    amenities: ['Gold Class', 'Dolby Atmos', 'Spacious Seating', 'Mall Food Court'],
    formats: ['2D', '3D', 'Gold Class'],
    screenCount: 8,
    image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&auto=format&fit=crop&q=80',
    isActive: true,
  },
];

export const DEFAULT_CITIES = [
  { _id: 'Hyderabad', name: 'Hyderabad', theatreCount: 3 },
  { _id: 'Mumbai', name: 'Mumbai', theatreCount: 3 },
  { _id: 'Delhi-NCR', name: 'Delhi-NCR', theatreCount: 3 },
  { _id: 'Bengaluru', name: 'Bengaluru', theatreCount: 3 },
  { _id: 'Chennai', name: 'Chennai', theatreCount: 2 },
  { _id: 'Kolkata', name: 'Kolkata', theatreCount: 1 },
  { _id: 'Pune', name: 'Pune', theatreCount: 1 },
  { _id: 'Kochi', name: 'Kochi', theatreCount: 1 },
  { _id: 'Ahmedabad', name: 'Ahmedabad', theatreCount: 1 },
  { _id: 'Vijayawada', name: 'Vijayawada', theatreCount: 2 },
  { _id: 'Visakhapatnam', name: 'Visakhapatnam', theatreCount: 2 },
  { _id: 'Chandigarh', name: 'Chandigarh', theatreCount: 1 },
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

/**
 * Generate fallback movies and showtimes for a specific theatre
 */
export const getFallbackMoviesForTheatre = (theatreId) => {
  const currentTheatre = DEFAULT_THEATRES.find((t) => t._id === theatreId) || DEFAULT_THEATRES[0];

  const nowShowingMovies = [
    {
      _id: 'movie_pushpa2_telugu',
      title: 'Pushpa 2: The Rule',
      poster: 'https://image.tmdb.org/t/p/w500/b0OnvU5xV5xZ2K2QYgL9uU1dI9c.jpg',
      language: 'Telugu',
      certificate: 'UA',
      genre: ['Action', 'Crime'],
      rating: 4.9,
      shows: [
        { _id: `show_m1_${theatreId}_1`, time: '10:30 AM', time24: '10:30', format: '2D', price: 200 },
        { _id: `show_m1_${theatreId}_2`, time: '01:45 PM', time24: '13:45', format: 'IMAX 3D', price: 350 },
        { _id: `show_m1_${theatreId}_3`, time: '06:15 PM', time24: '18:15', format: 'IMAX 3D', price: 350 },
        { _id: `show_m1_${theatreId}_4`, time: '09:45 PM', time24: '21:45', format: '2D', price: 220 },
      ],
    },
    {
      _id: 'movie_kalki_telugu',
      title: 'Kalki 2898 AD',
      poster: 'https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg',
      language: 'Telugu',
      certificate: 'UA',
      genre: ['Sci-Fi', 'Action'],
      rating: 4.8,
      shows: [
        { _id: `show_m2_${theatreId}_1`, time: '11:00 AM', time24: '11:00', format: '3D', price: 250 },
        { _id: `show_m2_${theatreId}_2`, time: '03:15 PM', time24: '15:15', format: '3D', price: 250 },
        { _id: `show_m2_${theatreId}_3`, time: '07:30 PM', time24: '19:30', format: 'IMAX 3D', price: 350 },
      ],
    },
    {
      _id: 'movie_devara_telugu',
      title: 'Devara: Part 1',
      poster: 'https://image.tmdb.org/t/p/w500/AOBZkWVd7vC3L05FqMekyZc6b0y.jpg',
      language: 'Telugu',
      certificate: 'UA',
      genre: ['Action', 'Drama'],
      rating: 4.7,
      shows: [
        { _id: `show_m3_${theatreId}_1`, time: '02:00 PM', time24: '14:00', format: '2D', price: 200 },
        { _id: `show_m3_${theatreId}_2`, time: '08:45 PM', time24: '20:45', format: '2D', price: 220 },
      ],
    },
  ];

  return {
    theatre: currentTheatre,
    movies: nowShowingMovies,
  };
};
