
import {
  getPaginatedTrips,
  getTripById as findTripById,
} from "../models/trips.js";

import { getDb } from "../db/connect.js";

const ALLOWED_SORT = ["name", "distance", "region", "bestSeason"];
const ALLOWED_ORDER = ["asc", "desc"];
const ALLOWED_REGION = ["central", "northern", "kansai", "hokkaido"];
const ALLOWED_SEASON = ["spring", "summer", "autumn", "winter"];

// GET /api/trips
export async function getAllTrips(req, res) {
  const errors = [];

  const { page = 1, limit = 10, sort = "name", order = "asc" } = req.query;
  const { q, region, bestSeason, minDistance, maxDistance } = req.query;

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
  if (q !== undefined && (typeof q !== "string" || q.trim().length < 1 || q.trim().length > 100)) {
    errors.push({ field: 'q', message: "q must be a string between 1 and 100 characters." });
  }
  if (region !== undefined && !ALLOWED_REGION.includes(region)) {
    errors.push({ field: 'region', message: `region must be one of: ${ALLOWED_REGION.join(", ")}.` });
  }
  if (bestSeason !== undefined && !ALLOWED_SEASON.includes(bestSeason)) {
    errors.push({ field: 'bestSeason', message: `bestSeason must be one of: ${ALLOWED_SEASON.join(", ")}.` });
  }
  if (minDistance !== undefined && (isNaN(Number(minDistance)) || Number(minDistance) < 0)) {
    errors.push({ field: 'minDistance', message: "minDistance must be a non-negative number." });
  }
  if (maxDistance !== undefined && (isNaN(Number(maxDistance)) || Number(maxDistance) < 0)) {
    errors.push({ field: 'maxDistance', message: "maxDistance must be a non-negative number." });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const pageNum = Number(page);
  const limitNum = Number(limit);

  const filter = {};
  const query = {};

  if (q !== undefined) {
    const text = q.trim();
    // Escape regex metacharacters to prevent injection/invalid-pattern errors.
    const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { description: { $regex: escaped, $options: "i" } },
    ];
    query.q = text;
  }
  if (region !== undefined) {
    filter.region = region;
    query.region = region;
  }
  if (bestSeason !== undefined) {
    filter.bestSeason = bestSeason;
    query.bestSeason = bestSeason;
  }
  if (minDistance !== undefined || maxDistance !== undefined) {
    filter.distance = {};
    if (minDistance !== undefined) {
      filter.distance.$gte = Number(minDistance);
      query.minDistance = Number(minDistance);
    }
    if (maxDistance !== undefined) {
      filter.distance.$lte = Number(maxDistance);
      query.maxDistance = Number(maxDistance);
    }
  }

  try {
    const { trips, totalItems } = await getPaginatedTrips({ filter, page: pageNum, limit: limitNum, sort, order });
    const totalPages = Math.ceil(totalItems / limitNum);
    return res.status(200).json({
      data: trips,
      query,
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

