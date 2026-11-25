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
 *   put:
 *     summary: Update an existing trip
 *     description: Admin only. Updates editable fields of an existing trip.
 *     tags:
 *       - Trips
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique trip ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               region:
 *                 type: string
 *               startStation:
 *                 type: string
 *               endStation:
 *                 type: string
 *               duration:
 *                 type: string
 *               distance:
 *                 type: number
 *                 minimum: 0
 *               highlights:
 *                 type: array
 *                 items:
 *                   type: string
 *               bestSeason:
 *                 type: string
 *               operatingMonths:
 *                 type: array
 *                 items:
 *                   type: number
 *               imageUrl:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Trip updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trip'
 *       '400':
 *         description: Invalid update data or no editable fields provided
 *       '401':
 *         description: Authentication required
 *       '403':
 *         description: Admin access required
 *       '404':
 *         description: Trip not found
 *       '500':
 *         description: Internal server error
 *   delete:
 *     summary: Delete an existing trip
 *     description: Admin only. Deletes the trip with the supplied ID.
 *     tags:
 *       - Trips
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique trip ID
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Trip deleted successfully
 *       '401':
 *         description: Authentication required
 *       '403':
 *         description: Admin access required
 *       '404':
 *         description: Trip not found
 *       '409':
 *         description: Trip cannot be deleted because it has existing bookings
 *       '500':
 *         description: Internal server error
 */

/**
 * @openapi
 * /api/bookings:
 *   get:
 *     summary: List, search, and filter bookings with pagination
 *     description: Returns paginated bookings with optional search and filters. Booking ID search is a case-insensitive prefix match. Ticket class and trip ID are exact matches. Administrators can view all bookings; other signed-in users can view bookings associated with their email address.
 *     tags:
 *       - Bookings
 *     parameters:
 *       - in: query
 *         name: page
 *         description: Page number (starts at 1).
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         description: Number of bookings per page (maximum 50).
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *       - in: query
 *         name: q
 *         description: Optional case-insensitive prefix search on booking ID (1–100 characters).
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: JRABC
 *       - in: query
 *         name: ticketClass
 *         description: Optional exact ticket-class filter. Must match an existing ticket class.
 *         schema:
 *           type: string
 *           example: premium
 *       - in: query
 *         name: tripId
 *         description: Optional exact trip ID filter.
 *         schema:
 *           type: string
 *           minLength: 1
 *           example: alpine-panorama
 *       - in: query
 *         name: sort
 *         description: Field used to sort the results.
 *         schema:
 *           type: string
 *           enum: [createdAt, tripId, ticketClass, scheduleId]
 *           default: createdAt
 *       - in: query
 *         name: order
 *         description: Sort direction.
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Bookings, applied search and filter parameters, and pagination metadata.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: JRABC12345
 *                       scheduleId:
 *                         type: number
 *                         example: 1
 *                       tripId:
 *                         type: string
 *                         example: alpine-panorama
 *                       ticketClass:
 *                         type: string
 *                         example: premium
 *                       selectedDay:
 *                         type: string
 *                         example: monday
 *                       passengers:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             firstName:
 *                               type: string
 *                             lastName:
 *                               type: string
 *                             email:
 *                               type: string
 *                             phone:
 *                               type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 query:
 *                   type: object
 *                   description: Search and filter parameters applied to this result.
 *                   properties:
 *                     q:
 *                       type: string
 *                       example: JRABC
 *                     ticketClass:
 *                       type: string
 *                       example: premium
 *                     tripId:
 *                       type: string
 *                       example: alpine-panorama
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalItems:
 *                       type: integer
 *                       example: 25
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                     hasPreviousPage:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Invalid pagination, sorting, search, or filter parameters.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Account email is required for non-admin users.
 *       500:
 *         description: Internal server error.
 */

/**
 * @openapi
 * /api/bookings/{id}:
 *   put:
 *     summary: Update a booking
 *     description: Updates editable booking fields. Requires a signed-in user who is an admin or a passenger on the booking.
 *     tags:
 *       - Bookings
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Booking reference ID
 *         schema:
 *           type: string
 *           example: JRABC12345
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               ticketClass:
 *                 type: string
 *                 enum: [standard, premium, first]
 *                 example: premium
 *               selectedDay:
 *                 type: string
 *                 example: monday
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 ticketClass:
 *                   type: string
 *                 selectedDay:
 *                   type: string
 *       400:
 *         description: Invalid or missing booking fields
 *       401:
 *         description: Authentication required
 *       403:
 *         description: User is not an admin or passenger on this booking
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 */

/**
 * @openapi
 * /api/bookings/{id}:
 *   delete:
 *     summary: Delete a booking
 *     description: Deletes a booking. Requires a signed-in user who is an admin or a passenger on the booking.
 *     tags:
 *       - Bookings
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Booking reference ID
 *         schema:
 *           type: string
 *           example: JRABC12345
 *     responses:
 *       200:
 *         description: Booking deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Booking has been deleted
 *       401:
 *         description: Authentication required
 *       403:
 *         description: User is not an admin or passenger on this booking
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 */

/**
 * @openapi
 * /bookings-admin:
 *   get:
 *     summary: Display the booking admin page
 *     description: Renders the bookings page for a signed-in user. The page loads bookings dynamically from the API.
 *     tags:
 *       - Booking Pages
 *     responses:
 *       200:
 *         description: Bookings page rendered
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *       302:
 *         description: Redirects an unauthenticated visitor to the login page
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *             example: /login
 *       500:
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
