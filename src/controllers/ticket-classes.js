//src/controllers/ticket-classes.js
import {
  getAllTicketClasses as findAllTicketClasses,
  getTicketClassesForDay,
} from "../models/ticket-classes.js";

export async function getAllTicketClasses(req, res) {
  try {
    // Express yields an array for repeated query params; keep the first value.
    const day = Array.isArray(req.query.day) ? req.query.day[0] : req.query.day;

    const ticketClasses = day
      ? await getTicketClassesForDay(day)
      : await findAllTicketClasses();

    return res.status(200).json(ticketClasses);
  } catch (error) {
    console.error("Error fetching ticket classes:", error);

    return res.status(500).json({
      error: "Failed to fetch ticket classes",
    });
  }
}
