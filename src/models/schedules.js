//src/models/schedules.js.
import { getDb } from "../db/connect.js";
import schedule from "./schemas/schedules.js";

export async function getSchedulesByTripId(tripId, month) {
  if (month !== undefined) {
    const parsedMonth = Number(month);

    if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      throw new RangeError("month must be an integer between 1 and 12");
    }

    const trip = await getDb()
      .collection("trips")
      .findOne({ id: tripId }, { projection: { operatingMonths: 1 } });

    if (!trip) {
      return [];
    }

    if (!Array.isArray(trip.operatingMonths)) {
      throw new Error(`Trip ${tripId} has no operatingMonths array`);
    }

    if (!trip.operatingMonths.includes(parsedMonth)) {
      return [];
    }
  }

  return schedule.find({ tripId }).lean();
}

export async function getScheduleById(id) {
  return schedule.findOne({ id: Number(id) }).lean();
}
