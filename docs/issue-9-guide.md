# Issue #9 — Feature Set 4: Ticket Classes

Hey Stephen 👋 here's how I'd tackle your ticket-classes issue. It's the optional Feature Set 4 (only required for teams of 4+), and it depends on Feature Set 3 (Bookings) since it touches the booking page/controller.

Good news: nearly everything you need already exists on `main` as a pattern. The **Schedules** feature is almost a perfect template — it has the same "day-based filtering via query param" shape. I've linked the exact reference code under each step below, so you can mostly copy the pattern and swap the names.

## First things first

I couldn't pull your work — looks like you haven't pushed yet, so it's only on your machine. Can you do one of these?

- **Best option:** push your branch (even if it's unfinished) and I'll fetch it and pick up from there.
- **Or:** if there's nothing substantial yet, let's just start fresh on a new branch off `main`.

Once that's sorted, get going like this:

```powershell
git stash                          # set aside anything uncommitted
git switch main
git pull origin main
git switch -c 9-ticket-classes     # or check out your branch
```

## How I'd order it — "inside-out"

The data flows **Schema → Seed → Model → Controller → Routes → Swagger → Frontend**. Build it in that order and you can test after every step instead of debugging everything at the end.

### 1. Schema — `src/models/schemas/ticket-classes.js`

**Reference on main:** `src/models/schemas/schedules.js` — note `daysOfWeek: [String]`, that's your `availableDays`.

```js
// src/models/schemas/schedules.js (reference)
import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    tripId: { type: String, required: true, trim: true },
    daysOfWeek: { type: [String], required: true },
    status: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

const schedule = mongoose.model("Schedule", scheduleSchema);
export default schedule;
```

Adapt it to:

```js
// src/models/schemas/ticket-classes.js
import mongoose from "mongoose";

const ticketClassSchema = new mongoose.Schema(
  {
    class: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true },
    pricePerKm: { type: Number, required: true, min: 0 },
    amenities: { type: [String] },
    description: { type: String },
    availableDays: { type: [String] },
  },
  { timestamps: true }
);

const ticketClass = mongoose.model("TicketClass", ticketClassSchema);
export default ticketClass;
```

### 2. Seed data — `src/db/seeds/ticket-classes.json`

Good news — this is mostly done already. `src/db/seeds/ticket-classes.json` exists on `main` and is already wired into `src/db/initialize.js` (it seeds the `ticketClasses` collection). **The only thing missing is the `availableDays` field**, so `getTicketClassesForDay` has something to filter on.

What's there today:

```json
// src/db/seeds/ticket-classes.json (current on main — no availableDays yet)
{
  "class": "standard",
  "name": "Standard Class",
  "pricePerKm": 80,
  "amenities": ["Comfortable seats", "Large windows", "Complimentary tea"],
  "description": "Enjoy scenic views from comfortable seats with complimentary refreshments"
}
```

Add `availableDays` to each entry. Reuse the exact day strings from `src/db/seeds/schedules.json` (`"monday"`, `"tuesday"`, …) so the filter matches:

```json
// src/db/seeds/ticket-classes.json (add this field to each class)
{
  "class": "standard",
  "name": "Standard Class",
  "pricePerKm": 80,
  "amenities": ["Comfortable seats", "Large windows", "Complimentary tea"],
  "description": "Enjoy scenic views from comfortable seats with complimentary refreshments",
  "availableDays": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
}
```

Then re-seed with `npm run db:import` (it runs `initialize.js`, which already inserts `ticketClasses`). No changes needed in `initialize.js` — it's already set up.

### 3. Model functions — `src/models/ticket-classes.js`

**Reference on main:** `src/models/schedules.js` — same `.lean()` convention and query-filter style.

```js
// src/models/schedules.js (reference)
import schedule from "./schemas/schedules.js";

export async function getSchedulesByTripId(tripId, month) {
  // ...validation omitted...
  return schedule.find({ tripId }).lean();
}
```

Adapt it to:

```js
// src/models/ticket-classes.js
import ticketClass from "./schemas/ticket-classes.js";

export async function getAllTicketClasses() {
  return ticketClass.find({}).lean();
}

export async function getTicketClassesForDay(day) {
  return ticketClass.find({ availableDays: day }).lean();
}
```

### 4. API controllers — `src/controllers/ticket-classes.js`

**Reference on main:** `src/controllers/schedules.js` — `try/catch`, reads `req.query`, returns JSON with status codes.

```js
// src/controllers/schedules.js (reference)
import { getSchedulesByTripId } from "../models/schedules.js";

export async function getSchedulesForTrip(req, res) {
  try {
    const { id } = req.params;
    const { month } = req.query;
    const schedules = await getSchedulesByTripId(id, month);
    return res.status(200).json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return res.status(500).json({ error: "Failed to fetch schedules" });
  }
}
```

Adapt it to:

```js
// src/controllers/ticket-classes.js
import {
  getAllTicketClasses as getAll,
  getTicketClassesForDay,
} from "../models/ticket-classes.js";

export async function getAllTicketClasses(req, res) {
  try {
    const { day } = req.query;
    const ticketClasses = day
      ? await getTicketClassesForDay(day)
      : await getAll();
    return res.status(200).json(ticketClasses);
  } catch (error) {
    console.error("Error fetching ticket classes:", error);
    return res.status(500).json({ error: "Failed to fetch ticket classes" });
  }
}
```

### 5. Routes — `src/routes/api-routes.js`

**Reference on main:** the schedules route is already wired the same way.

```js
// src/routes/api-routes.js (reference)
import { getSchedulesForTrip } from '../controllers/schedules.js';
router.get('/trips/:id/schedules', getSchedulesForTrip);
```

Add:

```js
import { getAllTicketClasses } from '../controllers/ticket-classes.js';

// Feature Set 4: Ticket Classes (optional ?day= filter handled in the controller)
router.get('/ticket-classes', getAllTicketClasses);
```

One route with an optional `?day=` is enough — the controller already branches on `req.query.day`.

### 6. Swagger docs — `src/docs/openapi.js` ⚠️ don't skip this

**Reference on main:** the `/api/trips/{id}/schedules` block in `src/docs/openapi.js` — it already shows how to document an array response and a query param.

Heads up: `tests/swagger.test.js` checks that **every** registered route is documented, so `npm test` will fail if you add the route without docs.

```js
/**
 * @openapi
 * /api/ticket-classes:
 *   get:
 *     summary: List ticket classes
 *     description: Returns all ticket classes, or only those available for a given day.
 *     tags:
 *       - Ticket Classes
 *     parameters:
 *       - name: day
 *         in: query
 *         required: false
 *         description: Optional day-of-week filter.
 *         schema:
 *           type: string
 *           example: monday
 *     responses:
 *       '200':
 *         description: An array of ticket-class objects (may be empty).
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   class: { type: string, example: standard }
 *                   name: { type: string, example: Standard }
 *                   pricePerKm: { type: number, example: 0.12 }
 *                   amenities:
 *                     type: array
 *                     items: { type: string }
 *                   availableDays:
 *                     type: array
 *                     items: { type: string }
 *       '500':
 *         description: Unexpected server or database error.
 */
```

### 7. Frontend — `src/views/trips/book.ejs` + client JS in `public/js/main.js`

**Reference on main:** `hookTripSchedules()` in `public/js/main.js` is almost exactly your use case — a `<select>` change triggers a `fetch` with a query param and re-renders. Copy that pattern.

```js
// public/js/main.js — hookTripSchedules (reference, trimmed)
const loadSchedules = async (month) => {
    const url = new URL(`/api/trips/${encodeURIComponent(tripId)}/schedules`, window.location.origin);
    if (month) {
        url.searchParams.set('month', month);
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load schedules (${response.status})`);
    const schedules = await response.json();
    // ...render cards with textContent...
};

