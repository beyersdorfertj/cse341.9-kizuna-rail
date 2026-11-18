
import {
    getAllStations as findAllStations,
    getStationById as findStationById,
} from "../models/stations.js";

// GET /api/stations
export async function getAllStations(req, res) {
    try {
        const stations = await findAllStations();

        return res.status(200).json({
            stations,
        });
    } catch (error) {
        console.error("Failed to retrieve stations:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
}

// GET /api/stations/:id
export async function getStationById(req, res) {
    try {
        const station = await findStationById(req.params.id);

        if (!station) {
            return res.status(404).json({
                message: "Station not found",
            });
        }

        return res.status(200).json(station);
    } catch (error) {
        console.error("Failed to retrieve station:", error);

        return res.status(500).json({
            message: "Internal server error",
        });
    }
}
