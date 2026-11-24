import { Router } from 'express';
import { getAllTrains } from '../controllers/trains.js';
import { getSchedulesForTrip } from '../controllers/schedules.js';
import { getAllBookings } from '../controllers/bookings.js';
import { getAllTrips, getTripById } from '../controllers/trips.js';
import { getAllTicketClasses } from '../controllers/ticket-classes.js';

const router = Router();

// Trains API
router.get('/trains', getAllTrains);

// Schedules API
router.get('/trips/:id/schedules', getSchedulesForTrip);

// Feature Sets 1-3: add new JSON API routes below this line.

// Trips API
router.get('/trips', getAllTrips);
router.get('/trips/:id', getTripById);

// Feature Set 3: Bookings
router.get('/bookings', getAllBookings);

// Feature Set 4: Ticket Classes (optional ?day= filter handled in the controller)
router.get('/ticket-classes', getAllTicketClasses);

export default router;