monthSelect.addEventListener('change', async () => {
    await loadSchedules(monthSelect.value);
});
loadSchedules();
```

Your version: on day-select change, `fetch('/api/ticket-classes?day=...')`, then enable the returned classes and gray out + `disabled` the rest. Use `textContent` (not `innerHTML`), same as the reference.

### 8. Booking controller refactor

**Reference on main:** `bookingPage` in `src/controllers/bookings.js` already builds the ticket options — but it reads them through the **raw DB driver** instead of a model. Your job is to swap that one call for your new Mongoose model function.

What's there today:

```js
// src/controllers/bookings.js — bookingPage (current on main)
const ticketClasses = await db.collection('ticketClasses').find({}).toArray();
const ticketOptions = ticketClasses.map((ticketClass) => ({
    class: ticketClass.class,
    name: ticketClass.name,
    price: trip.distance * ticketClass.pricePerKm,
    amenities: ticketClass.amenities,
    description: ticketClass.description
}));
```

Refactor it to use your model function (keeps the mapping, drops the raw `db.collection` call):

```js
// src/controllers/bookings.js — bookingPage (refactored)
import { getAllTicketClasses } from '../models/ticket-classes.js';

const ticketClasses = await getAllTicketClasses();
const ticketOptions = ticketClasses.map((ticketClass) => ({
    class: ticketClass.class,
    name: ticketClass.name,
    price: trip.distance * ticketClass.pricePerKm,
    amenities: ticketClass.amenities,
    description: ticketClass.description
}));
```

The page itself (`src/views/trips/book.ejs`) and the booking route (`/trips/booking/:scheduleId` in `src/routes/trips.js`) already exist, so no new wiring is needed here — just the model swap.

### 9. Test & verify (this covers the rubric's "testing steps")

```powershell
npm run lint    # ESLint has to pass (it's in your Test Plan)
npm test        # includes swagger.test.js
npm run dev     # open /api-docs, hit the route, click through the booking page
```

**Reference on main:** `tests/trains.test.js` shows the supertest pattern if you want to add one (not required, but easy):

```js
// tests/trains.test.js (reference)
import request from 'supertest';
import app from '../app.js';

