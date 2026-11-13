/**
 * @openapi
 * /api/trains:
 *   get:
 *     summary: List all trains
 *     description: Returns every train stored in the database.
 *     tags:
 *       - Trains
 *     responses:
 *       200:
 *         description: A JSON object containing the list of trains.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 trains:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: series-e353
 *                       name:
 *                         type: string
 *                         example: Series E353 Limited Express
 *                       powerSource:
 *                         type: string
 *                         example: Electric
 */
