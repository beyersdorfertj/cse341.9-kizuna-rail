import {
    getAllBookings as FindAllBookings,
} from '../models/bookings.js';
import { getDb } from '../db/connect.js';
import { generateConfirmationCode } from '../includes/helpers.js';

export const getAllBookings = async (req, res) => {
    try {
        const bookings = await FindAllBookings();
        return res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching all bookings:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const processBookingRequest = async (req, res) => {
    const booking = {
        id: generateConfirmationCode(),
        createdAt: new Date().toISOString(),
        ...req.body
    };
    await getDb().collection('bookings').insertOne(booking);

    res.redirect(`/trips/booking/${booking.id}`);
};

export const bookingPage = async (req, res) => {
    const { scheduleId } = req.params;

    const db = getDb();
    const schedule = await db.collection('schedules').findOne({ id: Number(scheduleId) });
    const trip = await db.collection('trips').findOne({ id: schedule.tripId });
    const ticketClasses = await db.collection('ticketClasses').find({}).toArray();
    const ticketOptions = ticketClasses.map((ticketClass) => ({
        class: ticketClass.class,
        name: ticketClass.name,
        price: trip.distance * ticketClass.pricePerKm,
        amenities: ticketClass.amenities,
        description: ticketClass.description
    }));

    res.render('trips/book', {
        title: 'Book Trip',
        schedule,
        ticketOptions
    });
};