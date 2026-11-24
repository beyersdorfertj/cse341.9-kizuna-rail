import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
    scheduleId: {
      type: Number,
      required: true
    },
    tripId: {
      type: String,
      required: true
    },
    ticketClass: {
      type: String,
      required: true
    },
    selectedDay: {
      type: String,
      required: true
    },
    passengers: {
      type: [{
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true }
      }],
      required: true,
      validate: { validator: (passengers) => passengers.length > 0, message: 'At least one passenger is required.' }
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { collection: 'bookings' }
);

const booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

export default booking;
