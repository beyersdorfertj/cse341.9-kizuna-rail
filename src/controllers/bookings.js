import {
    getAllBookings as FindAllBookings,
} from '../models/bookings.js';

export const getAllBookings = async (req, res) => {
    try {
        const bookings = await FindAllBookings();
        return res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching all bookings:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};