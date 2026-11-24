
import station from "./schemas/stations.js";

export async function getAllStations() {
    return station.find({}).lean();
}

export async function getStationById(id) {
    return station.findOne({ id }).lean();
}
