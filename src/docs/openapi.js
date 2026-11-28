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
 *     summary: List all bookings
 *     description: Returns every booking stored in the database.
 *     tags:
 *       - Bookings
 *     responses:
 *       200:
 *         description: A JSON array containing the list of bookings.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: JRABC12345
 *                   scheduleId:
 *                     type: number
 *                     example: 1
 *                   tripId:
 *                     type: string
 *                     example: alpine-panorama
 *                   ticketClass:
 *                     type: string
 *                     example: premium
 *                   selectedDay:
 *                     type: string
 *                     example: monday
 *                   passengers:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         email:
 *                           type: string
 *                         phone:
 *                           type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Internal server error
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

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     sessionCookie:
 *       type: apiKey
 *       in: cookie
 *       name: connect.sid
 *       description: Session cookie set after logging in.
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId of the user.
 *           example: 665f1c2a9b1e8a3d4c5b6a7f
 *         displayName:
 *           type: string
 *           example: Hana Suzuki
 *         username:
 *           type: string
 *           example: hana
 *         email:
 *           type: string
 *           format: email
 *           example: hana@example.com
 *         role:
 *           type: string
 *           example: user
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     UserUpdate:
 *       type: object
 *       description: At least one field is required. Only admins may change role.
 *       minProperties: 1
 *       properties:
 *         displayName:
 *           type: string
 *           example: Hana S.
 *         username:
 *           type: string
 *           example: hana_s
 *         email:
 *           type: string
 *           format: email
 *           example: hana.s@example.com
 *         role:
 *           type: string
 *           description: Admin only. Must match an existing role name.
 *           example: admin
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *   parameters:
 *     UserId:
 *       name: id
 *       in: path
 *       required: true
 *       description: MongoDB ObjectId of the user (24 hex characters).
 *       schema:
 *         type: string
 *         pattern: '^[a-fA-F0-9]{24}$'
 *         example: 665f1c2a9b1e8a3d4c5b6a7f
 *   responses:
 *     Unauthorized:
 *       description: Not logged in.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             error: Authentication required
 *     InternalError:
 *       description: Unexpected server or database error.
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *           example:
 *             error: Internal server error
 */

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: List users
 *     description: Admins receive every user. Other users receive an array containing only their own account. Password hashes are never returned.
 *     tags:
 *       - Users
 *     security:
 *       - sessionCookie: []
 *     responses:
 *       '200':
 *         description: An array of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         description: The logged-in user no longer exists.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: User not found
 *       '500':
 *         $ref: '#/components/responses/InternalError'
 */

/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     summary: Update a user
 *     description: Admins can update any user. Other users can update only their own account and cannot change role. Only displayName, username, email and role are accepted.
 *     tags:
 *       - Users
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       '200':
 *         description: The updated user.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '400':
 *         description: Invalid user ID, invalid field value, invalid role, or no valid fields supplied.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               invalidId:
 *                 value:
 *                   error: Invalid user ID
 *               emptyField:
 *                 value:
 *                   error: username must be a non-empty string
 *               invalidRole:
 *                 value:
 *                   error: Invalid role
 *               noFields:
 *                 value:
 *                   error: No valid fields to update
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         description: Not allowed to update this user, or a non-admin tried to change role.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               forbidden:
 *                 value:
 *                   error: Forbidden
 *               roleChange:
 *                 value:
 *                   error: Only admins can change roles
 *       '404':
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: User not found
 *       '409':
 *         description: Username or email already belongs to another user.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Username or email already exists
 *       '500':
 *         $ref: '#/components/responses/InternalError'
 *   delete:
 *     summary: Delete a user
 *     description: Admins can delete any user. Other users can delete only their own account, which also ends their session.
 *     tags:
 *       - Users
 *     security:
 *       - sessionCookie: []
 *     parameters:
 *       - $ref: '#/components/parameters/UserId'
 *     responses:
 *       '204':
 *         description: User deleted. No response body.
 *       '400':
 *         description: Invalid user ID.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Invalid user ID
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         description: Not allowed to delete this user.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Forbidden
 *       '404':
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: User not found
 *       '500':
 *         $ref: '#/components/responses/InternalError'
 */
