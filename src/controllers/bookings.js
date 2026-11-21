import {
    getAllBookings as FindAllBookings,
    createBooking,
    getBookingById,
} from '../models/bookings.js';
import { getDb } from '../db/connect.js';
import { getAllTicketClasses } from '../models/ticket-classes.js';
import { generateConfirmationCode } from '../includes/helpers.js';

export const getAllBookings = async (req, res) => {
    try {
        const bookings = await FindAllBookings();
        return res.status(200).json( bookings );
    } catch (error) {
        console.error('Error fetching all bookings:', error);
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

        const ticketClasses = await getAllTicketClasses();
        const ticketOptions = ticketClasses.map((ticketClass) => ({
            class: ticketClass.class,
            name: ticketClass.name,
            price: trip.distance * ticketClass.pricePerKm,
            amenities: ticketClass.amenities,
            description: ticketClass.description,
            availableDays: ticketClass.availableDays
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

export const bookingsAdminPage = async (req, res) => {
    res.render('bookings', {
        title: 'Bookings Admin'
    });
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
