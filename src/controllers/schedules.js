//src/controllers/schedules.js
import { getSchedulesByTripId } from "../models/schedules.js";

export async function getSchedulesForTrip(req, res) {
  try {
    const { id } = req.params;
    const { month } = req.query;

    const schedules = await getSchedulesByTripId(id, month);

    return res.status(200).json(schedules);
  } catch (error) {
    if (error instanceof RangeError) {
      return res.status(400).json({
        error: "month must be an integer between 1 and 12",
      });
    }

    console.error("Error fetching schedules:", error);

    return res.status(500).json({
      error: "Failed to fetch schedules",
    });
  }
}
