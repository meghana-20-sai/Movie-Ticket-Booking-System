import mongoose from 'mongoose';

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    location: {
      type: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
      },
      default: { lat: 0, lng: 0 },
    },
    amenities: {
      type: [String],
      default: ['Dolby Atmos', 'Recliner Seats', 'Food Court', 'Wheelchair Access', 'Parking'],
    },
    contactInfo: {
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Theatre = mongoose.model('Theatre', theatreSchema);
