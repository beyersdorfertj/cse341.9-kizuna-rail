import { Router } from 'express';
import { getAllTrains } from '../controllers/trains.js';
import { getSchedulesForTrip } from '../controllers/schedules.js';

const router = Router();

// Trains API
router.get('/trains', getAllTrains);

// Schedules API
router.get('/trips/:id/schedules', getSchedulesForTrip);

// Feature Sets 1-3: add new JSON API routes below this line.

export default router;
