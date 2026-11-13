import { Router } from 'express';
import { getAllTrains } from '../controllers/trains.js';

const router = Router();

// Trains API
router.get('/trains', getAllTrains);

// Feature Sets 1-3: add new JSON API routes below this line.

export default router;
