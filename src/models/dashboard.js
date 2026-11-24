
import user from './schemas/users.js';
import booking from './schemas/bookings.js';

/**
 * Get bookings associated with the authenticated user.
 */
export async function getUserBookings(userId) {
    const currentUser = await user.findById(userId).select('email').lean();

    if (!currentUser) {
        throw new Error('User not found');
    }

    const escapedEmail = currentUser.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const emailRegex = new RegExp(`^${escapedEmail}$`, 'i');

    const bookings = await booking.find({
        'passengers.email': { $regex: emailRegex }
    })
        .select('id tripId scheduleId ticketClass selectedDay createdAt')
        .lean();

    return bookings;
}
