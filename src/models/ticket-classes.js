//src/models/ticket-classes.js.
import ticketClass from "./schemas/ticket-classes.js";

export async function getAllTicketClasses() {
  return ticketClass.find({}).lean();
}

export async function getTicketClassesForDay(day) {
  return ticketClass.find({ availableDays: day }).lean();
}
