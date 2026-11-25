import {
    getPaginatedBookings,
    createBooking,
    getBookingById,
    updateBookingById,
    deleteBookingById
} from '../models/bookings.js';
import { getDb } from '../db/connect.js';
import { generateConfirmationCode } from '../includes/helpers.js';

function canManageBooking(user, booking) {
    if (user.role === 'admin') {
        return true;
    }

    const userEmail = user.email?.trim().toLowerCase();

    return Boolean(userEmail) && booking.passengers.some(
        (passenger) => passenger.email?.trim().toLowerCase() === userEmail
    );
}

export const getAllBookings = async (req, res) => {
    try {
        const { role, email } = req.session.user;
        const normalizedEmail = email?.trim().toLowerCase();

        if (role !== 'admin' && !normalizedEmail) {
            return res.status(403).json({ message: 'Account email is required.' });
        }

        const parseInteger = (value, defaultValue, minimum, maximum = Number.MAX_SAFE_INTEGER) => {
            if (value === undefined) {
                return defaultValue;
            }

            if (typeof value !== 'string' || !/^\d+$/.test(value)) {
                return null;
            }

            const parsed = Number(value);

            if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) {
                return null;
            }

            return parsed;
        };

        const page = parseInteger(req.query.page, 1, 1);
        const limit = parseInteger(req.query.limit, 10, 1, 50);

        if (page === null || limit === null) {
            return res.status(400).json({
                message: 'Page must be a positive integer and limit must be between 1 and 50.'
            });
        }

        const allowedSortFields = ['createdAt', 'tripId', 'ticketClass', 'scheduleId'];
        const sort = req.query.sort === undefined ? 'createdAt' : req.query.sort;

        if (typeof sort !== 'string' || !allowedSortFields.includes(sort)) {
            return res.status(400).json({ message: 'Invalid sort field.' });
        }

        const order = req.query.order === undefined ? 'desc' : req.query.order;

        if (typeof order !== 'string' || !['asc', 'desc'].includes(order)) {
            return res.status(400).json({ message: 'Invalid sort order.' });
        }

        const query = {};

        if (req.query.q !== undefined) {
            if (
                typeof req.query.q !== 'string' ||
                req.query.q.trim().length < 1 ||
                req.query.q.trim().length > 100
            ) {
                return res.status(400).json({
                    message: 'Search query must be between 1 and 100 characters.'
                });
            }

            query.q = req.query.q.trim();
        }

        if (req.query.ticketClass !== undefined) {
            if (
                typeof req.query.ticketClass !== 'string' ||
                !req.query.ticketClass.trim()
            ) {
                return res.status(400).json({
                    message: 'Invalid ticket class.'
                });
            }

            const ticketClass = req.query.ticketClass.trim();
            const db = getDb();
            const validTicketClass = await db.collection('ticketClasses').findOne({
                class: ticketClass
            });

            if (!validTicketClass) {
                return res.status(400).json({
                    message: 'Invalid ticket class.'
                });
            }

            query.ticketClass = ticketClass;
        }

        if (req.query.tripId !== undefined) {
            if (
                typeof req.query.tripId !== 'string' ||
                req.query.tripId.trim().length === 0
            ) {
                return res.status(400).json({
                    message: 'Trip ID must be a non-empty string.'
                });
            }

            query.tripId = req.query.tripId.trim();
        }

        // Status and travel-date filters are deferred until those fields
        // are added to the booking schema.
        // TODO: Add status allowlist validation when booking status exists.
        // TODO: Add travelDateAfter/travelDateBefore validation when travelDate exists.

        const filter = role === 'admin'
            ? {}
            : { 'passengers.email': normalizedEmail };

        if (query.q) {
            const escapedSearch = query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.id = { $regex: `^${escapedSearch}`, $options: 'i' };
        }

        if (query.ticketClass) {
            filter.ticketClass = query.ticketClass;
        }

        if (query.tripId) {
            filter.tripId = query.tripId;
        }

        const { bookings, totalItems } = await getPaginatedBookings({
            filter,
            page,
            limit,
            sort,
            order
        });

        const totalPages = Math.ceil(totalItems / limit);

        return res.status(200).json({
            data: bookings,
            query,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const processBookingRequest = async (req, res, next) => {
    try {
        const booking = await createBooking({
            ...req.body,
            id: generateConfirmationCode(),
            scheduleId: Number(req.body.scheduleId),
            createdAt: new Date()
        });
        return res.redirect(`/trips/bookings/${booking.id}`);
    } catch (error) {
        console.error('Error creating booking:', error);

        error.status = error.name === 'ValidationError' ? 400 : 500;
        return next(error);
    }
};

export const bookingPage = async (req, res, next) => {
    const { scheduleId } = req.params;

    try {
        const db = getDb();
        const schedule = await db.collection('schedules').findOne({ id: Number(scheduleId) });
        if (!schedule) {
            const error = new Error('Schedule not found');
            error.status = 404;
            return next(error);
        }

        const trip = await db.collection('trips').findOne({ id: schedule.tripId });
        if (!trip) {
            const error = new Error('Trip not found');
            error.status = 404;
            return next(error);
        }

        const ticketClasses = await db.collection('ticketClasses').find({}).toArray();
        const ticketOptions = ticketClasses.map((ticketClass) => ({
            class: ticketClass.class,
            name: ticketClass.name,
            price: trip.distance * ticketClass.pricePerKm,
            amenities: ticketClass.amenities,
            description: ticketClass.description
        }));

        return res.render('trips/book', {
            title: 'Book Trip',
            schedule,
            ticketOptions
        });
    } catch (error) {
        return next(error);
    }
};

export const bookingsAdminPage = async (req, res, next) => {
    try {
        const db = getDb();
        const [ticketClasses, schedules] = await Promise.all([
            db.collection('ticketClasses').find({}).sort({ class: 1 }).toArray(),
            db.collection('schedules').find({}, { projection: { id: 1, daysOfWeek: 1 } }).toArray()
        ]);

        return res.render('bookings', {
            title: 'Bookings Admin',
            ticketClasses,
            schedules
        });
    } catch (error) {
        return next(error);
    }
};

export const confirmationPage = async (req, res, next) => {
    try {
        const booking = await getBookingById(req.params.bookingId);
        if (!booking) {
            const error = new Error('Booking not found');
            error.status = 404;
            return next(error);
        }
        return res.render('trips/confirm', {
            title: 'Trip Booking Confirmation',
            booking
        });
    } catch (error) {
        return next(error);
    }
};

export const updateBooking = async (req, res) => {
    try {
        const booking = await getBookingById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (!canManageBooking(req.session.user, booking)) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const updates = {};

        if (req.body.ticketClass !== undefined) {
            const ticketClass = req.body.ticketClass;
            if (typeof ticketClass !== 'string' || !ticketClass.trim()) {
                return res.status(400).json({ message: 'Invalid value for ticketClass' });
            }

            const db = getDb();
            const validTicketClass = await db.collection('ticketClasses').findOne({
                class: ticketClass.trim()
            });
            if (!validTicketClass) {
                return res.status(400).json({ message: 'Invalid value for ticketClass' });
            }

            updates.ticketClass = ticketClass.trim();
        }

        if (req.body.selectedDay !== undefined) {
            const selectedDay = req.body.selectedDay;
            if (typeof selectedDay !== 'string' || !selectedDay.trim()) {
                return res.status(400).json({ message: 'Invalid value for selectedDay' });
            }

            const db = getDb();
            const schedule = await db.collection('schedules').findOne({ id: booking.scheduleId });
            if (!schedule?.daysOfWeek?.includes(selectedDay.trim())) {
                return res.status(400).json({ message: 'Invalid value for selectedDay' });
            }

            updates.selectedDay = selectedDay.trim();
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: 'No valid booking fields provided',
            });
        }

        const updatedBooking = await updateBookingById(req.params.id, updates);

        return res.status(200).json(updatedBooking);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Invalid booking data' });
        }

        console.error('Error updating booking:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteBooking = async (req, res) => {
    try {
        const booking = await getBookingById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (!canManageBooking(req.session.user, booking)) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        await deleteBookingById(req.params.id);

        return res.status(200).json({ message: 'Booking has been deleted' });
    } catch (error) {
        console.error('Error deleting booking:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
