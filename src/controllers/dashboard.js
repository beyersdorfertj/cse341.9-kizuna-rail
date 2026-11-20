
import { getUserBookings } from '../models/dashboard.js';

/**
 * Render the standard user dashboard.
 */
export function dashboardPage(req, res) {
    res.render('dashboard', {
        title: 'User Dashboard'
    });
}

/**
 * Return bookings belonging to the authenticated user.
 */
export async function getMyBookings(req, res) {
    try {
        const userId = req.session.user.id;
        const bookings = await getUserBookings(userId);

        return res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching user bookings:', error);

        return res.status(500).json({
            message: 'Unable to retrieve your bookings.'
        });
    }
}
