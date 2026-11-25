
import trip from "./schemas/trips.js";

export async function getAllTrips() {
  return trip.find({}).lean();
}

export async function getPaginatedTrips({ filter = {},page = 1, limit = 10, sort = {} , order = 'asc' }) {
  const skip = (page - 1) * limit;
  const [trips, totalItems] = await Promise.all([
    trip.find(filter).sort({ [sort]: order === 'asc' ? 1 : -1 }).skip(skip).limit(limit).lean(),
    trip.countDocuments(filter)
  ]);
  return { trips, totalItems };
}

export async function getTripById(id) {
  return trip.findOne({ id }).lean();
}