import Booking from './schemas/bookings.js';

export async function createBooking(bookingData) {
    try {
        const newBooking = new Booking(bookingData);
        await newBooking.save();
        return newBooking;
    } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
    }
};

export async function getAllBookings() {
    return Booking.find({}).sort({ createdAt: -1 }).lean();
};

export async function getBookingById(bookingId) {
    return Booking.findOne({ id: bookingId }).lean();
};
