
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


const hookTripAdmin = async () => {
    const listEl = document.getElementById('trip-admin-list');
    const form = document.getElementById('trip-admin-form');
    const messageEl = document.getElementById('trip-admin-message');
    const noSelectionEl = document.getElementById('trip-admin-no-selection');
    const schedulesEl = document.getElementById('trip-admin-schedules');
    const cancelButton = document.getElementById('trip-admin-cancel');
    const scheduleDataEl = document.getElementById('trip-admin-schedule-data');

    if (!listEl || !form || !messageEl) return;

    let trips = [];
    let schedules = [];

    try {
        schedules = JSON.parse(scheduleDataEl?.textContent || '[]');
    } catch (error) {
        console.error('Failed to read trip schedules:', error);
    }

    const field = (id) => document.getElementById(id);

    const showMessage = (message, isError = false) => {
        messageEl.textContent = message;
        messageEl.dataset.type = isError ? 'error' : 'success';
    };

    const hideForm = () => {
        form.hidden = true;
        form.reset();
        if (noSelectionEl) noSelectionEl.hidden = false;
        if (schedulesEl) schedulesEl.replaceChildren();
    };

    const renderTrips = () => {
        listEl.replaceChildren();

        if (trips.length === 0) {
            const empty = document.createElement('p');
            empty.textContent = 'No trips found.';
            listEl.appendChild(empty);
            return;
        }

        trips.forEach((trip) => {
            const article = document.createElement('article');
            article.className = 'trip-admin-row';

            const heading = document.createElement('h3');
            heading.textContent = trip.name;

            const details = document.createElement('p');
            details.textContent =
                `${trip.region} | ${trip.startStation} to ${trip.endStation} | ${trip.distance} km`;

            const editButton = document.createElement('button');
            editButton.type = 'button';
            editButton.textContent = 'Edit';
            editButton.dataset.action = 'edit';
            editButton.dataset.id = trip.id;

            const deleteButton = document.createElement('button');
            deleteButton.type = 'button';
            deleteButton.textContent = 'Delete';
            deleteButton.dataset.action = 'delete';
            deleteButton.dataset.id = trip.id;

            article.append(heading, details, editButton, deleteButton);
            listEl.appendChild(article);
        });
    };

    const renderSchedules = (tripId) => {
        schedulesEl.replaceChildren();

        const matchingSchedules = schedules.filter(
            (schedule) => schedule.tripId === tripId
        );

        if (matchingSchedules.length === 0) {
            const empty = document.createElement('p');
            empty.textContent = 'No schedules are associated with this trip.';
            schedulesEl.appendChild(empty);
            return;
        }

        matchingSchedules.forEach((schedule) => {
            const item = document.createElement('p');
            const days = Array.isArray(schedule.daysOfWeek)
                ? schedule.daysOfWeek.join(', ')
                : 'Days not specified';

            item.textContent =
                `Schedule ${schedule.id}: ${schedule.departureTime}–${schedule.arrivalTime}; ${days}; ${schedule.status ? 'Active' : 'Inactive'}`;

            schedulesEl.appendChild(item);
        });
    };

    const editTrip = (trip) => {
        field('trip-id').value = trip.id;
        field('trip-name').value = trip.name || '';
        field('trip-description').value = trip.description || '';
        field('trip-region').value = trip.region || '';
        field('trip-start-station').value = trip.startStation || '';
        field('trip-end-station').value = trip.endStation || '';
        field('trip-duration').value = trip.duration || '';
        field('trip-distance').value = trip.distance ?? '';
        field('trip-highlights').value =
            Array.isArray(trip.highlights) ? trip.highlights.join(', ') : '';
        field('trip-best-season').value = trip.bestSeason || '';
        field('trip-operating-months').value =
            Array.isArray(trip.operatingMonths)
                ? trip.operatingMonths.join(', ')
                : '';
        field('trip-image-url').value = trip.imageUrl || '';

        renderSchedules(trip.id);
        form.hidden = false;
        if (noSelectionEl) noSelectionEl.hidden = true;
        showMessage(`Editing ${trip.name}.`);
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const loadTrips = async () => {
        const response = await fetch('/api/trips');

        if (!response.ok) {
            throw new Error(`Failed to load trips (${response.status}).`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error('Expected a list of trips from the API.');
        }

        trips = data;
        renderTrips();
    };

    listEl.addEventListener('click', async (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;

        const trip = trips.find((item) => item.id === button.dataset.id);
        if (!trip) return;

        if (button.dataset.action === 'edit') {
            editTrip(trip);
            return;
        }

        if (button.dataset.action === 'delete') {
            if (!window.confirm(`Delete the trip "${trip.name}"?`)) return;

            try {
                button.disabled = true;

                const response = await fetch(
                    `/api/trips/${encodeURIComponent(trip.id)}`,
                    { method: 'DELETE' }
                );

                const result = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(result.message || 'Unable to delete trip.');
                }

                trips = trips.filter((item) => item.id !== trip.id);
                renderTrips();
                hideForm();
                showMessage('Trip deleted successfully.');
            } catch (error) {
                showMessage(error.message, true);
                button.disabled = false;
            }
        }
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const tripId = field('trip-id').value;

        const operatingMonths = field('trip-operating-months').value
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean)
            .map(Number);

        const highlights = field('trip-highlights').value
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean);

        if (
            operatingMonths.some(
                (month) => !Number.isInteger(month) || month < 1 || month > 12
            )
        ) {
            showMessage('Operating months must be whole numbers from 1 to 12.', true);
            return;
        }

        const payload = {
            name: field('trip-name').value.trim(),
            description: field('trip-description').value.trim(),
            region: field('trip-region').value.trim(),
            startStation: field('trip-start-station').value,
            endStation: field('trip-end-station').value,
            duration: field('trip-duration').value.trim(),
            distance: Number(field('trip-distance').value),
            highlights,
            bestSeason: field('trip-best-season').value.trim(),
            operatingMonths,
            imageUrl: field('trip-image-url').value.trim()
        };

        if (!payload.name || !payload.region || !payload.startStation ||
            !payload.endStation || !Number.isFinite(payload.distance) ||
            payload.distance < 0) {
            showMessage('Please complete all required fields with valid values.', true);
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');

        try {
            submitButton.disabled = true;

            const response = await fetch(
                `/api/trips/${encodeURIComponent(tripId)}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }
            );

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(result.message || 'Unable to update trip.');
            }

            trips = trips.map((trip) =>
                trip.id === tripId ? result : trip
            );

            renderTrips();
            editTrip(result);
            showMessage('Trip updated successfully.');
        } catch (error) {
            showMessage(error.message, true);
        } finally {
            submitButton.disabled = false;
        }
    });

    cancelButton?.addEventListener('click', hideForm);

    try {
        await loadTrips();
    } catch (error) {
        console.error('Failed to load admin trips:', error);
        showMessage('Unable to load trips. Please try again.', true);
        listEl.textContent = 'Unable to load trips.';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('trip-admin-list')) {
        hookTripAdmin();
    }
    if (document.getElementById('trips-list')) {
        hookTripsCatalog();
    } else {
        hookRegionSorter();
        hookSeasonSorter();
    }
    hookTrainsCatalog();
    hookTripSchedules();
});