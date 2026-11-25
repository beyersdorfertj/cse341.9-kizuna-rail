import { beforeEach, describe, expect, test } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../app.js';
import User from '../src/models/schemas/users.js';
import Booking from '../src/models/schemas/bookings.js';

const password = 'test-password-123';

async function createAccount(role, email) {
    const passwordHash = await bcrypt.hash(password, 4);

    await User.create({
        displayName: role === 'admin' ? 'Test Admin' : 'Test Passenger',
        username: `${role}-${Date.now()}-${Math.random()}`,
        email,
        passwordHash,
        role
    });

    const agent = request.agent(app);

    const loginResponse = await agent
        .post('/login')
        .type('form')
        .send({
            username: email,
            password
        });

    expect(loginResponse.status).toBe(302);

    return agent;
}

function bookingData(id, options = {}) {
    return {
        id,
        scheduleId: options.scheduleId ?? 1,
        tripId: options.tripId ?? 'tokyo-osaka',
        ticketClass: options.ticketClass ?? 'Standard',
        selectedDay: 'Monday',
        passengers: [
            {
                firstName: 'Test',
                lastName: 'Passenger',
                email: options.email ?? 'passenger@example.com',
                phone: '+81123456789'
            }
        ],
        createdAt: options.createdAt ?? new Date('2026-01-01T10:00:00Z')
    };
}

describe('GET /api/bookings pagination', () => {
    let adminAgent;

    beforeEach(async () => {
        adminAgent = await createAccount('admin', 'admin@example.com');
    });

    test('requires authentication', async () => {
        const response = await request(app).get('/api/bookings');

        expect(response.status).toBe(401);
    });

    test('uses default page and limit and returns pagination metadata', async () => {
        const bookings = Array.from({ length: 12 }, (_, index) =>
            bookingData(`booking-${index + 1}`, {
                createdAt: new Date(`2026-01-${String(index + 1).padStart(2, '0')}T10:00:00Z`)
            })
        );

        await Booking.insertMany(bookings);

        const response = await adminAgent.get('/api/bookings');

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(10);
        expect(response.body.pagination).toEqual({
            page: 1,
            limit: 10,
            totalItems: 12,
            totalPages: 2,
            hasNextPage: true,
            hasPreviousPage: false
        });

        expect(response.body.data[0].id).toBe('booking-12');
    });

    test('returns the requested page and limit', async () => {
        await Booking.insertMany(
            Array.from({ length: 12 }, (_, index) =>
                bookingData(`booking-${index + 1}`, {
                    createdAt: new Date(`2026-02-${String(index + 1).padStart(2, '0')}T10:00:00Z`)
                })
            )
        );

        const response = await adminAgent.get('/api/bookings?page=2&limit=5');

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(5);
        expect(response.body.pagination).toEqual({
            page: 2,
            limit: 5,
            totalItems: 12,
            totalPages: 3,
            hasNextPage: true,
            hasPreviousPage: true
        });
    });

    test('returns the final page with the correct metadata', async () => {
        await Booking.insertMany(
            Array.from({ length: 12 }, (_, index) =>
                bookingData(`booking-${index + 1}`)
            )
        );

        const response = await adminAgent.get('/api/bookings?page=2&limit=10');

        expect(response.status).toBe(200);
        expect(response.body.data).toHaveLength(2);
        expect(response.body.pagination.hasNextPage).toBe(false);
        expect(response.body.pagination.hasPreviousPage).toBe(true);
    });

    test('sorts bookings by an allowed field in ascending order', async () => {
        await Booking.insertMany([
            bookingData('booking-b', { tripId: 'trip-b' }),
            bookingData('booking-a', { tripId: 'trip-a' }),
            bookingData('booking-c', { tripId: 'trip-c' })
        ]);

        const response = await adminAgent.get(
            '/api/bookings?sort=tripId&order=asc'
        );

        expect(response.status).toBe(200);
        expect(response.body.data.map((booking) => booking.tripId)).toEqual([
            'trip-a',
            'trip-b',
            'trip-c'
        ]);
    });

    test.each([
        ['page', '0'],
        ['page', '-1'],
        ['page', 'abc'],
        ['limit', '0'],
        ['limit', '51'],
        ['limit', 'abc'],
        ['sort', 'password'],
        ['order', 'sideways']
    ])('rejects invalid %s value: %s', async (parameter, value) => {
        const response = await adminAgent.get(
            `/api/bookings?${parameter}=${encodeURIComponent(value)}`
        );

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message');
    });

    test('allows admins to see bookings belonging to different passengers', async () => {
        await Booking.insertMany([
            bookingData('booking-one', { email: 'one@example.com' }),
            bookingData('booking-two', { email: 'two@example.com' })
        ]);

        const response = await adminAgent.get('/api/bookings');

        expect(response.status).toBe(200);
        expect(response.body.pagination.totalItems).toBe(2);
    });

    test('restricts passengers to bookings associated with their email', async () => {
        await Booking.insertMany([
            bookingData('own-booking', { email: 'passenger@example.com' }),
            bookingData('other-booking', { email: 'other@example.com' })
        ]);

        const passengerAgent = await createAccount(
            'user',
            'passenger@example.com'
        );

        const response = await passengerAgent.get('/api/bookings');

        expect(response.status).toBe(200);
        expect(response.body.pagination.totalItems).toBe(1);
        expect(response.body.data.map((booking) => booking.id)).toEqual([
            'own-booking'
        ]);
    });
});
