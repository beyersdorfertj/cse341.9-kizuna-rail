import { Router } from 'express';
import { getAllTrains } from '../controllers/trains.js';
import { getSchedulesForTrip } from '../controllers/schedules.js';
import { getAllBookings, updateBooking, deleteBooking } from '../controllers/bookings.js';
import { getAllTrips, getTripById, updateTrip, deleteTrip } from '../controllers/trips.js';
import { requireApiRole, requireApiLogin } from '../middleware/auth.js';

const router = Router();

// Trains API
router.get('/trains', getAllTrains);

// Schedules API
router.get('/trips/:id/schedules', getSchedulesForTrip);

// Feature Sets 1-3: add new JSON API routes below this line.

// Trips API
router.get('/trips', getAllTrips);
router.get('/trips/:id', getTripById);
router.put('/trips/:id', requireApiRole('admin'), updateTrip);
router.delete('/trips/:id', requireApiRole('admin'), deleteTrip);

// Feature Set 3: Bookings
router.get('/bookings', requireApiLogin, getAllBookings);
router.put('/bookings/:id', requireApiLogin, updateBooking);
router.delete('/bookings/:id', requireApiLogin, deleteBooking);

export default router;
