import bookings from './schemas/bookings.js';

export async function createBooking(bookingData) {
    try {
        const newBooking = new bookings(bookingData);
        await newBooking.save();
        return newBooking;
    } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
    }
};

export async function getAllBookings() {
    try {
        const allBookings = await bookings.find();
        return allBookings;
    } catch (error) {
        console.error('Error fetching all bookings:', error);
        throw error;
    }
};

export async function getBookingById(bookingId) {
    try {
        const booking = await bookings.findOne({ id: bookingId });
        return booking;
    } catch (error) {
        console.error('Error fetching booking by ID:', error);
        throw error;
    }
};