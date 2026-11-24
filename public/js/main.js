
const hookRegionSorter = () => {
    const regionSelect = document.getElementById('region-filter');
    if (regionSelect) {
        regionSelect.addEventListener('change', () => {
            const selectedRegion = regionSelect.value;
            const url = new URL(window.location.href);

            if (selectedRegion && selectedRegion !== 'all') {
                url.searchParams.set('region', selectedRegion);
            } else {
                url.searchParams.delete('region');
            }

            window.location.href = url.toString();
        });
    }
};

const hookSeasonSorter = () => {
    const seasonSelect = document.getElementById('season-filter');
    if (seasonSelect) {
        seasonSelect.addEventListener('change', () => {
            const selectedSeason = seasonSelect.value;
            const url = new URL(window.location.href);

            if (selectedSeason && selectedSeason !== 'all') {
                url.searchParams.set('season', selectedSeason);
            } else {
                url.searchParams.delete('season');
            }

            window.location.href = url.toString();
        });
    }
};

const hookTrainsCatalog = async () => {
    const listEl = document.getElementById('trains-list');
    const templateEl = document.getElementById('train-card-template');
    const loadingEl = document.getElementById('trains-loading');
    const errorEl = document.getElementById('trains-error');

    if (!listEl || !templateEl) {
        return;
    }

    try {
        const response = await fetch('/api/trains');
        if (!response.ok) {
            throw new Error(`Failed to load trains (${response.status})`);
        }

        const payload = await response.json();
        const trains = payload.trains || [];
        const fragment = document.createDocumentFragment();

        trains.forEach((train) => {
            const card = templateEl.content.cloneNode(true);
            const imageEl = card.querySelector('[data-field="image"]');

            imageEl.src = train.imageUrl;
            imageEl.alt = train.imageAlt || `${train.name} train`;

            card.querySelector('[data-field="name"]').textContent = train.name;
            card.querySelector('[data-field="operator"]').textContent = train.operator;
            card.querySelector('[data-field="type"]').textContent = train.type;
            card.querySelector('[data-field="speed"]').textContent = `${train.maxSpeedKmh} km/h`;
            card.querySelector('[data-field="seats"]').textContent = `${train.capacity} seats`;
            card.querySelector('[data-field="power"]').textContent = train.powerSource;
            card.querySelector('[data-field="description"]').textContent = train.description;
            card.querySelector('[data-field="best-for"]').textContent = train.bestFor;

            fragment.appendChild(card);
        });

        listEl.replaceChildren(fragment);
        if (loadingEl) {
            loadingEl.hidden = true;
        }
    } catch (error) {
        if (loadingEl) {
            loadingEl.hidden = true;
        }
        if (errorEl) {
            errorEl.hidden = false;
            errorEl.textContent = 'Unable to load trains right now. Please try again in a moment.';
        }
    }
};

