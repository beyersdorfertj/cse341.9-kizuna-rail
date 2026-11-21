//src/models/schemas/ticket-classes.js.
import mongoose from "mongoose";

const ticketClassSchema = new mongoose.Schema(
  {
    class: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    pricePerKm: {
      type: Number,
      required: true,
      min: 0,
    },
    amenities: {
      type: [String],
    },
    description: {
      type: String,
      trim: true,
    },
    availableDays: {
      type: [String],
    },
  },
  {
    timestamps: true,
    // Seed data lives in the camelCase "ticketClasses" collection, so override
    // Mongoose's default "ticketclasses" pluralization.
    collection: "ticketClasses",
  }
);

const ticketClass = mongoose.model("TicketClass", ticketClassSchema);

export default ticketClass;
