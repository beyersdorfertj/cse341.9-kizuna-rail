
import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    id: {
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
    description: {
      type: String,
      trim: true,
    },
    region: {
      type: String,
      required: true,
      trim: true,
    },
    startStation: {
      type: String,
      required: true,
      trim: true,
    },
    endStation: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      trim: true,
    },
    distance: {
      type: Number,
      required: true,
      min: 0,
    },
    highlights: [String],
    bestSeason: {
      type: String,
      trim: true,
    },
    operatingMonths: [Number],
    imageUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const trip = mongoose.model("Trip", tripSchema);

export default trip;
