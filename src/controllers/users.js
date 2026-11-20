import { getRoleByName } from '../models/roles.js';
import {
    deleteUserById,
    getAllUsers,
    getUserById,
    updateUserById
} from '../models/users.js';

const EDITABLE_FIELDS = ['displayName', 'username', 'email'];
const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

// Admins can manage anyone; everyone else can only manage themselves.
const canManageUser = (currentUser, id) => currentUser.role === 'admin' || currentUser.id === id;

export async function getUsers(req, res) {
    try {
        const currentUser = req.session.user;

        if (currentUser.role === 'admin') {
            const users = await getAllUsers();
            return res.status(200).json(users);
        }

        const user = await getUserById(currentUser.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { passwordHash, ...safeUser } = user;
        return res.status(200).json([safeUser]);
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
