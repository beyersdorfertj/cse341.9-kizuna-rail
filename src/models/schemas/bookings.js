import mongoose from "mongoose";

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
      type: Array,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

const booking = mongoose.model("Booking", bookingSchema);

export default booking;