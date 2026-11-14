
import {
  getAllTrips as findAllTrips,
  getTripById as findTripById,
} from "../models/trips.js";

import { getDb } from "../db/connect.js";

// GET /api/trips
export async function getAllTrips(req, res) {
  try {
    const trips = await findAllTrips();
    return res.status(200).json(trips);
  } catch (error) {
    console.error("Failed to retrieve trips:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// GET /api/trips/:id
export async function getTripById(req, res) {
  try {
    const trip = await findTripById(req.params.id);

    if (!trip) {
      return res.status(404).json({
        message: "Trip not found",
      });
    }

    return res.status(200).json(trip);
  } catch (error) {
    console.error("Failed to retrieve trip:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// Render the Trips list page
export function listTripsPage(req, res) {
  return res.render("trips/list", {
    title: "Scenic Train Trips",
  });
}

// Render an individual Trip Details page
export async function tripDetailsPage(req, res, next) {
  const { tripId } = req.params;

  try {
    // Retrieve trip information using Mongoose.
    const details = await findTripById(tripId);

    // Handle trips that do not exist.
    if (!details) {
      const error = new Error("Trip not found");
      error.status = 404;
      return next(error);
    }

    // Retrieve schedules using the existing MongoDB driver.
    const db = getDb();

    details.schedules = await db
      .collection("schedules")
      .find({ tripId })
      .toArray();

    // Render the existing details page.
    return res.render("trips/details", {
      title: "Trip Details",
      details,
    });
  } catch (error) {
    console.error("Failed to load trip details:", error);
    return next(error);
  }
}