const hookTripSchedules = () => {
    const sectionEl = document.getElementById('trip-schedules');
    const headingEl = document.getElementById('schedules-heading');
    const listEl = document.getElementById('schedules-list');
    const templateEl = document.getElementById('schedule-card-template');
    const loadingEl = document.getElementById('schedules-loading');
    const errorEl = document.getElementById('schedules-error');
    const emptyEl = document.getElementById('schedules-empty');
    const monthSelect = document.getElementById('schedule-month');

    if (!sectionEl || !listEl || !templateEl) {
        return;
    }

    const tripId = sectionEl.dataset.tripId;

    const loadSchedules = async (month) => {
        if (headingEl) {
            const selectedOption = monthSelect && monthSelect.options[monthSelect.selectedIndex];
            const selectedMonth = selectedOption ? selectedOption.textContent : 'All months';
            headingEl.textContent = `Available Schedules - ${selectedMonth}`;
        }

        if (loadingEl) {
            loadingEl.hidden = false;
        }
        if (errorEl) {
            errorEl.hidden = true;
        }
        if (emptyEl) {
            emptyEl.hidden = true;
        }
        listEl.replaceChildren();

        try {
            const url = new URL(`/api/trips/${encodeURIComponent(tripId)}/schedules`, window.location.origin);
            if (month) {
                url.searchParams.set('month', month);
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to load schedules (${response.status})`);
            }

            const schedules = await response.json();
            if (loadingEl) {
                loadingEl.hidden = true;
            }

            if (!Array.isArray(schedules) || schedules.length === 0) {
                if (emptyEl) {
                    emptyEl.hidden = false;
                }
                return;
            }

            const fragment = document.createDocumentFragment();

            schedules.forEach((schedule) => {
                const card = templateEl.content.cloneNode(true);

                card.querySelector('[data-field="departure"]').textContent = schedule.departureTime;
                card.querySelector('[data-field="arrival"]').textContent = schedule.arrivalTime;

                const daysEl = card.querySelector('[data-field="days"]');
                (schedule.daysOfWeek || []).forEach((day) => {
                    const badge = document.createElement('span');
                    badge.className = 'day-badge';
                    badge.textContent = day.substring(0, 3);
                    daysEl.appendChild(badge);
                });

                card.querySelector('[data-field="book-link"]').href = `/trips/booking/${schedule.id}`;

                fragment.appendChild(card);
            });

            listEl.replaceChildren(fragment);
        } catch (error) {
            if (loadingEl) {
                loadingEl.hidden = true;
            }
            if (errorEl) {
                errorEl.hidden = false;
                errorEl.textContent = 'Unable to load schedules right now. Please try again in a moment.';
            }
        }
    };

    if (monthSelect) {
        monthSelect.addEventListener('change', async () => {
            await loadSchedules(monthSelect.value);
        });
    }

    loadSchedules();
};

const hookTripsCatalog = async () => {
    const listEl = document.getElementById('trips-list');
    const templateEl = document.getElementById('trip-card-template');
    const loadingEl = document.getElementById('trips-loading');
    const errorEl = document.getElementById('trips-error');
    const emptyEl = document.getElementById('trips-empty');
    const regionSelect = document.getElementById('region-filter');
    const seasonSelect = document.getElementById('season-filter');
    if (!listEl || !templateEl) return;

    try {
        if (!regionSelect || !seasonSelect) {
            throw new Error('Trip filters not found in page');
        }
        const response = await fetch('/api/trips');
        if (!response.ok) throw new Error(`Failed to load trips (${response.status})`);
        const trips = await response.json();
        if (!Array.isArray(trips)) throw new Error('Expected a JSON array from /api/trips');

        const addOptions = (select, values) => {
            [...new Set(values.filter(Boolean))].sort().forEach((value) => {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = value.charAt(0).toUpperCase() + value.slice(1);
                select.appendChild(option);
            });
        };
        addOptions(regionSelect, trips.map((trip) => trip.region));
        addOptions(seasonSelect, trips.map((trip) => trip.bestSeason));

        const params = new URLSearchParams(window.location.search);
        regionSelect.value = params.get('region') || 'all';
        seasonSelect.value = params.get('season') || 'all';
        if (!regionSelect.value) regionSelect.value = 'all';
        if (!seasonSelect.value) seasonSelect.value = 'all';

        const renderTrips = () => {
            const selectedRegion = regionSelect.value;
            const selectedSeason = seasonSelect.value;
            const filteredTrips = trips.filter((trip) =>
                (selectedRegion === 'all' || trip.region === selectedRegion) &&
                (selectedSeason === 'all' || trip.bestSeason === selectedSeason)
            );
            const fragment = document.createDocumentFragment();

            filteredTrips.forEach((trip) => {
                const card = templateEl.content.cloneNode(true);
                const setField = (field, value) => {
                    const element = card.querySelector(`[data-field="${field}"]`);
                    if (element) element.textContent = value ?? '';
                };
                setField('name', trip.name);
                setField('region', trip.region);
                setField('startStation', trip.startStation);
                setField('endStation', trip.endStation);
                setField('duration', trip.duration);
                setField('distance', trip.distance);
                setField('description', trip.description);

                const cardEl = card.querySelector('.route-card');
                if (cardEl && trip.region) cardEl.classList.add(trip.region);

                const seasonEl = card.querySelector('[data-field="bestSeason"]');
                if (seasonEl) {
                    seasonEl.textContent = `Best in ${trip.bestSeason || 'any season'}`;
                    if (trip.bestSeason) seasonEl.classList.add(`season-${trip.bestSeason}`);
                }

                const highlightsEl = card.querySelector('[data-field="highlights"]');
                if (highlightsEl && Array.isArray(trip.highlights)) {
                    trip.highlights.forEach((highlight) => {
                        const tag = document.createElement('span');
                        tag.className = 'highlight-tag';
                        tag.textContent = highlight;
                        highlightsEl.appendChild(tag);
                    });
                }

                const detailsLink = card.querySelector('[data-field="detailsLink"]');
                if (detailsLink) {
                    const tripId = trip.id ?? trip._id;
                    if (tripId != null) {
                        detailsLink.href = `/trips/${encodeURIComponent(String(tripId))}`;
                    } else {
                        detailsLink.removeAttribute('href');
                    }
                }

                fragment.appendChild(card);
            });

            listEl.replaceChildren(fragment);
            if (emptyEl) emptyEl.hidden = filteredTrips.length !== 0;

            const url = new URL(window.location.href);
            [['region', selectedRegion], ['season', selectedSeason]].forEach(([key, value]) => {
                if (value && value !== 'all') url.searchParams.set(key, value);
                else url.searchParams.delete(key);
            });
            window.history.replaceState({}, '', url.toString());
        };

        regionSelect.addEventListener('change', renderTrips);
        seasonSelect.addEventListener('change', renderTrips);
        renderTrips();
        if (loadingEl) loadingEl.hidden = true;
    } catch (error) {
        console.error('Failed to load trips:', error);
        if (loadingEl) loadingEl.hidden = true;
        if (errorEl) {
            errorEl.hidden = false;
            errorEl.textContent = 'Unable to load trips right now. Please try again in a moment.';
        }
    }
};


const hookUserBookings = async () => {
    const listEl = document.getElementById('bookings-list');

    if (!listEl) {
        return;
    }

    try {
        const response = await fetch('/api/my-bookings');

        if (!response.ok) {
            throw new Error(`Failed to load bookings (${response.status})`);
        }

        const bookings = await response.json();
        listEl.replaceChildren();

        if (!Array.isArray(bookings) || bookings.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.textContent = 'You do not have any bookings yet.';
            listEl.appendChild(emptyMessage);
            return;
        }

        bookings.forEach((booking) => {
            const card = document.createElement('article');
            card.className = 'dashboard-booking-card';

            const heading = document.createElement('h3');
            heading.textContent = `Booking ${booking.id}`;

            const trip = document.createElement('p');
            trip.textContent = `Trip: ${booking.tripId}`;

            const schedule = document.createElement('p');
            schedule.textContent = `Schedule: ${booking.scheduleId}`;

            const travelDay = document.createElement('p');
            travelDay.textContent = `Travel day: ${booking.selectedDay}`;

            const ticketClass = document.createElement('p');
            ticketClass.textContent = `Ticket class: ${booking.ticketClass}`;

            card.append(
                heading,
                trip,
                schedule,
                travelDay,
                ticketClass
            );

            listEl.appendChild(card);
        });
    } catch (error) {
        console.error('Failed to load user bookings:', error);

        listEl.replaceChildren();

        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'Unable to load your bookings right now. Please try again later.';
        listEl.appendChild(errorMessage);
    }
};


document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('trips-list')) {
        hookTripsCatalog();
    } else {
        hookRegionSorter();
        hookSeasonSorter();
    }

    hookTrainsCatalog();
    hookTripSchedules();
    hookUserBookings();
});