test('returns a successful JSON response', async () => {
  const response = await request(app).get('/api/trains');
  expect(response.status).toBe(200);
  expect(response.body).toBeInstanceOf(Array); // trains wraps in { trains }, yours is a bare array
});
```

Walk through your own Test Plan: `getAllTicketClasses`, `getTicketClassesForDay('monday')`, `GET /api/ticket-classes` and `?day=monday`, switching the day on the booking page, and `/api-docs` both locally **and on Render**.

### 10. Open the PR — with all 4 rubric items

`Closes #9`, a short summary, the list of testing steps, and a link to your walk-through video.

## A couple of thoughts
- This one's **only required if the team is 4+**. If we're a 3-person team, it might not be worth the crunch this close to the deadline — worth a quick check.
- Steps 1–6 (the backend) can be finished and tested without touching the frontend. If time gets tight, that's a solid first milestone to ship.

## Status overview — what's already on `main` vs. what's missing

A fair bit of the groundwork is already in place, so this is smaller than it looks:

| Step | Area | Status on `main` | What's left for you |
|------|------|------------------|---------------------|
| 1 | Schema `ticket-classes.js` | ❌ missing | Create the Mongoose schema (+ `availableDays`) |
| 2 | Seed data | 🟡 partial | Exists & is seeded via `initialize.js`; add `availableDays` to each entry |
| 3 | Model functions | ❌ missing | `getAllTicketClasses()`, `getTicketClassesForDay(day)` |
| 4 | API controller | ❌ missing | `getAllTicketClasses(req, res)` with `?day=` branch |
| 5 | API route | ❌ missing | `GET /api/ticket-classes` in `api-routes.js` |
| 6 | Swagger docs | ❌ missing | Document the route (test enforces this) |
| 7 | Frontend (dynamic) | ❌ missing | Day-select → fetch → enable/disable options |
| 8 | Booking controller | 🟡 partial | `bookingPage` already builds options via raw DB — swap to the model |

**Already done for you:** the `ticketClasses` seed collection + wiring, and the price/options logic in `bookingPage`.
**Core work left:** the model/API layers (steps 3–6), the `availableDays` filtering (steps 1–3), and the dynamic frontend (step 7).

## Only build what's actually missing

The issue reads like a from-scratch build, but a few parts already work on `main`. **Don't rebuild these — they're done:**

- ✅ The `ticketClasses` collection is already seeded (`src/db/seeds/ticket-classes.json` + `src/db/initialize.js`).
- ✅ The booking page already shows ticket options with calculated prices — `bookingPage` in `src/controllers/bookings.js` loads them and passes `ticketOptions` to `book.ejs`.

**So the real work left is only:**

1. The Mongoose **schema + model** — the data currently bypasses any model (step 1, 3).
2. The **`availableDays` field + day filtering** — add the field to the seed data and the `getTicketClassesForDay` logic (steps 2, 3).
3. The **JSON API** `GET /api/ticket-classes` + **Swagger docs** (steps 4–6).
4. The **dynamic frontend** — options are *displayed* today, but not enabled/disabled when the day changes (step 7).
5. A one-line **refactor** of `bookingPage` to read through the new model instead of the raw DB driver (step 8).

Before you start, quickly confirm with the team that nobody else has already covered one of these.

Ping me whenever — happy to pair on any of these steps or take one off your plate.
