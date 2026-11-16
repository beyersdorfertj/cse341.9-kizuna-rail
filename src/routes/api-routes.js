import { Router } from 'express';
import { getAllTrains } from '../controllers/trains.js';
import { getAllBookings } from '../controllers/bookings.js';

const router = Router();

// Trains API
router.get('/trains', getAllTrains);

// Feature Sets 1-3: add new JSON API routes below this line.

// Feature Set 3: Bookings 
router.get('/bookings', getAllBookings);

export default router;
