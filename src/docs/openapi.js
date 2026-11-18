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

/**
 * @openapi
 * components:
 *   schemas:
 *     Trip:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - region
 *         - startStation
 *         - endStation
 *         - distance
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         region:
 *           type: string
 *         startStation:
 *           type: string
 *         endStation:
 *           type: string
 *         duration:
 *           type: string
 *         distance:
 *           type: number
 *           minimum: 0
 *         highlights:
 *           type: array
 *           items:
 *             type: string
 *         bestSeason:
 *           type: string
 *         operatingMonths:
 *           type: array
 *           items:
 *             type: number
 *         imageUrl:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /api/trips:
 *   get:
 *     summary: Retrieve all trips
 *     tags:
 *       - Trips
 *     responses:
 *       '200':
 *         description: Successfully retrieved all trips
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Trip'
 *       '500':
 *         description: Internal server error
 */

/**
 * @openapi
 * /api/trips/{id}:
 *   get:
 *     summary: Retrieve a trip by ID
 *     tags:
 *       - Trips
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique trip ID
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Trip retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trip'
 *       '404':
 *         description: Trip not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Trip not found
 *       '500':
 *         description: Internal server error
 */

/**
 * @openapi
 * /api/trips/{id}/schedules:
 *   get:
 *     summary: List schedules for a trip
 *     description: Returns all schedules for the given trip, optionally filtered by month. Returns an empty array if the trip has no schedules.
 *     tags:
 *       - Schedules
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The trip identifier.
 *         schema:
 *           type: string
 *           example: alpine-panorama
 *       - name: month
 *         in: query
 *         required: false
 *         description: Optional month filter (1-12).
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *           example: 7
 *     responses:
 *       200:
 *         description: An array of schedule objects (empty if the trip has none).
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                     example: 1
 *                   tripId:
 *                     type: string
 *                     example: alpine-panorama
 *                   departureTime:
 *                     type: string
 *                     example: "08:30"
 *                   arrivalTime:
 *                     type: string
 *                     example: "12:15"
 *                   daysOfWeek:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["Mon", "Wed", "Fri"]
 *                   status:
 *                     type: boolean
 *                     example: true
 *       400:
 *         description: The month query parameter is invalid (not an integer between 1 and 12).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: month must be an integer between 1 and 12
 *       500:
 *         description: Unexpected server or database error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to fetch schedules
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     Station:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - prefecture
 *         - region
 *       properties:
 *         id:
 *           type: string
 *           example: nagoya
 *         name:
 *           type: string
 *           example: Nagoya Station
 *         prefecture:
 *           type: string
 *           example: Aichi
 *         region:
 *           type: string
 *           example: central
 *         facilities:
 *           type: array
 *           items:
 *             type: string
 *           example: [restaurant, shop, restroom]
 *         description:
 *           type: string
 *           example: Major transportation hub in central Japan.
 */

/**
 * @openapi
 * /api/stations:
 *   get:
 *     summary: Retrieve all stations
 *     description: Returns all stations stored in the database.
 *     tags:
 *       - Stations
 *     responses:
 *       '200':
 *         description: Successfully retrieved all stations.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Station'
 *       '500':
 *         description: Internal server error.
 */

/**
 * @openapi
 * /api/stations/{id}:
 *   get:
 *     summary: Retrieve a station by ID
 *     description: Returns detailed information about one station.
 *     tags:
 *       - Stations
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique station ID.
 *         schema:
 *           type: string
 *           example: nagoya
 *     responses:
 *       '200':
 *         description: Station retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Station'
 *       '404':
 *         description: Station not found.
 *       '500':
 *         description: Internal server error.
 */
