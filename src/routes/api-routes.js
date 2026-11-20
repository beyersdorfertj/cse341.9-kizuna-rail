
import { Router } from 'express';
import { getAllTrains } from '../controllers/trains.js';
import { getSchedulesForTrip } from '../controllers/schedules.js';
import { getAllBookings } from '../controllers/bookings.js';
import { getAllTrips, getTripById } from '../controllers/trips.js';
import { getMyBookings } from '../controllers/dashboard.js';
import { requireApiLogin } from '../middleware/auth.js';

const router = Router();

// Trains API
router.get('/trains', getAllTrains);

// Schedules API
router.get('/trips/:id/schedules', getSchedulesForTrip);

// Feature Sets 1-3: add new JSON API routes below this line.

// User Dashboard - Feature Set 2
router.get('/my-bookings', requireApiLogin, getMyBookings);

// Trips API
router.get('/trips', getAllTrips);
router.get('/trips/:id', getTripById);

// Feature Set 3: Bookings
router.get('/bookings', getAllBookings);

export default router;
