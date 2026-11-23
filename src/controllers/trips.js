
import {
  getAllTrips as findAllTrips,
  getTripById as findTripById,
  updateTrip as modifyTrip,
  deleteTrip as removeTrip,
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

// Render the protected Trip Admin page
export async function tripAdminPage(req, res, next) {
  try {
    const db = getDb();

    const [stations, schedules] = await Promise.all([
      db.collection("stations").find({}).sort({ name: 1 }).toArray(),
      db.collection("schedules").find({}).sort({ id: 1 }).toArray(),
    ]);

    return res.render("admin/trips", {
      title: "Trip Admin",
      stations,
      schedules,
    });
  } catch (error) {
    return next(error);
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


const editableTripFields = [
  "name",
  "description",
  "region",
  "startStation",
  "endStation",
  "duration",
  "distance",
  "highlights",
  "bestSeason",
  "operatingMonths",
  "imageUrl",
];

// PUT /api/trips/:id
export async function updateTrip(req, res) {
  try {
    const data = {};

    editableTripFields.forEach((field) => {
      if (Object.hasOwn(req.body, field)) {
        data[field] = req.body[field];
      }
    });

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: "No editable fields provided" });
    }

    const updated = await modifyTrip(req.params.id, data);

    if (!updated) {
      return res.status(404).json({ message: "Trip not found" });
    }

    return res.status(200).json(updated);
  } catch (error) {
    console.error("Failed to update trip:", error);

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
}

// DELETE /api/trips/:id
export async function deleteTrip(req, res) {
  try {
    const tripId = req.params.id;
    const db = getDb();

    const existingTrip = await findTripById(tripId);

    if (!existingTrip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const existingBooking = await db.collection("bookings").findOne({ tripId });

    if (existingBooking) {
      return res.status(409).json({
        message: "This trip cannot be deleted because it has existing bookings.",
      });
    }

    const removed = await removeTrip(tripId);

    if (!removed) {
      return res.status(404).json({ message: "Trip not found" });
    }

    await db.collection("schedules").deleteMany({ tripId });

    return res.status(200).json({
      message: "Trip and its associated schedules deleted",
    });
  } catch (error) {
    console.error("Failed to delete trip:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
