
import trip from "./schemas/trips.js";

export async function getAllTrips() {
  return trip.find({}).lean();
}

export async function getTripById(id) {
  return trip.findOne({ id }).lean();
}

export async function updateTrip(id, data) {
  return trip.findOneAndUpdate(
    { id },
    { $set: data },
    { new: true, runValidators: true }
  ).lean();
}

export async function deleteTrip(id) {
  return trip.findOneAndDelete({ id }).lean();
}
