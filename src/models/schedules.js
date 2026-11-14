//src/models/schedules.js.
import schedule from "./schemas/schedules.js";

export async function getSchedulesByTripId(tripId, month) {
  if (month !== undefined) {
    const parsedMonth = Number(month);

    if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      throw new RangeError("month must be an integer between 1 and 12");
    }

    // Issues #28 and #29 depend on month filtering. The schedules data model
    // has no operating-month field yet, so a valid month is accepted but not
    // applied to the query until its data source is defined (see issue #27).
  }

  return schedule.find({ tripId }).lean();
}
