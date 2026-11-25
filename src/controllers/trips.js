
import {
  getPaginatedTrips,
  getTripById as findTripById,
} from "../models/trips.js";

import { getDb } from "../db/connect.js";

const ALLOWED_SORT = ["name", "distance", "region", "bestSeason"];
const ALLOWED_ORDER = ["asc", "desc"];

// GET /api/trips
export async function getAllTrips(req, res) {
  const errors = [];

  const { page = 1, limit = 10, sort = "name", order = "asc" } = req.query;

  if (!Number.isInteger(Number(page)) || Number(page) < 1) {
    errors.push({ field: 'page', message: "page must be a positive integer." });
  }
  if (!Number.isInteger(Number(limit)) || limit < 1 || limit > 50) {
    errors.push({ field: 'limit', message: "limit must be an integer between 1 and 50." });
  }
  if (!ALLOWED_SORT.includes(sort)) {
    errors.push({ field: 'sort', message: "Invalid sort field." });
  }
  if (!ALLOWED_ORDER.includes(order)) {
    errors.push({ field: 'order', message: "Sort order must be 'asc' or 'desc'." });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const pageNum = Number(page);
  const limitNum = Number(limit);

  try {
    const { trips, totalItems } = await getPaginatedTrips({ page: pageNum, limit: limitNum, sort, order });
    const totalPages = Math.ceil(totalItems / limitNum);
    return res.status(200).json({
      data: trips,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPreviousPage: pageNum > 1
      }
    });
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

