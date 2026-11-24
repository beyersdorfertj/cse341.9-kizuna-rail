
import { Router } from 'express';
import { getAllTrains } from '../controllers/trains.js';
import { getSchedulesForTrip } from '../controllers/schedules.js';
import { getAllBookings } from '../controllers/bookings.js';
import { getAllTrips, getTripById } from '../controllers/trips.js';
import {
    getAllStations,
    getStationById,
} from '../controllers/stations.js';

const router = Router();

// Trains API
router.get('/trains', getAllTrains);

// Schedules API
router.get('/trips/:id/schedules', getSchedulesForTrip);

// Trips API
router.get('/trips', getAllTrips);
router.get('/trips/:id', getTripById);

// Bookings API
router.get('/bookings', getAllBookings);

// Stations API - Feature Set 5
router.get('/stations', getAllStations);
router.get('/stations/:id', getStationById);

export default router;
