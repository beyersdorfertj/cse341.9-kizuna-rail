import { getRoleByName } from '../models/roles.js';
import {
    deleteUserById,
    getPaginatedUsers,
    getUserById,
    updateUserById
} from '../models/users.js';

const EDITABLE_FIELDS = ['displayName', 'username', 'email'];
const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

// Shared pagination conventions: page, limit, sort, order.
const SORT_FIELDS = ['displayName', 'email', 'role', 'createdAt'];
const SORT_ORDERS = ['asc', 'desc'];
const MAX_LIMIT = 50;
const POSITIVE_INTEGER_PATTERN = /^\d+$/;

// Admins can manage anyone; everyone else can only manage themselves.
const canManageUser = (currentUser, id) => currentUser.role === 'admin' || currentUser.id === id;

// Query values are untrusted strings (or arrays if repeated); validate before touching the database.
const parsePagination = (query) => {
    const errors = [];
    const read = (name, fallback) => (query[name] === undefined ? fallback : query[name]);

    const rawPage = read('page', '1');
    const rawLimit = read('limit', '10');
    const sort = read('sort', 'displayName');
    const order = read('order', 'asc');

    const page = typeof rawPage === 'string' && POSITIVE_INTEGER_PATTERN.test(rawPage) ? Number(rawPage) : NaN;
    if (!Number.isSafeInteger(page) || page < 1) {
        errors.push({ field: 'page', message: 'page must be an integer greater than or equal to 1' });
    }

    const limit = typeof rawLimit === 'string' && POSITIVE_INTEGER_PATTERN.test(rawLimit) ? Number(rawLimit) : NaN;
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
        errors.push({ field: 'limit', message: `limit must be an integer between 1 and ${MAX_LIMIT}` });
    }

    if (typeof sort !== 'string' || !SORT_FIELDS.includes(sort)) {
        errors.push({ field: 'sort', message: `sort must be one of: ${SORT_FIELDS.join(', ')}` });
    }

    if (typeof order !== 'string' || !SORT_ORDERS.includes(order)) {
        errors.push({ field: 'order', message: `order must be one of: ${SORT_ORDERS.join(', ')}` });
    }

    return { errors, page, limit, sort, order };
};

const buildPagination = (page, limit, totalItems) => {
    const totalPages = Math.ceil(totalItems / limit);
    return {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
    };
};

export async function getUsers(req, res) {
    try {
        const currentUser = req.session.user;
        const { errors, page, limit, sort, order } = parsePagination(req.query);

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        if (currentUser.role === 'admin') {
            const { users, totalItems } = await getPaginatedUsers({ page, limit, sort, order });
            return res.status(200).json({ data: users, pagination: buildPagination(page, limit, totalItems) });
        }

        // Non-admins only ever see their own account, in the same response shape.
        const user = await getUserById(currentUser.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { passwordHash, ...safeUser } = user;
        return res.status(200).json({ data: [safeUser], pagination: buildPagination(1, limit, 1) });
    } catch (error) {
        console.error('Failed to retrieve users:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function updateUser(req, res) {
    try {
        const { id } = req.params;
        const currentUser = req.session.user;
        const body = req.body ?? {};

        if (!OBJECT_ID_PATTERN.test(id)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        if (!canManageUser(currentUser, id)) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // Only copy allowlisted fields so nothing else (like passwordHash) can be set.
        const updates = {};

        for (const field of EDITABLE_FIELDS) {
            if (body[field] === undefined) continue;

            if (typeof body[field] !== 'string' || !body[field].trim()) {
                return res.status(400).json({ error: `${field} must be a non-empty string` });
            }

            updates[field] = body[field].trim();
        }

        if (body.role !== undefined) {
            if (currentUser.role !== 'admin') {
                return res.status(403).json({ error: 'Only admins can change roles' });
            }

            if (typeof body.role !== 'string' || !(await getRoleByName(body.role))) {
                return res.status(400).json({ error: 'Invalid role' });
            }

            updates.role = body.role;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        const updatedUser = await updateUserById(id, updates);

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Keep the session in sync when users edit their own account.
        if (currentUser.id === id) {
            req.session.user = {
                ...currentUser,
                displayName: updatedUser.displayName,
                username: updatedUser.username,
                role: updatedUser.role
            };
        }

        return res.status(200).json(updatedUser);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }

        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }

        console.error('Failed to update user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function deleteUser(req, res) {
    try {
        const { id } = req.params;
        const currentUser = req.session.user;

        if (!OBJECT_ID_PATTERN.test(id)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        if (!canManageUser(currentUser, id)) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const deletedUser = await deleteUserById(id);

        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Log users out when they delete their own account.
        if (currentUser.id === id) {
            await new Promise((resolve, reject) => {
                req.session.destroy((error) => (error ? reject(error) : resolve()));
            });
        }

        return res.status(204).end();
    } catch (error) {
        console.error('Failed to delete user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
