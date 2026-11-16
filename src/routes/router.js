import { Router } from 'express';
import apiRoutes from './api-routes.js';
import ejsRoutes from './ejs-routes.js';

const router = Router();

// JSON API endpoints, mounted under /api
router.use('/api', apiRoutes);

// Server-rendered EJS pages
router.use('/', ejsRoutes);

export default router;
