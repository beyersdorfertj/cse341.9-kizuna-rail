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

export async function getBookingsByPassengerEmail(email) {
    return Booking.find({ 'passengers.email': email }).sort({ createdAt: -1 }).lean();
}

export async function updateBookingById(bookingId, updates) {
    return Booking.findOneAndUpdate(
        { id: bookingId },
        { $set: updates },
        { new: true, runValidators: true }
    ).lean();
}

export async function deleteBookingById(bookingId) {
    return Booking.findOneAndDelete({ id: bookingId }).lean();
}


export async function getPaginatedBookings({ filter = {}, page, limit, sort, order }) {
    const skip = (page - 1) * limit;
    const sortOptions = { [sort]: order === 'asc' ? 1 : -1 };

    const [bookings, totalItems] = await Promise.all([
        Booking.find(filter).sort(sortOptions).skip(skip).limit(limit).lean(),
        Booking.countDocuments(filter)
    ]);

    return { bookings, totalItems };
}
